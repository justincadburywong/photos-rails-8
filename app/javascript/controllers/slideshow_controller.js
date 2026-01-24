import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["toggle", "controls", "speed", "speedDisplay", "modal", "image", "photoTitle", "photoDescription", "photoGrid"]
  static values = {
    photos: Array,
    currentIndex: { type: Number, default: 0 },
    isPlaying: { type: Boolean, default: false },
    interval: { type: Number, default: 3000 }
  }

  connect() {
    console.log('Slideshow controller connected')
    this.loadPhotos()
    console.log('Loaded photos:', this.photosValue)
  }

  loadPhotos() {
    const photoElements = this.photoGridTarget.querySelectorAll('.photo-item')
    console.log('Found photo elements:', photoElements.length)
    this.photosValue = Array.from(photoElements).map(element => {
      const photoId = element.dataset.photoId
      const img = element.querySelector('img')
      const photoData = {
        id: photoId,
        thumbnailUrl: img ? img.src : '',
        largeUrl: img ? img.src : '' // Use the same URL for both thumbnail and large
      }
      console.log('Photo data:', photoData)
      return photoData
    })
    console.log('Final photos array:', this.photosValue)
  }

  toggleSlideshow() {
    if (this.isPlayingValue) {
      this.stopSlideshow()
    } else {
      this.startSlideshow()
    }
  }

  startSlideshow() {
    if (this.photosValue.length === 0) return

    this.isPlayingValue = true
    this.toggleTarget.textContent = 'Stop Slideshow'
    this.toggleTarget.classList.remove('bg-green-600', 'hover:bg-green-700')
    this.toggleTarget.classList.add('bg-red-600', 'hover:bg-red-700')
    this.controlsTarget.classList.remove('hidden')
    this.controlsTarget.classList.add('flex')
    
    this.showModal()
    this.startTimer()
  }

  stopSlideshow() {
    this.isPlayingValue = false
    this.toggleTarget.textContent = 'Start Slideshow'
    this.toggleTarget.classList.remove('bg-red-600', 'hover:bg-red-700')
    this.toggleTarget.classList.add('bg-green-600', 'hover:bg-green-700')
    this.controlsTarget.classList.add('hidden')
    this.controlsTarget.classList.remove('flex')
    
    this.hideModal()
    this.stopTimer()
  }

  updateSpeed() {
    this.intervalValue = this.speedTarget.value * 1000
    this.speedDisplayTarget.textContent = `${this.speedTarget.value}s`
    
    if (this.isPlayingValue) {
      this.stopTimer()
      this.startTimer()
    }
  }

  showModal() {
    this.modalTarget.classList.remove('hidden')
    this.showPhoto(0)
  }

  hideModal() {
    this.modalTarget.classList.add('hidden')
  }

  showPhoto(index) {
    if (index < 0 || index >= this.photosValue.length) return

    this.currentIndexValue = index
    const photo = this.photosValue[index]
    
    this.imageTarget.src = photo.largeUrl
    this.imageTarget.alt = photo.title || 'Photo'
    
    // Fetch photo details
    this.fetchPhotoDetails(photo.id)
  }

  async fetchPhotoDetails(photoId) {
    try {
      const response = await fetch(`/albums/${this.data.get('album-id')}/photos/${photoId}.json`)
      if (response.ok) {
        const data = await response.json()
        this.photoTitleTarget.textContent = data.title || 'Untitled'
        this.photoDescriptionTarget.textContent = data.description || ''
      }
    } catch (error) {
      console.error('Error fetching photo details:', error)
    }
  }

  nextPhoto() {
    const nextIndex = (this.currentIndexValue + 1) % this.photosValue.length
    this.showPhoto(nextIndex)
  }

  previousPhoto() {
    const prevIndex = this.currentIndexValue === 0 ? this.photosValue.length - 1 : this.currentIndexValue - 1
    this.showPhoto(prevIndex)
  }

  startTimer() {
    this.timer = setInterval(() => {
      this.nextPhoto()
    }, this.intervalValue)
  }

  stopTimer() {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
  }

  disconnect() {
    this.stopTimer()
  }
}
