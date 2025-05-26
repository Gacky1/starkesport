document.addEventListener('DOMContentLoaded',  function() {
  const supportForm = document.getElementById('support-form');
  const formMessage = document.getElementById('form-message');
  
  // Initialize glitch text effect
  const glitchTextElements = document.querySelectorAll('.glitch-text h1');
  
  glitchTextElements.forEach(element => {
    const text = element.textContent;
    element.setAttribute('data-text', text);
  });
  
  if (supportForm) {
    // Add visual effect to inputs
    const inputs = document.querySelectorAll('input, textarea');
    inputs.forEach(input => {
      input.addEventListener('focus', function() {
        this.parentElement.classList.add('input-focus');
        
        // Add glitch effect on focus
        if (Math.random() > 0.7) {
          this.classList.add('glitch-effect');
          setTimeout(() => {
            this.classList.remove('glitch-effect');
          }, 200);
        }
      });
      
      input.addEventListener('blur', function() {
        this.parentElement.classList.remove('input-focus');
      });
    });
    
    supportForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Add submission animation
      this.classList.add('submitting');
      
      // Get form values
      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const message = document.getElementById('message').value;
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        showMessage('Please enter a valid email address.', 'error');
        this.classList.remove('submitting');
        return;
      }
      
      // In a real application, this would send data to a server
      // For demonstration, we'll just store in localStorage
      const contactMessages = JSON.parse(localStorage.getItem('contactMessages')) || [];
      contactMessages.push({
        name,
        email,
        message,
        date: new Date().toISOString()
      });
      
      localStorage.setItem('contactMessages', JSON.stringify(contactMessages));
      
      // Simulate server processing
      setTimeout(() => {
        // Show success message
        showMessage('Your message has been sent successfully! We will get back to you soon.', 'success');
        
        // Reset form
        supportForm.reset();
        
        // Remove submission animation
        this.classList.remove('submitting');
        
        inputs.forEach(input => {
          input.parentElement.classList.remove('input-focus');
        });
      }, 1000);
    });
  }
  
  // Add noise effect to background
  addNoiseEffect();
  
  function showMessage(text, type) {
    formMessage.textContent = text;
    formMessage.className = type;
    formMessage.classList.remove('hidden');
    
    // Add glitch effect to message
    formMessage.classList.add('appear');
    
    // Hide message after 5 seconds
    setTimeout(() => {
      formMessage.classList.remove('appear');
      formMessage.classList.add('disappear');
      
      setTimeout(() => {
        formMessage.classList.add('hidden');
        formMessage.classList.remove('disappear');
      }, 500);
    }, 5000);
  }
  
  function addNoiseEffect() {
    const body = document.body;
    const fps = 30;
    let noiseOpacity = 0.03;
    
    function toggleNoise() {
      noiseOpacity = noiseOpacity === 0.03 ? 0.04 : 0.03;
      body.style.backgroundImage = `radial-gradient(rgba(13, 242, 201, ${noiseOpacity}) 1px, transparent 1px)`;
      body.style.backgroundSize = 'calc(100vw / 150) calc(100vh / 150)';
    }
    
    setInterval(toggleNoise, 1000 / fps);
  }
});
  