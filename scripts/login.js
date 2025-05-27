document.addEventListener('DOMContentLoaded',  function() {
    const loginForm = document.getElementById('login-form');
    const loginMessage = document.getElementById('login-message');
    
    // Initialize glitch text effect
    const glitchTextElements = document.querySelectorAll('.glitch-text h1');
    
    glitchTextElements.forEach(element => {
      const text = element.textContent;
      element.setAttribute('data-text', text);
    });
    
    // Add noise effect to background
    addNoiseEffect();
    
    if (loginForm) {
      // Add visual effect to inputs
      const inputs = document.querySelectorAll('input');
      inputs.forEach(input => {
        input.addEventListener('focus', function() {
          this.parentElement.classList.add('input-focus');
        });
        
        input.addEventListener('blur', function() {
          this.parentElement.classList.remove('input-focus');
        });
      });
      
      loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Show loading state
        const submitButton = document.getElementById('login-button');
        submitButton.disabled = true;
        submitButton.innerHTML = 'Logging in... <i class="fas fa-spinner fa-spin"></i>';
        
        // Get form values
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        // Simple authentication for demo purposes
        // In a real application, this would be handled by a server
        setTimeout(() => {
          if (username === 'admin' && password === 'admin123') {
            // Set login state
            sessionStorage.setItem('loggedIn', 'true');
            sessionStorage.setItem('username', username);
            
            // Show success message before redirect
            showMessage('Login successful! Redirecting...', 'success');
            
            // Redirect to admin dashboard
            setTimeout(() => {
              window.location.href = 'dashboard.html';
            }, 1000);
          } else {
            // Show error message
            showMessage('Invalid username or password!', 'error');
            submitButton.disabled = false;
            submitButton.innerHTML = 'Login <i class="fas fa-sign-in-alt"></i>';
          }
        }, 1000);
      });
    }
    
    function showMessage(text, type) {
      loginMessage.textContent = text;
      loginMessage.className = type;
      loginMessage.classList.remove('hidden');
      
      if (type === 'error') {
        // Add glitch effect for error messages
        loginMessage.classList.add('glitch-effect');
        setTimeout(() => {
          loginMessage.classList.remove('glitch-effect');
        }, 500);
      }
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
    