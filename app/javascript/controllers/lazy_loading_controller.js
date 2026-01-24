import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["grid", "loading"]
  static values = {
    page: Number,
    hasMore: Boolean,
    loading: Boolean,
    albumId: String
  }

  connect() {
    this.pageValue = 1
    this.hasMoreValue = true
    this.loadingValue = false
    this.albumIdValue = this.element.dataset.albumId || window.location.pathname.split('/')[2]
    
    // Set up intersection observer for infinite scroll
    this.setupIntersectionObserver()
    
    console.log('Lazy loading controller connected')
    console.log('Album ID:', this.albumIdValue)
    console.log('Initial photos count:', this.gridTarget.querySelectorAll('.photo-item').length)
  }

  setupIntersectionObserver() {
    const options = {
      root: null,
      rootMargin: '200px', // Start loading 200px before reaching bottom
      threshold: 0.1
    }

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        console.log('Intersection observed:', entry.isIntersecting)
        if (entry.isIntersecting && this.hasMoreValue && !this.loadingValue) {
          console.log('Triggering loadMore')
          this.loadMore()
        }
      })
    }, options)

    // Observe the loading indicator
    if (this.hasLoadingTarget) {
      this.observer.observe(this.loadingTarget)
      console.log('Observing loading target')
    }
  }

  async loadMore() {
    if (this.loadingValue || !this.hasMoreValue) {
      console.log('Skipping loadMore - loading:', this.loadingValue, 'hasMore:', this.hasMoreValue)
      return
    }
    
    this.loadingValue = true
    this.pageValue++
    
    console.log('Loading page:', this.pageValue)
    
    // Show loading indicator
    if (this.hasLoadingTarget) {
      const spinner = this.loadingTarget.querySelector('#loading-spinner')
      if (spinner) {
        spinner.classList.remove('hidden')
      }
    }

    try {
      const url = `/albums/${this.albumIdValue}?page=${this.pageValue}`
      console.log('Fetching from:', url)
      
      const response = await fetch(url, {
        headers: {
          'Accept': 'text/html',
          'X-Requested-With': 'XMLHttpRequest'
        }
      })

      console.log('Response status:', response.status)

      if (!response.ok) {
        throw new Error(`Failed to load more photos: ${response.status}`)
      }

      const html = await response.text()
      console.log('Received HTML length:', html.length)
      
      // Parse the HTML to extract photo grid items
      const parser = new DOMParser()
      const doc = parser.parseFromString(html, 'text/html')
      const newPhotos = doc.querySelectorAll('.photo-item')
      
      console.log('Found new photos:', newPhotos.length)
      
      if (newPhotos.length === 0) {
        console.log('No more photos found')
        this.hasMoreValue = false
        if (this.hasLoadingTarget) {
          const spinner = this.loadingTarget.querySelector('#loading-spinner')
          if (spinner) {
            spinner.classList.add('hidden')
          }
        }
        return
      }

      // Add new photos to the grid with animation
      newPhotos.forEach((photo, index) => {
        // Add fade-in animation
        photo.style.opacity = '0'
        photo.style.transform = 'translateY(20px)'
        
        this.gridTarget.appendChild(photo)
        
        // Animate in with staggered delay
        setTimeout(() => {
          photo.style.transition = 'opacity 0.3s ease, transform 0.3s ease'
          photo.style.opacity = '1'
          photo.style.transform = 'translateY(0)'
        }, index * 50)
      })

      console.log('Added', newPhotos.length, 'photos to grid')

      // Check if there are more pages by looking at the response
      // If we got fewer than 24 photos, we're probably at the end
      if (newPhotos.length < 24) {
        console.log('Reached end of photos')
        this.hasMoreValue = false
        if (this.hasLoadingTarget) {
          const spinner = this.loadingTarget.querySelector('#loading-spinner')
          if (spinner) {
            spinner.classList.add('hidden')
          }
        }
      }

    } catch (error) {
      console.error('Error loading more photos:', error)
      this.hasMoreValue = false
      if (this.hasLoadingTarget) {
        const spinner = this.loadingTarget.querySelector('#loading-spinner')
        if (spinner) {
          spinner.classList.add('hidden')
        }
      }
    } finally {
      this.loadingValue = false
      console.log('LoadMore completed, loading:', this.loadingValue)
    }
  }

  disconnect() {
    if (this.observer) {
      this.observer.disconnect()
    }
  }
}
