document.addEventListener('DOMContentLoaded',  async function() {
  // Tab functionality
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');
  
  tabButtons.forEach(button => {
    button.addEventListener('click', function() {
      const tabId = this.getAttribute('data-tab');
      
      // Remove active class from all buttons and contents
      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabContents.forEach(content => content.classList.remove('active'));
      
      // Add active class to clicked button and corresponding content
      this.classList.add('active');
      document.getElementById(`${tabId}-content`).classList.add('active');
    });
  });
  
  // Initialize glitch text effect
  const glitchTextElements = document.querySelectorAll('.glitch-text h1');
  
  glitchTextElements.forEach(element => {
    const text = element.textContent;
    element.setAttribute('data-text', text);
  });
  
  // Load tournaments data
  await loadTournaments();
  
  // Add noise effect to background
  addNoiseEffect();
});

// Load tournaments from Google Sheets
async function loadTournaments() {
  const upcomingTournaments = document.getElementById('upcoming-tournaments');
  const ongoingTournaments = document.getElementById('ongoing-tournaments');
  const pastTournaments = document.getElementById('past-tournaments');
  
  if (!upcomingTournaments || !ongoingTournaments || !pastTournaments) {
    return;
  }
  
  try {
    // Show loading state
    upcomingTournaments.innerHTML = '<div class="loading-spinner"></div>';
    ongoingTournaments.innerHTML = '<div class="loading-spinner"></div>';
    pastTournaments.innerHTML = '<div class="loading-spinner"></div>';
    
    // Get tournaments from Google Sheets
    const tournaments = await fetchTournaments();
    
    // Clear loading state
    upcomingTournaments.innerHTML = '';
    ongoingTournaments.innerHTML = '';
    pastTournaments.innerHTML = '';
    
    // Filter tournaments by status
    const upcoming = tournaments.filter(tournament => tournament.status === 'upcoming');
    const ongoing = tournaments.filter(tournament => tournament.status === 'ongoing');
    const past = tournaments.filter(tournament => tournament.status === 'past');
    
    // Display tournaments
    displayTournaments(upcomingTournaments, upcoming);
    displayTournaments(ongoingTournaments, ongoing);
    displayTournaments(pastTournaments, past, true);
    
    // Display message if no tournaments found
    if (upcoming.length === 0) upcomingTournaments.innerHTML = '<div class="no-data">No upcoming tournaments available.</div>';
    if (ongoing.length === 0) ongoingTournaments.innerHTML = '<div class="no-data">No ongoing tournaments available.</div>';
    if (past.length === 0) pastTournaments.innerHTML = '<div class="no-data">No past tournaments available.</div>';
  } catch (error) {
    console.error('Error loading tournaments:', error);
    upcomingTournaments.innerHTML = '<div class="error-message">Failed to load tournaments. Please try again later.</div>';
    ongoingTournaments.innerHTML = '<div class="error-message">Failed to load tournaments. Please try again later.</div>';
    pastTournaments.innerHTML = '<div class="error-message">Failed to load tournaments. Please try again later.</div>';
  }
}

function displayTournaments(container, tournaments, showWinners = false) {
  tournaments.forEach(tournament => {
    const tournamentElement = document.createElement('div');
    tournamentElement.className = 'tournament-item';
    
    let winnersHtml = '';
    if (showWinners && tournament.winners) {
      winnersHtml = `
        <div class="tournament-winners">
          <h4><i class="fas fa-trophy"></i> Winners</h4>
          <p>${tournament.winners}</p>
        </div>
      `;
    }
    
    let highlightsHtml = '';
    if (showWinners && tournament.highlights) {
      // Check if it's a video URL (simple check for YouTube or Vimeo)
      if (tournament.highlights.includes('youtube.com') || tournament.highlights.includes('vimeo.com')) {
        highlightsHtml = `
          <div class="tournament-highlights">
            <h4>Highlights</h4>
            <div class="video-container">
              <iframe width="100%" height="215" src="${tournament.highlights}" frameborder="0" allowfullscreen></iframe>
            </div>
          </div>
        `;
      } else {
        // Assume it's an image
        highlightsHtml = `
          <div class="tournament-highlights">
            <h4>Highlights</h4>
            <img src="${tournament.highlights}" alt="Tournament Highlights">
          </div>
        `;
      }
    }
    
    // Action button for upcoming or ongoing tournaments
    let actionButtonHtml = '';
    if (tournament.status !== 'past') {
      const buttonText = tournament.buttonText || (tournament.status === 'upcoming' ? 'Register Now' : 'Watch Live');
      const buttonUrl = tournament.buttonUrl || '#';
      actionButtonHtml = `
        <a href="${buttonUrl}" class="btn-primary tournament-action-btn" target="_blank">
          ${buttonText} <i class="fas fa-${tournament.status === 'upcoming' ? 'sign-in-alt' : 'play-circle'}"></i>
        </a>
      `;
    }
    
    tournamentElement.innerHTML = `
      <div class="tournament-image">
        <img src="${tournament.image}" alt="${tournament.name}">
        <div class="tournament-status ${tournament.status}">${tournament.status}</div>
      </div>
      <div class="tournament-details">
        <h3>${tournament.name}</h3>
        <div class="tournament-meta">
          <span><i class="fas fa-users"></i> ${tournament.teams} Teams</span>
          <span><i class="fas fa-calendar"></i> ${formatDate(tournament.date)}</span>
        </div>
        <div class="tournament-description">
          ${tournament.description}
        </div>
        ${winnersHtml}
        ${highlightsHtml}
        ${actionButtonHtml}
      </div>
    `;
    
    container.appendChild(tournamentElement);
  });
}

function formatDate(dateString) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
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
  