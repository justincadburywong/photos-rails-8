import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["carousel", "photoGrid"]
  static values = {
    albumId: String
  }

  connect() {
    this.setupCarousel()
  }

  setupCarousel() {
    // Initialize OwlCarousel when page loads
    $(document).ready(() => {
      this.initCarousel()
    })
  }

  initCarousel() {
    const $carousel = $(this.carouselTarget)
    
    // Get all photos from the album
    fetch(`/albums/${this.albumIdValue}/photos.json`)
      .then(response => response.json())
      .then(photos => {
        // Build carousel items
        const carouselItems = photos.map(photo => `
          <div class="item">
            <div class="flex items-center justify-center min-h-screen bg-black">
              ${photo.image_url ? 
                `<img src="${photo.image_url}" alt="${photo.title || 'Photo'}" class="max-w-full max-h-full object-contain">` :
                `<div class="text-white text-center">
                  <svg class="w-24 h-24 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                  <p class="text-lg">${photo.title || 'Untitled Photo'}</p>
                </div>`
              }
            </div>
          </div>
        `).join('')

        $carousel.html(carouselItems)
        
        // Initialize OwlCarousel
        $carousel.owlCarousel({
          items: 1,
          loop: false,
          margin: 0,
          nav: true,
          dots: true,
          autoplay: false,
          smartSpeed: 300,
          fluidSpeed: true,
          navText: [
            '<svg class="w-8 h-8" fill="white" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>',
            '<svg class="w-8 h-8" fill="white" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>'
          ],
          onInitialized: () => {
            this.showCarousel()
          }
        })
      })
      .catch(error => console.error('Error loading photos:', error))
  }

  showCarousel() {
    // Hide photo grid and show carousel
    if (this.hasPhotoGridTarget) {
      this.photoGridTarget.style.display = 'none'
    }
    this.carouselTarget.style.display = 'block'
    document.body.style.overflow = 'hidden'
  }

  hideCarousel() {
    // Show photo grid and hide carousel
    if (this.hasPhotoGridTarget) {
      this.photoGridTarget.style.display = 'grid'
    }
    this.carouselTarget.style.display = 'none'
    document.body.style.overflow = 'auto'
  }

  // This method will be called when clicking on photos in the grid
  openCarousel(event) {
    event.preventDefault()
    const photoId = event.currentTarget.dataset.photoId
    
    // Initialize carousel and navigate to specific photo
    this.initCarousel()
    
    // Wait for carousel to initialize, then navigate to specific photo
    setTimeout(() => {
      const $carousel = $(this.carouselTarget)
      const photoIndex = this.findPhotoIndex(photoId)
      if (photoIndex !== -1) {
        $carousel.trigger('to.owl.carousel', [photoIndex, 300, true])
      }
    }, 500)
  }

  findPhotoIndex(photoId) {
    // Find the index of the photo in the carousel
    const $items = $(this.carouselTarget).find('.owl-item')
    for (let i = 0; i < $items.length; i++) {
      const $item = $items.eq(i)
      // This is a simplified approach - you might need to adjust based on your data structure
      if ($item.find('img').length > 0) {
        return i
      }
    }
    return 0
  }

  // Close carousel with ESC key
  handleKeydown(event) {
    if (event.key === 'Escape') {
      this.hideCarousel()
    }
  }
}
