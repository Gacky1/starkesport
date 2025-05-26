document.addEventListener('DOMContentLoaded',  function() {
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
  loadTournaments();
  
  // Add noise effect to background
  addNoiseEffect();
});

// Load tournaments from localStorage
function loadTournaments() {
  const upcomingTournaments = document.getElementById('upcoming-tournaments');
  const ongoingTournaments = document.getElementById('ongoing-tournaments');
  const pastTournaments = document.getElementById('past-tournaments');
  
  // Clear existing content
  upcomingTournaments.innerHTML = '';
  ongoingTournaments.innerHTML = '';
  pastTournaments.innerHTML = '';
  
  // Get tournaments from localStorage
  let tournaments = JSON.parse(localStorage.getItem('tournaments')) || [];
  
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

// Add sample data if tournaments don't exist yet
function addSampleData() {
  if (!localStorage.getItem('tournaments')) {
    const sampleTournaments = [
      {
        id: 1,
        name: "Apex Legends Showdown",
        date: "2023-06-15",
        teams: 32,
        description: "The premier Apex Legends tournament featuring the top 32 teams from around the world competing for a prize pool of $100,000.",
        status: "upcoming",
        image: "https://images.unsplash.com/photo-1593305841991-05c297ba4575?ixid=M3w3MjUzNDh8MHwxfHNlYXJjaHwyfHxlc3BvcnRzJTIwZ2FtaW5nJTIwdG91cm5hbWVudCUyMGFyZW5hJTIwY3liZXJwdW5rfGVufDB8fHx8MTc0NzQwNTc1NHww&ixlib=rb-4.1.0&fit=fillmax&h=800&w=1200"
      },
      {
        id: 2,
        name: "Valorant Champions Tour",
        date: "2023-05-20",
        teams: 16,
        description: "The official Valorant esports tournament featuring 16 teams competing for the championship title and a $50,000 prize.",
        status: "ongoing",
        image: "https://images.unsplash.com/photo-1607853202273-797f1c22a38e?ixid=M3w3MjUzNDh8MHwxfHNlYXJjaHwzfHxlc3BvcnRzJTIwZ2FtaW5nJTIwdG91cm5hbWVudCUyMGFyZW5hJTIwY3liZXJwdW5rfGVufDB8fHx8MTc0NzQwNTc1NHww&ixlib=rb-4.1.0&fit=fillmax&h=800&w=1200"
      },
      {
        id: 3,
        name: "League of Legends Championship",
        date: "2023-04-10",
        teams: 12,
        description: "The ultimate LoL tournament showcasing the best teams battling for supremacy and the championship title.",
        status: "past",
        image: "https://images.unsplash.com/photo-1557515126-1bf9ada5cb93?ixid=M3w3MjUzNDh8MHwxfHNlYXJjaHwxMHx8ZXNwb3J0cyUyMGdhbWluZyUyMHRvdXJuYW1lbnQlMjBhcmVuYSUyMGN5YmVycHVua3xlbnwwfHx8fDE3NDc0MDU3NTR8MA&ixlib=rb-4.1.0&fit=fillmax&h=800&w=1200",
        winners: "Team Nexus",
        highlights: "https://images.unsplash.com/photo-1601042879364-f3947d3f9c16?ixid=M3w3MjUzNDh8MHwxfHNlYXJjaHw0fHxlc3BvcnRzJTIwZ2FtaW5nJTIwdG91cm5hbWVudCUyMGFyZW5hJTIwY3liZXJwdW5rfGVufDB8fHx8MTc0NzQwNTc1NHww&ixlib=rb-4.1.0&fit=fillmax&h=800&w=1200"
      }
    ];
    
    localStorage.setItem('tournaments', JSON.stringify(sampleTournaments));
  }
}

// Initialize sample data
addSampleData();
  