document.addEventListener('DOMContentLoaded', async function() {
  // Check if user is logged in
  if (!sessionStorage.getItem('loggedIn')) {
    window.location.href = 'login.html';
    return;
  }
  
  // Set username from sessionStorage
  const usernameElements = document.querySelectorAll('.admin-username');
  const username = sessionStorage.getItem('username') || 'Admin';
  
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
      sessionStorage.removeItem('loggedIn');
      sessionStorage.removeItem('username');
      
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
      const buttonGroup = document.querySelectorAll('.button-group');
      
      winnersGroup.forEach(group => {
        if (isPast) {
          group.classList.remove('hidden');
        } else {
          group.classList.add('hidden');
        }
      });
      
      buttonGroup.forEach(group => {
        if (isPast) {
          group.classList.add('hidden');
        } else {
          group.classList.remove('hidden');
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
    tournamentForm.addEventListener('submit', async function(e) {
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
      const buttonText = document.getElementById('tournament-button-text').value;
      const buttonUrl = document.getElementById('tournament-button-url').value;
      
      const tournament = {
        id: tournamentId ? parseInt(tournamentId) : undefined,
        name,
        date,
        teams,
        description,
        status,
        image,
        buttonText: status !== 'past' ? buttonText : '',
        buttonUrl: status !== 'past' ? buttonUrl : '',
        winners: status === 'past' ? winners : '',
        highlights: status === 'past' ? highlights : ''
      };
      
      // Show loading state
      const submitBtn = document.querySelector('#tournament-form button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.innerHTML = 'Saving... <i class="fas fa-spinner fa-spin"></i>';
      
      try {
        // Save tournament to Google Sheets
        const result = tournamentId ? await updateTournament(tournament) : await addTournament(tournament);
        
        if (result.success) {
          // Add activity log
          await addActivity({
            type: tournamentId ? 'edit' : 'add',
            text: tournamentId ? `Tournament updated: ${name}` : `New tournament created: ${name}`,
            time: `Today, ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
          });
          
          // Show success message
          const formMessage = document.getElementById('form-message');
          formMessage.textContent = tournamentId ? 'Tournament updated successfully!' : 'Tournament added successfully!';
          formMessage.className = 'success';
          formMessage.classList.remove('hidden');
          
          setTimeout(() => {
            formMessage.classList.add('hidden');
          }, 3000);
          
          // Close modal and reload data
          closeModal(tournamentModal);
          await loadAdminTournaments();
          await updateDashboardCounts();
          await loadActivityLog();
        } else {
          throw new Error('Failed to save tournament');
        }
      } catch (error) {
        console.error('Error saving tournament:', error);
        const formMessage = document.getElementById('form-message');
        formMessage.textContent = 'Error: Failed to save tournament. Please try again.';
        formMessage.className = 'error';
        formMessage.classList.remove('hidden');
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Save Tournament <i class="fas fa-save"></i>';
      }
    });
  }
  
  // Delete tournament
  if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener('click', async function() {
      const tournamentId = parseInt(document.getElementById('delete-tournament-id').value);
      const tournamentName = document.getElementById('delete-tournament-name').textContent;
      
      try {
        // Delete tournament from Google Sheets
        const result = await deleteTournament(tournamentId);
        
        if (result.success) {
          // Add activity log
          await addActivity({
            type: 'delete',
            text: `Tournament deleted: ${tournamentName}`,
            time: `Today, ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
          });
          
          // Close modal and reload data
          closeModal(deleteModal);
          await loadAdminTournaments();
          await updateDashboardCounts();
          await loadActivityLog();
        } else {
          throw new Error('Failed to delete tournament');
        }
      } catch (error) {
        console.error('Error deleting tournament:', error);
        alert('Error: Failed to delete tournament. Please try again.');
      }
    });
  }
  
  // Initialize data
  await loadInitialData();
  
  // Load admin tournaments
  await loadAdminTournaments();
  await updateDashboardCounts();
  await loadActivityLog();
  await loadContactMessages();
  
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
        sessionStorage.setItem('username', adminUsername);
        
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
        sessionStorage.setItem('username', adminUsername);
        
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
  
  async function loadAdminTournaments() {
    const upcomingTournaments = document.getElementById('admin-upcoming-tournaments');
    const ongoingTournaments = document.getElementById('admin-ongoing-tournaments');
    const pastTournaments = document.getElementById('admin-past-tournaments');
    
    // Clear existing content
    if (upcomingTournaments) upcomingTournaments.innerHTML = '';
    if (ongoingTournaments) ongoingTournaments.innerHTML = '';
    if (pastTournaments) pastTournaments.innerHTML = '';
    
    try {
      // Get tournaments from Google Sheets
      const tournaments = await fetchTournaments();
      
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
    } catch (error) {
      console.error('Error loading admin tournaments:', error);
      
      // Display error message
      if (upcomingTournaments) upcomingTournaments.innerHTML = '<p class="error-message">Failed to load tournaments. Please try again.</p>';
      if (ongoingTournaments) ongoingTournaments.innerHTML = '<p class="error-message">Failed to load tournaments. Please try again.</p>';
      if (pastTournaments) pastTournaments.innerHTML = '<p class="error-message">Failed to load tournaments. Please try again.</p>';
    }
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
          <button class="btn-danger delete-tournament" data-id="${tournament.id}" data-name="${tournament.name}">
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
        const tournamentId = parseInt(this.getAttribute('data-id'));
        editTournament(tournamentId);
      });
    });
    
    deleteButtons.forEach(button => {
      button.addEventListener('click', function() {
        const tournamentId = parseInt(this.getAttribute('data-id'));
        const tournamentName = this.getAttribute('data-name');
        openDeleteModal(tournamentId, tournamentName);
      });
    });
  }
  
  async function editTournament(id) {
    try {
      // Get tournament data from API
      const tournaments = await fetchTournaments();
      const tournament = tournaments.find(t => t.id === id);
      
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
        document.getElementById('tournament-button-text').value = tournament.buttonText || '';
        document.getElementById('tournament-button-url').value = tournament.buttonUrl || '';
        
        // Show/hide winners fields based on status
        const isPast = tournament.status === 'past';
        const buttonGroup = document.querySelectorAll('.button-group');
        
        winnersGroup.forEach(group => {
          if (isPast) {
            group.classList.remove('hidden');
          } else {
            group.classList.add('hidden');
          }
        });
        
        buttonGroup.forEach(group => {
          if (isPast) {
            group.classList.add('hidden');
          } else {
            group.classList.remove('hidden');
          }
        });
        
        // Open modal
        openModal(tournamentModal);
      }
    } catch (error) {
      console.error('Error editing tournament:', error);
      alert('Error loading tournament data. Please try again.');
    }
  }
  
  function openDeleteModal(id, name) {
    document.getElementById('delete-tournament-id').value = id;
    document.getElementById('delete-tournament-name').textContent = name || 'this tournament';
    openModal(deleteModal);
  }
  
  async function updateDashboardCounts() {
    try {
      const tournaments = await fetchTournaments();
      const messages = await fetchMessages();
      
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
    } catch (error) {
      console.error('Error updating dashboard counts:', error);
    }
  }
  
  async function loadActivityLog() {
    const activityList = document.getElementById('activity-list');
    
    if (!activityList) return;
    
    try {
      // Clear existing content
      activityList.innerHTML = '';
      
      // Get activity log from Google Sheets
      const activityLog = await fetchActivityLog();
      
      if (activityLog.length === 0) {
        activityList.innerHTML = '<p class="no-data">No activities recorded yet.</p>';
        return;
      }
      
      // Display activities
      activityLog.forEach(activity => {
        displayActivity(activityList, activity);
      });
    } catch (error) {
      console.error('Error loading activity log:', error);
      activityList.innerHTML = '<p class="error-message">Failed to load activities. Please try again.</p>';
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
  
  async function loadContactMessages() {
    const messagesList = document.getElementById('messages-list');
    
    if (!messagesList) return;
    
    try {
      // Clear existing content
      messagesList.innerHTML = '';
      
      // Get messages from Google Sheets
      const messages = await fetchMessages();
      
      // If no messages, show message
      if (messages.length === 0) {
        messagesList.innerHTML = '<p class="no-data">No messages received yet.</p>';
        return;
      }
      
      // Display messages
      messages.forEach((message) => {
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
            <button class="btn-secondary message-reply" data-email="${message.email}">
              <i class="fas fa-reply"></i> Reply
            </button>
            <button class="btn-danger message-delete" data-id="${message.id}">
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
          const email = this.getAttribute('data-email');
          
          // In a real application, this would open a reply form
          window.open(`mailto:${email}`, '_blank');
        });
      });
      
      deleteButtons.forEach(button => {
        button.addEventListener('click', async function() {
          const messageId = parseInt(this.getAttribute('data-id'));
          
          if (confirm('Are you sure you want to delete this message?')) {
            try {
              // Delete message from Google Sheets
              await deleteMessage(messageId);
              
              // Reload messages
              await loadContactMessages();
              await updateDashboardCounts();
            } catch (error) {
              console.error('Error deleting message:', error);
              alert('Failed to delete message. Please try again.');
            }
          }
        });
      });
    } catch (error) {
      console.error('Error loading contact messages:', error);
      messagesList.innerHTML = '<p class="error-message">Failed to load messages. Please try again.</p>';
    }
  }
  
  function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  }
}); 