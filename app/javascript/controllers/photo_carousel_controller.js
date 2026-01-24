import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["image", "title", "description", "counter"]
  static values = {
    albumId: String,
    photoId: String,
    photoIds: Array
  }

  connect() {
    this.loadPhotoIds()
    this.setupKeyboardNavigation()
    this.setupTouchNavigation()
    this.updateCounter()
  }

  disconnect() {
    this.removeKeyboardNavigation()
    this.removeTouchNavigation()
  }

  loadPhotoIds() {
    // Get all photo IDs from the album
    fetch(`/albums/${this.albumIdValue}/photos.json`)
      .then(response => response.json())
      .then(data => {
        this.photoIdsValue = data.map(photo => photo.id.toString())
        this.updateCounter()
      })
      .catch(error => console.error('Error loading photo IDs:', error))
  }

  setupKeyboardNavigation() {
    this.handleKeydown = this.handleKeydown.bind(this)
    document.addEventListener('keydown', this.handleKeydown)
  }

  removeKeyboardNavigation() {
    document.removeEventListener('keydown', this.handleKeydown)
  }

  setupTouchNavigation() {
    this.touchStartX = 0
    this.touchEndX = 0
    this.touchStartY = 0
    this.touchEndY = 0
    
    this.handleTouchStart = this.handleTouchStart.bind(this)
    this.handleTouchMove = this.handleTouchMove.bind(this)
    this.handleTouchEnd = this.handleTouchEnd.bind(this)
    
    this.element.addEventListener('touchstart', this.handleTouchStart, { passive: true })
    this.element.addEventListener('touchmove', this.handleTouchMove, { passive: true })
    this.element.addEventListener('touchend', this.handleTouchEnd, { passive: true })
  }

  removeTouchNavigation() {
    this.element.removeEventListener('touchstart', this.handleTouchStart)
    this.element.removeEventListener('touchmove', this.handleTouchMove)
    this.element.removeEventListener('touchend', this.handleTouchEnd)
  }

  handleTouchStart(event) {
    this.touchStartX = event.touches[0].clientX
    this.touchStartY = event.touches[0].clientY
  }

  handleTouchMove(event) {
    // Prevent default only for horizontal swipes to allow vertical scrolling
    const touchX = event.touches[0].clientX
    const touchY = event.touches[0].clientY
    const diffX = Math.abs(touchX - this.touchStartX)
    const diffY = Math.abs(touchY - this.touchStartY)
    
    if (diffX > diffY) {
      event.preventDefault()
    }
  }

  handleTouchEnd(event) {
    if (!this.touchStartX || !this.touchStartY) {
      return
    }

    this.touchEndX = event.changedTouches[0].clientX
    this.touchEndY = event.changedTouches[0].clientY

    this.handleSwipeGesture()
    
    // Reset touch coordinates
    this.touchStartX = 0
    this.touchStartY = 0
    this.touchEndX = 0
    this.touchEndY = 0
  }

  handleSwipeGesture() {
    const diffX = this.touchStartX - this.touchEndX
    const diffY = this.touchStartY - this.touchEndY
    const minSwipeDistance = 50

    // Check if it's a horizontal swipe (more horizontal than vertical movement)
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > minSwipeDistance) {
      if (diffX > 0) {
        // Swipe left - go to next photo
        this.nextPhoto()
      } else {
        // Swipe right - go to previous photo
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
    const currentIndex = this.photoIdsValue.indexOf(this.photoIdValue)
    if (currentIndex > 0) {
      const previousId = this.photoIdsValue[currentIndex - 1]
      this.navigateToPhoto(previousId)
    }
  }

  nextPhoto() {
    const currentIndex = this.photoIdsValue.indexOf(this.photoIdValue)
    if (currentIndex < this.photoIdsValue.length - 1) {
      const nextId = this.photoIdsValue[currentIndex + 1]
      this.navigateToPhoto(nextId)
    }
  }

  navigateToPhoto(photoId) {
    window.location.href = `/albums/${this.albumIdValue}/photos/${photoId}`
  }

  updateCounter() {
    if (this.hasCounterTarget && this.photoIdsValue.length > 0) {
      const currentIndex = this.photoIdsValue.indexOf(this.photoIdValue) + 1
      const total = this.photoIdsValue.length
      this.counterTarget.textContent = `${currentIndex} / ${total}`
    }
  }

  get currentIndex() {
    return this.photoIdsValue.indexOf(this.photoIdValue)
  }

  get isFirstPhoto() {
    return this.currentIndex === 0
  }

  get isLastPhoto() {
    return this.currentIndex === this.photoIdsValue.length - 1
  }
}
