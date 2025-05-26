document.addEventListener('DOMContentLoaded',  function() {
  const loginForm = document.getElementById('login-form');
  const loginMessage = document.getElementById('login-message');
  
  // Check if user is already logged in
  if (localStorage.getItem('loggedIn') === 'true') {
    window.location.href = 'dashboard.html';
  }
  
  // Add visual effect to inputs
  const inputs = document.querySelectorAll('input');
  inputs.forEach(input => {
    input.addEventListener('focus', function() {
      this.parentElement.classList.add('input-focus');
    });
    
    input.addEventListener('blur', function() {
      if (!this.value) {
        this.parentElement.classList.remove('input-focus');
      }
    });
  });

  if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;
      
      // In a real application, this would validate against a server
      // For this demo, we'll use hardcoded credentials
      if (username === 'admin' && password === 'admin123') {
        // Set login state
        localStorage.setItem('loggedIn', 'true');
        localStorage.setItem('username', username);
        
        // Simulate loading
        showMessage('Login successful! Redirecting...', 'success');
        
        // Redirect to admin dashboard
        setTimeout(() => {
          window.location.href = 'dashboard.html';
        }, 1000);
      } else {
        showMessage('Invalid username or password. Please try again.', 'error');
        // Add shake effect to form
        loginForm.classList.add('shake');
        setTimeout(() => {
          loginForm.classList.remove('shake');
        }, 500);
      }
    });
  }
  
  function showMessage(text, type) {
    loginMessage.textContent = text;
    loginMessage.className = type;
    loginMessage.classList.remove('hidden');
  }
  
  // Add glitch effect to cybr-text
  const cybrText = document.querySelector('.cybr-text');
  if (cybrText) {
    setInterval(() => {
      cybrText.classList.add('glitch');
      setTimeout(() => {
        cybrText.classList.remove('glitch');
      }, 200);
    }, 5000);
  }
});
  