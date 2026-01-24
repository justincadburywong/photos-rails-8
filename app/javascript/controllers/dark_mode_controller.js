import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["toggle"]

  connect() {
    console.log('Dark mode controller connected')
    console.log('Toggle target found:', this.hasToggleTarget)
    console.log('Initial HTML classes:', document.documentElement.className)
    this.initDarkMode()
    this.updateToggleState()
  }

  toggle() {
    console.log('=== TOGGLE CLICKED ===')
    console.log('Before toggle - HTML classes:', document.documentElement.className)
    console.log('Before toggle - Has dark class:', document.documentElement.classList.contains('dark'))
    
    document.documentElement.classList.toggle('dark')
    
    const isDark = document.documentElement.classList.contains('dark')
    localStorage.setItem('darkMode', isDark)
    
    console.log('After toggle - HTML classes:', document.documentElement.className)
    console.log('After toggle - Has dark class:', isDark)
    console.log('After toggle - Stored preference:', localStorage.getItem('darkMode'))
    
    // Apply dark mode styles to key elements
    console.log('About to call applyDarkModeStyles with isDark:', isDark)
    this.applyDarkModeStyles(isDark)
    
    this.updateToggleState()
    
    // Force a reflow to ensure CSS updates
    document.body.style.display = 'none'
    document.body.offsetHeight // Force reflow
    document.body.style.display = ''
  }

  applyDarkModeStyles(isDark) {
    // Body styles
    if (isDark) {
      document.body.style.backgroundColor = '#111827'
      document.body.style.color = '#f9fafb'
    } else {
      document.body.style.backgroundColor = '#ffffff'
      document.body.style.color = '#111827'
    }

    // Update all elements with dark mode classes
    const darkElements = document.querySelectorAll('[class*="dark:"]')
    darkElements.forEach(element => {
      const classes = element.className.split(' ')
      classes.forEach(className => {
        if (className.startsWith('dark:')) {
          const baseClass = className.substring(5)
          if (isDark) {
            element.classList.add(baseClass)
          } else {
            element.classList.remove(baseClass)
          }
        }
      })
    })

    // Update navbar
    const navbar = document.querySelector('nav')
    if (navbar) {
      if (isDark) {
        navbar.style.backgroundColor = '#1f2937'
        navbar.style.borderColor = '#374151'
      } else {
        navbar.style.backgroundColor = '#ffffff'
        navbar.style.borderColor = '#e5e7eb'
      }
    }

    // Update cards and panels
    const cards = document.querySelectorAll('.bg-white, .bg-gray-50')
    cards.forEach(card => {
      if (isDark) {
        card.style.backgroundColor = '#1f2937'
        card.style.color = '#f9fafb'
      } else {
        card.style.backgroundColor = card.classList.contains('bg-gray-50') ? '#f9fafb' : '#ffffff'
        card.style.color = '#111827'
      }
    })

    // Enhanced text color handling
    this.updateTextColors(isDark)
    
    // Update links
    this.updateLinks(isDark)
    
    // Update buttons
    this.updateButtons(isDark)
    
    // Update form elements
    this.updateFormElements(isDark)
    
    // Update dark mode toggle slider
    this.updateToggleSlider(isDark)
  }

  updateTextColors(isDark) {
    // Headings and titles
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6')
    headings.forEach(heading => {
      if (isDark) {
        heading.style.color = '#f9fafb'
      } else {
        heading.style.color = '#111827'
      }
    })

    // Regular text elements
    const textElements = document.querySelectorAll('p, span, div, li, td, th')
    textElements.forEach(element => {
      // Skip elements that already have specific styling
      if (element.style.color && element.style.color !== '') return
      
      const computedColor = getComputedStyle(element).color
      const isLightText = computedColor.includes('255, 255, 255') || computedColor.includes('249, 250, 251')
      const isDarkText = computedColor.includes('17, 24, 39') || computedColor.includes('31, 41, 55')
      
      if (isDark) {
        if (isDarkText) {
          element.style.color = '#d1d5db' // gray-300
        } else if (!isLightText) {
          element.style.color = '#f9fafb' // gray-50
        }
      } else {
        if (isLightText) {
          element.style.color = '#4b5563' // gray-600
        } else if (!isDarkText) {
          element.style.color = '#111827' // gray-900
        }
      }
    })

    // Specific gray text classes
    const grayTexts = document.querySelectorAll('.text-gray-100, .text-gray-200, .text-gray-300, .text-gray-400, .text-gray-500, .text-gray-600, .text-gray-700, .text-gray-800, .text-gray-900')
    grayTexts.forEach(element => {
      if (isDark) {
        element.style.color = '#d1d5db' // gray-300
      } else {
        element.style.color = '#4b5563' // gray-600
      }
    })
  }

  updateLinks(isDark) {
    const links = document.querySelectorAll('a')
    links.forEach(link => {
      if (isDark) {
        link.style.color = '#60a5fa' // blue-400
      } else {
        link.style.color = '#2563eb' // blue-600
      }
    })
  }

  updateButtons(isDark) {
    // Primary buttons
    const primaryButtons = document.querySelectorAll('.bg-blue-600, .bg-blue-700')
    primaryButtons.forEach(button => {
      if (isDark) {
        button.style.backgroundColor = '#2563eb' // blue-600 in dark
        button.style.color = '#ffffff'
      } else {
        button.style.backgroundColor = '#2563eb' // blue-600 in light
        button.style.color = '#ffffff'
      }
    })

    // Secondary buttons
    const secondaryButtons = document.querySelectorAll('.bg-gray-200, .bg-gray-300')
    secondaryButtons.forEach(button => {
      if (isDark) {
        button.style.backgroundColor = '#374151' // gray-700 in dark
        button.style.color = '#f9fafb'
      } else {
        button.style.backgroundColor = '#e5e7eb' // gray-200 in light
        button.style.color = '#111827'
      }
    })
  }

  updateFormElements(isDark) {
    // Inputs
    const inputs = document.querySelectorAll('input[type="text"], input[type="email"], input[type="password"], textarea, select')
    inputs.forEach(input => {
      if (isDark) {
        input.style.backgroundColor = '#374151' // gray-700
        input.style.color = '#f9fafb'
        input.style.borderColor = '#4b5563' // gray-600
      } else {
        input.style.backgroundColor = '#ffffff'
        input.style.color = '#111827'
        input.style.borderColor = '#d1d5db' // gray-300
      }
    })

    // Labels
    const labels = document.querySelectorAll('label')
    labels.forEach(label => {
      if (isDark) {
        label.style.color = '#d1d5db' // gray-300
      } else {
        label.style.color = '#374151' // gray-700
      }
    })
  }

  updateToggleSlider(isDark) {
    console.log('=== Toggle Slider Debug ===')
    console.log('isDark:', isDark)
    console.log('toggleTarget:', this.toggleTarget)
    
    if (this.hasToggleTarget) {
      // Find the container element with the dark mode classes
      const container = this.toggleTarget.closest('[class*="dark:bg-gray-"]') || 
                       this.toggleTarget.parentElement.closest('[class*="dark:bg-gray-"]') ||
                       this.toggleTarget.closest('.flex.items-center.space-x-3')
      
      console.log('container:', container)
      
      if (container) {
        if (isDark) {
          container.style.backgroundColor = '#1f2937' // gray-800
          container.style.borderColor = '#4b5563' // gray-600
        } else {
          container.style.backgroundColor = '#f3f4f6' // gray-100
          container.style.borderColor = '#d1d5db' // gray-300
        }
        console.log('Container styles updated')
      }
      
      // Update the toggle background color
      if (isDark) {
        this.toggleTarget.style.backgroundColor = '#2563eb' // blue-600 for dark mode
      } else {
        this.toggleTarget.style.backgroundColor = '#9ca3af' // gray-400 for light mode
      }
      
      // Find the thumb element (the inner div with absolute positioning)
      const thumb = this.toggleTarget.querySelector('.absolute')
      console.log('thumb:', thumb)
      console.log('thumb classes:', thumb?.className)
      
      if (thumb) {
        // Reset any existing transform and let Tailwind handle it
        thumb.style.transform = ''
        
        // Ensure thumb has proper base positioning
        thumb.style.left = '0.125rem' // 0.5 * 4px = 2px (matches top-0.5 left-0.5)
        thumb.style.top = '0.125rem'
        thumb.style.width = '1.25rem' // 5 * 4px = 20px (matches w-5)
        thumb.style.height = '1.25rem'
        thumb.style.backgroundColor = '#ffffff'
        thumb.style.borderRadius = '50%'
        thumb.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
        thumb.style.border = '1px solid #e5e7eb'
        
        // Force reflow to ensure Tailwind classes are applied
        thumb.style.display = 'none'
        thumb.offsetHeight // Force reflow
        thumb.style.display = ''
        
        // Manually apply the transform based on dark mode state
        if (isDark) {
          thumb.style.transform = 'translateX(1.5rem)' // 6 * 4px = 24px = 1.5rem
          console.log('Manual: Moving thumb to the right (dark mode)')
        } else {
          thumb.style.transform = 'translateX(0)'
          console.log('Manual: Moving thumb to the left (light mode)')
        }
        
        // Add smooth transition
        thumb.style.transition = 'transform 0.2s ease-in-out'
        
        console.log('Thumb transform:', thumb.style.transform)
        console.log('Thumb left position:', thumb.style.left)
        console.log('Thumb animation applied')
      }
    }
  }

  initDarkMode() {
    const darkMode = localStorage.getItem('darkMode')
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    
    console.log('Stored dark mode preference:', darkMode)
    console.log('System prefers dark:', systemPrefersDark)
    
    let isDark = false
    
    // If user has explicitly set a preference, use it
    if (darkMode !== null) {
      isDark = darkMode === 'true'
      console.log('Using user preference:', isDark)
    } else {
      // No user preference, use system preference
      isDark = systemPrefersDark
      console.log('Using system preference:', isDark)
    }

    // Apply the dark mode class and styles
    if (isDark) {
      document.documentElement.classList.add('dark')
      console.log('Applied dark mode - HTML classes:', document.documentElement.className)
    } else {
      document.documentElement.classList.remove('dark')
      console.log('Applied light mode - HTML classes:', document.documentElement.className)
    }

    // Apply the styles
    this.applyDarkModeStyles(isDark)
  }

  updateToggleState() {
    if (this.hasToggleTarget) {
      const isDark = document.documentElement.classList.contains('dark')
      this.toggleTarget.checked = isDark
      this.toggleTarget.setAttribute('aria-checked', isDark)
      console.log('Updated toggle state - checked:', isDark)
    } else {
      console.log('No toggle target found!')
    }
  }
}
