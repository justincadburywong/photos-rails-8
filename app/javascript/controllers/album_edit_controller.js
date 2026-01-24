import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["editButton", "deleteButton"]

  connect() {
    this.editMode = false
  }

  toggleEditMode() {
    this.editMode = !this.editMode
    this.updateUI()
  }

  updateUI() {
    // Update button text and style
    if (this.editMode) {
      this.editButtonTarget.textContent = 'Done Editing'
      this.editButtonTarget.classList.remove('bg-orange-600', 'hover:bg-orange-700')
      this.editButtonTarget.classList.add('bg-green-600', 'hover:bg-green-700')
      
      // Show all delete buttons with 10% transparency for maximum photo visibility
      this.deleteButtonTargets.forEach((button) => {
        button.style.display = 'flex'
        button.classList.remove('opacity-0', 'pointer-events-none')
        button.classList.add('opacity-10') // Only 10% transparent overlay
      })
      
      // Disable carousel triggers during edit mode
      document.querySelectorAll('.carousel-trigger').forEach(trigger => {
        trigger.style.pointerEvents = 'none'
        trigger.classList.add('opacity-75')
      })
    } else {
      this.editButtonTarget.textContent = 'Edit Album'
      this.editButtonTarget.classList.remove('bg-green-600', 'hover:bg-green-700')
      this.editButtonTarget.classList.add('bg-orange-600', 'hover:bg-orange-700')
      
      // Hide all delete buttons completely
      this.deleteButtonTargets.forEach((button) => {
        button.style.display = 'none'
        button.classList.remove('opacity-10')
        button.classList.add('opacity-0', 'pointer-events-none')
      })
      
      // Re-enable carousel triggers
      document.querySelectorAll('.carousel-trigger').forEach(trigger => {
        trigger.style.pointerEvents = 'auto'
        trigger.classList.remove('opacity-75')
      })
    }
  }

  deletePhoto(event) {
    // Prevent default link behavior completely
    event.preventDefault()
    event.stopPropagation()
    
    const link = event.currentTarget
    const photoElement = link.closest('[data-photo-id]')
    const photoId = photoElement ? photoElement.dataset.photoId : null
    
    if (!photoId) {
      console.error('Could not find photo ID')
      return
    }
    
    if (confirm('Are you sure you want to delete this photo?')) {
      // Find and remove the photo element with animation
      if (photoElement) {
        photoElement.style.transition = 'all 0.3s ease'
        photoElement.style.opacity = '0'
        photoElement.style.transform = 'scale(0.8)'
        
        setTimeout(() => {
          // Use the original link href since it has the correct URL
          const deleteUrl = link.href
          
          console.log('=== Delete Debug ===')
          console.log('Photo ID:', photoId)
          console.log('Delete URL:', deleteUrl)
          console.log('Original link href:', link.href)
          
          // Use fetch to delete the photo and stay on the same page
          fetch(deleteUrl, {
            method: 'POST', // Use POST with _method=DELETE for Rails compatibility
            headers: {
              'X-Requested-With': 'XMLHttpRequest',
              'Accept': 'text/html',
              'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: '_method=DELETE'
          }).then(response => {
            console.log('Delete response status:', response.status)
            console.log('Delete response ok:', response.ok)
            
            if (response.ok) {
              // Remove the photo element from DOM
              photoElement.remove()
              
              // Update photo count if it exists
              const photoCountElement = document.querySelector('[id="photo-count"]')
              if (photoCountElement) {
                const currentCount = parseInt(photoCountElement.textContent.match(/\d+/)[0])
                photoCountElement.innerHTML = `${currentCount - 1} photos`
              }
            } else {
              // If delete failed, show error and put element back
              console.error('Delete failed with status:', response.status)
              photoElement.style.opacity = '1'
              photoElement.style.transform = 'scale(1)'
              alert('Failed to delete photo. Please try again.')
            }
          }).catch(error => {
            console.error('Delete failed:', error)
            photoElement.style.opacity = '1'
            photoElement.style.transform = 'scale(1)'
            alert('Failed to delete photo. Please try again.')
          })
        }, 300)
      }
    }
  }
}
