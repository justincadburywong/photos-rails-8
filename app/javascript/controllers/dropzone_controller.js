import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["dropZone", "fileInput", "submitButton", "progress", "status"]
  static values = { 
    albumId: String,
    uploadUrl: String 
  }

  connect() {
    console.log('Dropzone controller connected!')
    
    // Store values as instance variables since Stimulus values aren't working
    this.albumId = this.element.dataset.dropzoneAlbumId
    this.uploadUrl = this.element.dataset.dropzoneUploadUrl
    
    this.setupDropZone()
    this.updateSubmitButton()
  }

  setupDropZone() {
    if (!this.hasDropZoneTarget) {
      console.log('No dropzone target found')
      return
    }

    console.log('Setting up dropzone on:', this.dropZoneTarget)
    console.log('File input target:', this.fileInputTarget)

    // Add event listeners
    this.dropZoneTarget.addEventListener('dragover', this.handleDragOver.bind(this))
    this.dropZoneTarget.addEventListener('dragleave', this.handleDragLeave.bind(this))
    this.dropZoneTarget.addEventListener('drop', this.handleDrop.bind(this))
    this.dropZoneTarget.addEventListener('click', this.handleClick.bind(this))
    
    // Listen to file input changes
    this.fileInputTarget.addEventListener('change', this.handleFileSelect.bind(this))
    
    console.log('Dropzone event listeners added')
  }

  handleDragOver(e) {
    console.log('Drag over event')
    e.preventDefault()
    e.stopPropagation()
    this.dropZoneTarget.classList.add('border-blue-500', 'bg-blue-50')
  }

  handleDragLeave(e) {
    console.log('Drag leave event')
    e.preventDefault()
    e.stopPropagation()
    this.dropZoneTarget.classList.remove('border-blue-500', 'bg-blue-50')
  }

  handleDrop(e) {
    console.log('Drop event triggered')
    e.preventDefault()
    e.stopPropagation()
    
    this.dropZoneTarget.classList.remove('border-blue-500', 'bg-blue-50')
    
    const files = e.dataTransfer.files
    console.log('Files dropped:', files.length)
    
    if (files.length > 0) {
      this.processFilesAsync(files)
    }
  }

  handleClick(e) {
    console.log('Click event triggered')
    e.preventDefault()
    e.stopPropagation()
    
    // Trigger file input click
    if (this.hasFileInputTarget) {
      this.fileInputTarget.click()
    }
  }

  handleFileSelect(e) {
    console.log('File select event')
    const files = e.target.files
    if (files.length > 0) {
      this.processFilesAsync(files)
    }
  }

  async processFilesAsync(files) {
    const filesArray = Array.from(files)
    
    this.showStatus(`Processing ${filesArray.length} file(s)...`)
    this.showProgress(0)
    
    // Show progress container
    const progressContainer = document.getElementById('progress-container')
    if (progressContainer) {
      progressContainer.classList.remove('hidden')
    }

    try {
      // Process files in chunks to avoid overwhelming the server
      const chunkSize = 5
      let processedCount = 0

      for (let i = 0; i < filesArray.length; i += chunkSize) {
        const chunk = filesArray.slice(i, i + chunkSize)
        await this.processChunk(chunk)
        processedCount += chunk.length
        this.showProgress(Math.round(processedCount / filesArray.length * 100))
      }

      this.showStatus(`Successfully uploaded ${filesArray.length} file(s)!`)
      this.fileInputTarget.value = '' // Clear input
      
      // Hide progress container after completion
      setTimeout(() => {
        if (progressContainer) {
          progressContainer.classList.add('hidden')
        }
        this.hideStatus()
      }, 3000)

    } catch (error) {
      console.error('Upload error:', error)
      this.showStatus('Error uploading files. Please try again.', 'error')
      
      // Hide progress container on error
      if (progressContainer) {
        progressContainer.classList.add('hidden')
      }
    }
  }

  async processChunk(files) {
    const filesData = await Promise.all(
      files.map(file => this.readFileAsBuffer(file))
    )

    // Force relative URL to avoid host issues
    const uploadUrl = this.uploadUrl.startsWith('http') ? new URL(this.uploadUrl).pathname : this.uploadUrl

    // Send files to background processing
    const response = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
      },
      body: JSON.stringify({
        album_id: this.albumId,
        files: filesData
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Upload failed:', errorText)
      throw new Error(`Failed to process files: ${response.status} - ${errorText}`)
    }

    return response.json()
  }

  readFileAsBuffer(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = () => {
        // Convert to base64 for JSON transmission
        const base64 = reader.result.split(',')[1]
        resolve({
          filename: file.name,
          content_type: file.type,
          content: base64
        })
      }
      
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  showStatus(message, type = 'success') {
    if (this.hasStatusTarget) {
      this.statusTarget.textContent = message
      this.statusTarget.className = type === 'error' 
        ? 'text-red-600 text-sm mt-2'
        : 'text-green-600 text-sm mt-2'
      this.statusTarget.classList.remove('hidden')
    }
  }

  hideStatus() {
    if (this.hasStatusTarget) {
      this.statusTarget.classList.add('hidden')
    }
  }

  showProgress(percentage) {
    if (this.hasProgressTarget) {
      this.progressTarget.style.width = `${percentage}%`
      this.progressTarget.textContent = `${percentage}%`
    }
  }

  updateSubmitButton() {
    if (!this.hasSubmitButtonTarget) return
    
    const files = this.fileInputTarget.files
    const hasFiles = files && files.length > 0
    
    this.submitButtonTarget.disabled = !hasFiles
    
    if (hasFiles) {
      this.submitButtonTarget.classList.remove('bg-gray-400', 'cursor-not-allowed')
      this.submitButtonTarget.classList.add('bg-blue-600', 'hover:bg-blue-700')
    } else {
      this.submitButtonTarget.classList.add('bg-gray-400', 'cursor-not-allowed')
      this.submitButtonTarget.classList.remove('bg-blue-600', 'hover:bg-blue-700')
    }
  }

  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  disconnect() {
    console.log('Dropzone controller disconnected')
  }
}
