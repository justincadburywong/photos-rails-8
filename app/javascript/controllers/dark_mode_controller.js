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
    
    this.updateToggleState()
    
    // Force a reflow to ensure CSS updates
    document.body.style.display = 'none'
    document.body.offsetHeight // Force reflow
    document.body.style.display = ''
  }

  initDarkMode() {
    const darkMode = localStorage.getItem('darkMode')
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    
    console.log('Stored dark mode preference:', darkMode)
    console.log('System prefers dark:', systemPrefersDark)
    
    if (darkMode === 'true' || (!darkMode && systemPrefersDark)) {
      document.documentElement.classList.add('dark')
      console.log('Applied dark mode - HTML classes:', document.documentElement.className)
    } else {
      document.documentElement.classList.remove('dark')
      console.log('Applied light mode - HTML classes:', document.documentElement.className)
    }
  }

  updateToggleState() {
    if (this.hasToggleTarget) {
      const isDark = document.documentElement.classList.contains('dark')
      this.toggleTarget.setAttribute('aria-checked', isDark)
      console.log('Updated toggle aria-checked to:', isDark)
    } else {
      console.log('No toggle target found!')
    }
  }
}
