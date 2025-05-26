document.addEventListener('DOMContentLoaded',  function() {
  // Check if user is logged in
  if (localStorage.getItem('loggedIn') !== 'true') {
    window.location.href = 'login.html';
    return;
  }
  
  // Set username from localStorage
  const usernameElements = document.querySelectorAll('.admin-username');
  const username = localStorage.getItem('username') || 'Admin';
  
  usernameElements.forEach(element => {
    element.textContent = username;
  });
  
  // Sidebar navigation
  const navLinks = document.querySelectorAll('.sidebar-nav a');
  const sections = document.querySelectorAll('.section-content');
  const sectionTitle = document.getElementById('section-title');
  
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      
      const sectionId = this.getAttribute('data-section');
      
      // Remove active class from all links and sections
      navLinks.forEach(link => link.classList.remove('active'));
      sections.forEach(section => section.classList.remove('active'));
      
      // Add active class to clicked link and corresponding section
      this.classList.add('active');
      document.getElementById(`${sectionId}-section`).classList.add('active');
      
      // Update section title
      sectionTitle.textContent = this.textContent.trim();
    });
  });
  
  // Logout handler
  const logoutBtn = document.getElementById('logout-btn');
  
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Clear login state
      localStorage.removeItem('loggedIn');
      localStorage.removeItem('username');
      
      // Redirect to login page
      window.location.href = 'login.html';
    });
  }
  
  // Admin Tab functionality
  const adminTabButtons = document.querySelectorAll('.tournament-tabs .tab-btn');
  const adminTabContents = document.querySelectorAll('.tournament-tabs .tab-content');
  
  adminTabButtons.forEach(button => {
    button.addEventListener('click', function() {
      const tabId = this.getAttribute('data-tab');
      
      // Remove active class from all buttons and contents
      adminTabButtons.forEach(btn => btn.classList.remove('active'));
      adminTabContents.forEach(content => content.classList.remove('active'));
      
      // Add active class to clicked button and corresponding content
      this.classList.add('active');
      document.getElementById(`${tabId}-content`).classList.add('active');
    });
  });
  
  // Modal functionality
  const tournamentModal = document.getElementById('tournament-modal');
  const deleteModal = document.getElementById('delete-modal');
  const addTournamentBtns = document.querySelectorAll('#add-tournament-btn, #add-tournament-btn-2');
  const closeModalBtns = document.querySelectorAll('.close-modal');
  const cancelFormBtn = document.getElementById('cancel-form');
  const cancelDeleteBtn = document.getElementById('cancel-delete');
  const tournamentForm = document.getElementById('tournament-form');
  const confirmDeleteBtn = document.getElementById('confirm-delete');
  
  // Tournament status change handler
  const tournamentStatus = document.getElementById('tournament-status');
  const winnersGroup = document.querySelectorAll('.winners-group');
  
  if (tournamentStatus) {
    tournamentStatus.addEventListener('change', function() {
      const isPast = this.value === 'past';
      winnersGroup.forEach(group => {
        if (isPast) {
          group.classList.remove('hidden');
        } else {
          group.classList.add('hidden');
        }
      });
    });
  }
  
  // Open add tournament modal
  addTournamentBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      openModal(tournamentModal, true);
    });
  });
  
  // Close modals
  closeModalBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      const modal = this.closest('.modal');
      closeModal(modal);
    });
  });
  
  if (cancelFormBtn) {
    cancelFormBtn.addEventListener('click', function() {
      closeModal(tournamentModal);
    });
  }
  
  if (cancelDeleteBtn) {
    cancelDeleteBtn.addEventListener('click', function() {
      closeModal(deleteModal);
    });
  }
  
  // Close modal when clicking outside
  window.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) {
      closeModal(e.target);
    }
  });
  
  // Tournament form submission
  if (tournamentForm) {
    tournamentForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const tournamentId = document.getElementById('tournament-id').value;
      const name = document.getElementById('tournament-name').value;
      const date = document.getElementById('tournament-date').value;
      const teams = document.getElementById('tournament-teams').value;
      const description = document.getElementById('tournament-description').value;
      const status = document.getElementById('tournament-status').value;
      const image = document.getElementById('tournament-image').value;
      const winners = document.getElementById('tournament-winners').value;
      const highlights = document.getElementById('tournament-highlights').value;
      
      // Get existing tournaments
      let tournaments = JSON.parse(localStorage.getItem('tournaments')) || [];
      
      // Add activity log
      let activityLog = JSON.parse(localStorage.getItem('activityLog')) || [];
      const now = new Date();
      const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const dateString = now.toLocaleDateString();
      
      if (tournamentId) {
        // Edit existing tournament
        const index = tournaments.findIndex(t => t.id === parseInt(tournamentId));
        if (index !== -1) {
          tournaments[index] = {
            ...tournaments[index],
            name,
            date,
            teams,
            description,
            status,
            image,
            winners: status === 'past' ? winners : '',
            highlights: status === 'past' ? highlights : ''
          };
          
          // Log activity
          activityLog.unshift({
            type: 'edit',
            text: `Tournament updated: ${name}`,
            time: `Today, ${timeString}`
          });
        }
      } else {
        // Add new tournament
        const newId = tournaments.length > 0 ? Math.max(...tournaments.map(t => t.id)) + 1 : 1;
        tournaments.push({
          id: newId,
          name,
          date,
          teams,
          description,
          status,
          image,
          winners: status === 'past' ? winners : '',
          highlights: status === 'past' ? highlights : ''
        });
        
        // Log activity
        activityLog.unshift({
          type: 'add',
          text: `New tournament created: ${name}`,
          time: `Today, ${timeString}`
        });
      }
      
      // Keep only the latest 10 activities
      activityLog = activityLog.slice(0, 10);
      
      // Save to localStorage
      localStorage.setItem('tournaments', JSON.stringify(tournaments));
      localStorage.setItem('activityLog', JSON.stringify(activityLog));
      
      // Close modal and reload data
      closeModal(tournamentModal);
      loadAdminTournaments();
      updateDashboardCounts();
      loadActivityLog();
    });
  }
  
  // Delete tournament
  if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener('click', function() {
      const tournamentId = document.getElementById('delete-tournament-id').value;
      
      // Get existing tournaments
      let tournaments = JSON.parse(localStorage.getItem('tournaments')) || [];
      
      // Find tournament name before deleting
      const tournament = tournaments.find(t => t.id === parseInt(tournamentId));
      const tournamentName = tournament ? tournament.name : 'Unknown tournament';
      
      // Remove tournament with matching id
      tournaments = tournaments.filter(t => t.id !== parseInt(tournamentId));
      
      // Log activity
      let activityLog = JSON.parse(localStorage.getItem('activityLog')) || [];
      const now = new Date();
      const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      activityLog.unshift({
        type: 'delete',
        text: `Tournament deleted: ${tournamentName}`,
        time: `Today, ${timeString}`
      });
      
      // Keep only the latest 10 activities
      activityLog = activityLog.slice(0, 10);
      
      // Save to localStorage
      localStorage.setItem('tournaments', JSON.stringify(tournaments));
      localStorage.setItem('activityLog', JSON.stringify(activityLog));
      
      // Close modal and reload data
      closeModal(deleteModal);
      loadAdminTournaments();
      updateDashboardCounts();
      loadActivityLog();
    });
  }
  
  // Load admin tournaments
  loadAdminTournaments();
  updateDashboardCounts();
  loadActivityLog();
  loadContactMessages();
  
  // Quick action handlers
  const viewMessagesBtn = document.getElementById('view-messages-btn');
  const siteSettingsBtn = document.getElementById('site-settings-btn');
  
  if (viewMessagesBtn) {
    viewMessagesBtn.addEventListener('click', function() {
      // Navigate to messages section
      navLinks.forEach(link => link.classList.remove('active'));
      sections.forEach(section => section.classList.remove('active'));
      
      const messagesLink = document.querySelector('[data-section="messages"]');
      messagesLink.classList.add('active');
      document.getElementById('messages-section').classList.add('active');
      
      sectionTitle.textContent = 'Messages';
    });
  }
  
  if (siteSettingsBtn) {
    siteSettingsBtn.addEventListener('click', function() {
      // Navigate to settings section
      navLinks.forEach(link => link.classList.remove('active'));
      sections.forEach(section => section.classList.remove('active'));
      
      const settingsLink = document.querySelector('[data-section="settings"]');
      settingsLink.classList.add('active');
      document.getElementById('settings-section').classList.add('active');
      
      sectionTitle.textContent = 'Settings';
    });
  }
  
  // Settings form handler
  const adminSettingsForm = document.getElementById('admin-settings-form');
  
  if (adminSettingsForm) {
    adminSettingsForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const adminUsername = document.getElementById('admin-username').value;
      const currentPassword = document.getElementById('current-password').value;
      const newPassword = document.getElementById('new-password').value;
      const confirmPassword = document.getElementById('confirm-password').value;
      
      // Simple validation for demo
      if (currentPassword && newPassword) {
        if (currentPassword !== 'admin123') {
          alert('Current password is incorrect.');
          return;
        }
        
        if (newPassword !== confirmPassword) {
          alert('New passwords do not match.');
          return;
        }
        
        // Password would be updated in a real application
        alert('Settings updated successfully!');
        
        // Update username
        localStorage.setItem('username', adminUsername);
        
        // Update displayed username
        usernameElements.forEach(element => {
          element.textContent = adminUsername;
        });
        
        // Clear password fields
        document.getElementById('current-password').value = '';
        document.getElementById('new-password').value = '';
        document.getElementById('confirm-password').value = '';
      } else if (adminUsername !== username) {
        // Just update username
        localStorage.setItem('username', adminUsername);
        
        // Update displayed username
        usernameElements.forEach(element => {
          element.textContent = adminUsername;
        });
        
        alert('Username updated successfully!');
      }
    });
  }
  
  // Helper functions
  function openModal(modal, isAdd = false) {
    if (isAdd && modal === tournamentModal) {
      // Reset form for adding new tournament
      document.getElementById('modal-title').textContent = 'Add Tournament';
      document.getElementById('tournament-id').value = '';
      document.getElementById('tournament-form').reset();
      
      // Hide winners fields initially
      winnersGroup.forEach(group => group.classList.add('hidden'));
    }
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
  }
  
  function closeModal(modal) {
    modal.classList.remove('active');
    document.body.style.overflow = ''; // Restore scrolling
  }
  
  function loadAdminTournaments() {
    const upcomingTournaments = document.getElementById('admin-upcoming-tournaments');
    const ongoingTournaments = document.getElementById('admin-ongoing-tournaments');
    const pastTournaments = document.getElementById('admin-past-tournaments');
    
    // Clear existing content
    if (upcomingTournaments) upcomingTournaments.innerHTML = '';
    if (ongoingTournaments) ongoingTournaments.innerHTML = '';
    if (pastTournaments) pastTournaments.innerHTML = '';
    
    // Get tournaments from localStorage
    let tournaments = JSON.parse(localStorage.getItem('tournaments')) || [];
    
    // Filter tournaments by status
    const upcoming = tournaments.filter(tournament => tournament.status === 'upcoming');
    const ongoing = tournaments.filter(tournament => tournament.status === 'ongoing');
    const past = tournaments.filter(tournament => tournament.status === 'past');
    
    // Display tournaments
    if (upcomingTournaments) displayAdminTournaments(upcomingTournaments, upcoming);
    if (ongoingTournaments) displayAdminTournaments(ongoingTournaments, ongoing);
    if (pastTournaments) displayAdminTournaments(pastTournaments, past);
    
    // Display message if no tournaments found
    if (upcomingTournaments && upcoming.length === 0) upcomingTournaments.innerHTML = '<p class="no-data">No upcoming tournaments available.</p>';
    if (ongoingTournaments && ongoing.length === 0) ongoingTournaments.innerHTML = '<p class="no-data">No ongoing tournaments available.</p>';
    if (pastTournaments && past.length === 0) pastTournaments.innerHTML = '<p class="no-data">No past tournaments available.</p>';
  }
  
  function displayAdminTournaments(container, tournaments) {
    tournaments.forEach(tournament => {
      const tournamentElement = document.createElement('div');
      tournamentElement.className = 'admin-tournament-item';
      
      tournamentElement.innerHTML = `
        <div class="tournament-info">
          <h4>${tournament.name}</h4>
          <p>${formatDate(tournament.date)} | ${tournament.teams} Teams</p>
        </div>
        <div class="tournament-actions">
          <button class="btn-primary edit-tournament" data-id="${tournament.id}">
            <i class="fas fa-edit"></i> Edit
          </button>
          <button class="btn-danger delete-tournament" data-id="${tournament.id}">
            <i class="fas fa-trash"></i> Delete
          </button>
        </div>
      `;
      
      container.appendChild(tournamentElement);
    });
    
    // Add event listeners to edit and delete buttons
    const editButtons = container.querySelectorAll('.edit-tournament');
    const deleteButtons = container.querySelectorAll('.delete-tournament');
    
    editButtons.forEach(button => {
      button.addEventListener('click', function() {
        const tournamentId = this.getAttribute('data-id');
        editTournament(tournamentId);
      });
    });
    
    deleteButtons.forEach(button => {
      button.addEventListener('click', function() {
        const tournamentId = this.getAttribute('data-id');
        openDeleteModal(tournamentId);
      });
    });
  }
  
  function editTournament(id) {
    // Get tournament data
    const tournaments = JSON.parse(localStorage.getItem('tournaments')) || [];
    const tournament = tournaments.find(t => t.id === parseInt(id));
    
    if (tournament) {
      // Set modal title
      document.getElementById('modal-title').textContent = 'Edit Tournament';
      
      // Fill form with tournament data
      document.getElementById('tournament-id').value = tournament.id;
      document.getElementById('tournament-name').value = tournament.name;
      document.getElementById('tournament-date').value = tournament.date;
      document.getElementById('tournament-teams').value = tournament.teams;
      document.getElementById('tournament-description').value = tournament.description;
      document.getElementById('tournament-status').value = tournament.status;
      document.getElementById('tournament-image').value = tournament.image;
      document.getElementById('tournament-winners').value = tournament.winners || '';
      document.getElementById('tournament-highlights').value = tournament.highlights || '';
      
      // Show/hide winners fields based on status
      const isPast = tournament.status === 'past';
      winnersGroup.forEach(group => {
        if (isPast) {
          group.classList.remove('hidden');
        } else {
          group.classList.add('hidden');
        }
      });
      
      // Open modal
      openModal(tournamentModal);
    }
  }
  
  function openDeleteModal(id) {
    document.getElementById('delete-tournament-id').value = id;
    openModal(deleteModal);
  }
  
  function updateDashboardCounts() {
    const tournaments = JSON.parse(localStorage.getItem('tournaments')) || [];
    const messages = JSON.parse(localStorage.getItem('contactMessages')) || [];
    
    const upcomingCount = tournaments.filter(t => t.status === 'upcoming').length;
    const ongoingCount = tournaments.filter(t => t.status === 'ongoing').length;
    const pastCount = tournaments.filter(t => t.status === 'past').length;
    
    const upcomingCountElement = document.getElementById('upcoming-count');
    const ongoingCountElement = document.getElementById('ongoing-count');
    const pastCountElement = document.getElementById('past-count');
    const messageCountElement = document.getElementById('message-count');
    
    if (upcomingCountElement) upcomingCountElement.textContent = upcomingCount;
    if (ongoingCountElement) ongoingCountElement.textContent = ongoingCount;
    if (pastCountElement) pastCountElement.textContent = pastCount;
    if (messageCountElement) messageCountElement.textContent = messages.length;
  }
  
  function loadActivityLog() {
    const activityList = document.getElementById('activity-list');
    
    if (!activityList) return;
    
    // Clear existing content
    activityList.innerHTML = '';
    
    // Get activity log from localStorage
    const activityLog = JSON.parse(localStorage.getItem('activityLog')) || [];
    
    // If no activities, add sample activities
    if (activityLog.length === 0) {
      const sampleActivities = [
        {
          type: 'add',
          text: 'New tournament created: Apex Legends Showdown',
          time: 'Today, 10:23 AM'
        },
        {
          type: 'edit',
          text: 'Tournament updated: Valorant Champions Tour',
          time: 'Yesterday, 3:45 PM'
        }
      ];
      
      localStorage.setItem('activityLog', JSON.stringify(sampleActivities));
      
      // Display sample activities
      sampleActivities.forEach(activity => {
        displayActivity(activityList, activity);
      });
    } else {
      // Display actual activities
      activityLog.forEach(activity => {
        displayActivity(activityList, activity);
      });
    }
  }
  
  function displayActivity(container, activity) {
    const activityElement = document.createElement('li');
    activityElement.className = 'activity-item';
    
    let iconClass = 'fa-exclamation-circle';
    
    if (activity.type === 'add') {
      iconClass = 'fa-plus-circle';
    } else if (activity.type === 'edit') {
      iconClass = 'fa-edit';
    } else if (activity.type === 'delete') {
      iconClass = 'fa-trash';
    }
    
    activityElement.innerHTML = `
      <span class="activity-icon"><i class="fas ${iconClass}"></i></span>
      <div class="activity-details">
        <p>${activity.text}</p>
        <span class="activity-time">${activity.time}</span>
      </div>
    `;
    
    container.appendChild(activityElement);
  }
  
  function loadContactMessages() {
    const messagesList = document.getElementById('messages-list');
    
    if (!messagesList) return;
    
    // Clear existing content
    messagesList.innerHTML = '';
    
    // Get messages from localStorage
    const messages = JSON.parse(localStorage.getItem('contactMessages')) || [];
    
    // If no messages, show message
    if (messages.length === 0) {
      messagesList.innerHTML = '<p class="no-data">No messages received yet.</p>';
      return;
    }
    
    // Display messages
    messages.forEach((message, index) => {
      const messageElement = document.createElement('div');
      messageElement.className = 'message-item';
      
      const date = new Date(message.date);
      const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      messageElement.innerHTML = `
        <div class="message-header">
          <div class="message-info">
            <h4>${message.name}</h4>
            <p>${message.email}</p>
          </div>
          <div class="message-date">${formattedDate}</div>
        </div>
        <div class="message-content">
          ${message.message}
        </div>
        <div class="message-actions">
          <button class="btn-secondary message-reply" data-index="${index}">
            <i class="fas fa-reply"></i> Reply
          </button>
          <button class="btn-danger message-delete" data-index="${index}">
            <i class="fas fa-trash"></i> Delete
          </button>
        </div>
      `;
      
      messagesList.appendChild(messageElement);
    });
    
    // Add event listeners to reply and delete buttons
    const replyButtons = messagesList.querySelectorAll('.message-reply');
    const deleteButtons = messagesList.querySelectorAll('.message-delete');
    
    replyButtons.forEach(button => {
      button.addEventListener('click', function() {
        const index = this.getAttribute('data-index');
        const message = messages[index];
        
        // In a real application, this would open a reply form
        alert(`Reply to ${message.name} at ${message.email}\n\nOriginal message: ${message.message}`);
      });
    });
    
    deleteButtons.forEach(button => {
      button.addEventListener('click', function() {
        const index = this.getAttribute('data-index');
        
        if (confirm('Are you sure you want to delete this message?')) {
          // Remove message
          messages.splice(index, 1);
          
          // Save to localStorage
          localStorage.setItem('contactMessages', JSON.stringify(messages));
          
          // Reload messages
          loadContactMessages();
          updateDashboardCounts();
        }
      });
    });
  }
  
  function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  }
  
  // Add sample data if not exists
  addSampleData();
});

// Add sample data if not exists
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
  
  if (!localStorage.getItem('activityLog')) {
    const sampleActivities = [
      {
        type: 'add',
        text: 'New tournament created: Apex Legends Showdown',
        time: 'Today, 10:23 AM'
      },
      {
        type: 'edit',
        text: 'Tournament updated: Valorant Champions Tour',
        time: 'Yesterday, 3:45 PM'
      }
    ];
    
    localStorage.setItem('activityLog', JSON.stringify(sampleActivities));
  }
  
  if (!localStorage.getItem('contactMessages')) {
    const sampleMessages = [
      {
        name: "John Smith",
        email: "john@example.com",
        message: "I'm interested in participating in the upcoming Apex Legends tournament. Could you provide more information about registration?",
        date: new Date(Date.now() - 86400000).toISOString() // 1 day ago
      },
      {
        name: "Sara Johnson",
        email: "sara@example.com",
        message: "Great organization! I attended the last Valorant tournament and it was amazing. Looking forward to the next one.",
        date: new Date(Date.now() - 172800000).toISOString() // 2 days ago
      }
    ];
    
    localStorage.setItem('contactMessages', JSON.stringify(sampleMessages));
  }
}
  