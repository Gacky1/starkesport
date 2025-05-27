document.addEventListener('DOMContentLoaded',   function() {
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

  // Load featured tournaments on homepage
  loadFeaturedTournaments();
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

// Load featured tournaments on homepage
function loadFeaturedTournaments() {
  const tournamentCardsContainer = document.querySelector('.tournament-cards');
  if (!tournamentCardsContainer) return; // Only run on homepage

  // Get tournaments from localStorage
  let tournaments = JSON.parse(localStorage.getItem('tournaments')) || [];
  
  // Get up to 1 upcoming and 1 ongoing tournament for featured section
  const upcomingTournament = tournaments.find(t => t.status === 'upcoming');
  const ongoingTournament = tournaments.find(t => t.status === 'ongoing');
  
  // Clear existing content
  tournamentCardsContainer.innerHTML = '';
  
  // Add tournaments to the featured section
  if (upcomingTournament) {
    addFeaturedTournamentCard(tournamentCardsContainer, upcomingTournament);
  }
  
  if (ongoingTournament) {
    addFeaturedTournamentCard(tournamentCardsContainer, ongoingTournament);
  }
  
  // If no tournaments found, add default cards
  if (!upcomingTournament && !ongoingTournament) {
    tournamentCardsContainer.innerHTML = `
      <div class="tournament-card">
        <div class="tournament-image">
          <img src="https://images.unsplash.com/photo-1593305841991-05c297ba4575?ixid=M3w3MjUzNDh8MHwxfHNlYXJjaHwyfHxlc3BvcnRzJTIwZ2FtaW5nJTIwdG91cm5hbWVudCUyMGFyZW5hJTIwY3liZXJwdW5rfGVufDB8fHx8MTc0NzQwNTc1NHww&ixlib=rb-4.1.0&fit=fillmax&h=800&w=1200" alt="Esports Arena">
          <div class="tournament-status upcoming">Upcoming</div>
        </div>
        <div class="tournament-info">
          <h3>No Upcoming Tournaments</h3>
          <p>Check back soon!</p>
          <a href="tournaments.html" class="btn-secondary">View Tournaments <i class="fas fa-chevron-right"></i></a>
        </div>
      </div>
      <div class="tournament-card">
        <div class="tournament-image">
          <img src="https://images.unsplash.com/photo-1607853202273-797f1c22a38e?ixid=M3w3MjUzNDh8MHwxfHNlYXJjaHwzfHxlc3BvcnRzJTIwZ2FtaW5nJTIwdG91cm5hbWVudCUyMGFyZW5hJTIwY3liZXJwdW5rfGVufDB8fHx8MTc0NzQwNTc1NHww&ixlib=rb-4.1.0&fit=fillmax&h=800&w=1200" alt="Esports Tournament">
          <div class="tournament-status ongoing">Ongoing</div>
        </div>
        <div class="tournament-info">
          <h3>No Ongoing Tournaments</h3>
          <p>Check back soon!</p>
          <a href="tournaments.html" class="btn-secondary">View Tournaments <i class="fas fa-chevron-right"></i></a>
        </div>
      </div>
    `;
  }
}

function addFeaturedTournamentCard(container, tournament) {
  // Format date
  const formattedDate = new Date(tournament.date).toLocaleDateString(undefined, { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  // Create card
  const card = document.createElement('div');
  card.className = 'tournament-card';
  
  // Add button HTML if available
  let buttonHtml = '';
  if (tournament.buttonText && tournament.buttonUrl) {
    buttonHtml = `
      <a href="${tournament.buttonUrl}" class="btn-primary featured-action-btn" target="_blank">
        ${tournament.buttonText} <i class="fas fa-${tournament.status === 'upcoming' ? 'sign-in-alt' : 'play-circle'}"></i>
      </a>
    `;
  }
  
  card.innerHTML = `
    <div class="tournament-image">
      <img src="${tournament.image}" alt="${tournament.name}">
      <div class="tournament-status ${tournament.status}">${tournament.status}</div>
    </div>
    <div class="tournament-info">
      <h3>${tournament.name}</h3>
      <p>${tournament.teams} Teams | ${formattedDate}</p>
      <div class="featured-btn-group">
        <a href="tournaments.html" class="btn-secondary">Learn More <i class="fas fa-chevron-right"></i></a>
        ${buttonHtml}
      </div>
    </div>
  `;
  
  container.appendChild(card);
}
  