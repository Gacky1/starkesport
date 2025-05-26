document.addEventListener('DOMContentLoaded',  function() {
  // Mobile menu toggle
  const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  
  if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', function() {
      navLinks.classList.toggle('active');
    });
  }
  
  // Initialize glitch text effect
  const glitchTextElements = document.querySelectorAll('.glitch-text h1');
  
  glitchTextElements.forEach(element => {
    const text = element.textContent;
    element.setAttribute('data-text', text);
    
    // Add random glitch animation
    setInterval(() => {
      element.classList.add('glitch-animation');
      setTimeout(() => {
        element.classList.remove('glitch-animation');
      }, 200);
    }, Math.random() * 5000 + 3000);
  });
  
  // Add subtle hover effects to cards
  const cards = document.querySelectorAll('.tournament-card, .feature-card');
  
  cards.forEach(card => {
    card.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-5px)';
      this.style.boxShadow = '0 12px 30px rgba(0, 0, 0, 0.3)';
      this.style.borderColor = 'rgba(13, 242, 201, 0.3)';
    });
    
    card.addEventListener('mouseleave', function() {
      this.style.transform = '';
      this.style.boxShadow = '';
      this.style.borderColor = '';
    });
  });
  
  // Add noise effect to background
  addNoiseEffect();
});

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
  