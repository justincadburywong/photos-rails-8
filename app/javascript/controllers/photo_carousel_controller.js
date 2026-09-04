import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["currentImage", "incomingImage", "counter"]
  static values = {
    albumId: String,
    photoId: String
  }

  connect() {
    this.photos = []
    this.currentIndex = 0
    this.isAnimating = false
    this.touchStartX = null
    this.touchStartY = null

    this.setupKeyboardNavigation()
    this.setupTouchNavigation()
    this.loadPhotos()
  }

  disconnect() {
    this.removeKeyboardNavigation()
    this.removeTouchNavigation()
  }

  loadPhotos() {
    fetch(`/albums/${this.albumIdValue}/photos.json`)
      .then(response => response.json())
      .then(data => {
        this.photos = data.filter(photo => photo && photo.image_url)
        this.currentIndex = Math.max(0, this.photos.findIndex(photo => photo.id.toString() === this.photoIdValue))
        this.syncCurrentPhoto()
        this.updateCounter()
        this.prefetchNeighbors()
      })
      .catch(error => console.error('Error loading photos:', error))
  }

  setupKeyboardNavigation() {
    this.handleKeydown = this.handleKeydown.bind(this)
    document.addEventListener('keydown', this.handleKeydown)
  }

  removeKeyboardNavigation() {
    document.removeEventListener('keydown', this.handleKeydown)
  }

  setupTouchNavigation() {
    this.handleTouchStart = this.handleTouchStart.bind(this)
    this.handleTouchEnd = this.handleTouchEnd.bind(this)
    
    this.element.addEventListener('touchstart', this.handleTouchStart, { passive: true })
    this.element.addEventListener('touchend', this.handleTouchEnd, { passive: true })
  }

  removeTouchNavigation() {
    this.element.removeEventListener('touchstart', this.handleTouchStart)
    this.element.removeEventListener('touchend', this.handleTouchEnd)
  }

  handleTouchStart(event) {
    if (!event.touches || event.touches.length === 0) return

    this.touchStartX = event.touches[0].clientX
    this.touchStartY = event.touches[0].clientY
  }

  handleTouchEnd(event) {
    if (this.touchStartX == null || this.touchStartY == null) {
      return
    }

    if (!event.changedTouches || event.changedTouches.length === 0) {
      return
    }

    const touchEndX = event.changedTouches[0].clientX
    const touchEndY = event.changedTouches[0].clientY
    const diffX = this.touchStartX - touchEndX
    const diffY = this.touchStartY - touchEndY

    this.touchStartX = null
    this.touchStartY = null

    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
      if (diffX > 0) {
        this.nextPhoto()
      } else {
        this.previousPhoto()
      }
    }
  }

  handleKeydown(event) {
    if (event.key === 'ArrowLeft') {
      this.previousPhoto()
      event.preventDefault()
    } else if (event.key === 'ArrowRight') {
      this.nextPhoto()
      event.preventDefault()
    }
  }

  previousPhoto() {
    this.navigateByOffset(-1)
  }

  nextPhoto() {
    this.navigateByOffset(1)
  }

  navigateByOffset(offset) {
    if (!this.photos.length || this.isAnimating) return

    const nextIndex = this.currentIndex + offset
    if (nextIndex < 0 || nextIndex >= this.photos.length) return

    this.showPhoto(nextIndex, offset)
  }

  updateCounter() {
    if (this.hasCounterTarget && this.photos.length > 0) {
      this.counterTarget.textContent = `${this.currentIndex + 1} / ${this.photos.length}`
    }
  }

  syncCurrentPhoto() {
    const photo = this.photos[this.currentIndex]
    if (!photo || !this.hasCurrentImageTarget) return

    this.currentImageTarget.src = photo.image_url
    this.currentImageTarget.alt = photo.title || 'Photo'
    this.prefetchNeighbors()
  }

  showPhoto(nextIndex, direction) {
    const photo = this.photos[nextIndex]
    if (!photo || !this.hasCurrentImageTarget || !this.hasIncomingImageTarget) return

    const currentImage = this.currentImageTarget
    const incomingImage = this.incomingImageTarget
    this.isAnimating = true

    this.preloadImage(photo.image_url).then(() => {
      const finish = () => {
        if (!this.isAnimating) return

        currentImage.src = photo.image_url
        currentImage.alt = photo.title || 'Photo'
        currentImage.style.opacity = '1'
        currentImage.style.transform = 'translateX(0)'

        incomingImage.style.display = 'none'
        incomingImage.style.opacity = '0'
        incomingImage.style.transform = 'translateX(0)'

        this.currentIndex = nextIndex
        this.photoIdValue = photo.id.toString()
        this.updateCounter()
        this.prefetchNeighbors()
        this.isAnimating = false
      }

      incomingImage.src = photo.image_url
      incomingImage.alt = photo.title || 'Photo'
      incomingImage.style.display = 'block'
      incomingImage.style.opacity = '0'
      incomingImage.style.transform = direction > 0 ? 'translateX(100%)' : 'translateX(-100%)'

      currentImage.style.transition = 'transform 280ms ease, opacity 280ms ease'
      incomingImage.style.transition = 'transform 280ms ease, opacity 280ms ease'

      const onTransitionEnd = () => {
        incomingImage.removeEventListener('transitionend', onTransitionEnd)
        clearTimeout(this.transitionFallback)
        finish()
      }

      incomingImage.addEventListener('transitionend', onTransitionEnd, { once: true })
      this.transitionFallback = setTimeout(() => {
        if (this.isAnimating) finish()
      }, 320)

      requestAnimationFrame(() => {
        currentImage.style.opacity = '0'
        currentImage.style.transform = direction > 0 ? 'translateX(-12%)' : 'translateX(12%)'
        incomingImage.style.opacity = '1'
        incomingImage.style.transform = 'translateX(0)'
      })
    })
  }

  prefetchNeighbors() {
    this.prefetchPhoto(this.currentIndex - 1)
    this.prefetchPhoto(this.currentIndex + 1)
  }

  prefetchPhoto(index) {
    const photo = this.photos[index]
    if (!photo || !photo.image_url) return

    const image = new Image()
    image.src = photo.image_url
  }

  preloadImage(url) {
    return new Promise(resolve => {
      const image = new Image()
      image.onload = resolve
      image.onerror = resolve
      image.src = url
    })
  }
}
