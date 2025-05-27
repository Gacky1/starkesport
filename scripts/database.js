//  Database handler using Google Sheets API
const SHEET_API_URL = 'https://script.google.com/macros/s/AKfycbyfb0spD13nVtW_wQy_WRDeaC1rdMba-s4malFKe6cpcU5CfnQVIw0jlGMXY_vcphf3/exec';

// Function to fetch data from Google Sheets
async function fetchData(action) {
  try {
    const url = `${SHEET_API_URL}?action=${action}`;
    const response = await fetch(`https://hooks.jdoodle.net/proxy?url=${encodeURIComponent(url)}`);
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error(`Error fetching ${action}:`, error);
    return [];
  }
}

// Function to send data to Google Sheets
async function sendData(action, payload) {
  try {
    const url = SHEET_API_URL;
    console.log('Sending request to:', url);
    console.log('Action:', action);
    console.log('Payload:', payload);
    
    // For POST requests, use the URL directly without proxy
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: action,
        ...payload
      }),
      mode: 'no-cors' // Add this to handle CORS
    });
    
    // Since we're using no-cors, we can't check response.ok
    // Instead, we'll assume success if we get here
    console.log('Request sent successfully');
    return { success: true };
    
  } catch (error) {
    console.error(`Error sending ${action}:`, error);
    console.error('Full error details:', {
      message: error.message,
      stack: error.stack
    });
    return { success: false, error: error.message };
  }
}

// Tournament Functions
async function fetchTournaments() {
  return await fetchData('getTournaments');
}

async function addTournament(tournament) {
  // Validate required fields
  const requiredFields = ['name', 'date', 'teams', 'description', 'status', 'image'];
  const missingFields = requiredFields.filter(field => !tournament[field]);
  
  if (missingFields.length > 0) {
    console.error('Missing required fields:', missingFields);
    return { success: false, error: `Missing required fields: ${missingFields.join(', ')}` };
  }
  
  // Convert teams to number and validate
  const teams = parseInt(tournament.teams);
  if (isNaN(teams) || teams < 2) {
    return { success: false, error: 'Number of teams must be at least 2' };
  }
  
  // Update tournament object with parsed teams value
  tournament.teams = teams;
  
  if (!['upcoming', 'ongoing', 'past'].includes(tournament.status)) {
    return { success: false, error: 'Invalid tournament status' };
  }
  
  // Format date if needed
  if (tournament.date instanceof Date) {
    tournament.date = tournament.date.toISOString().split('T')[0];
  }
  
  console.log('Adding tournament:', tournament);
  return await sendData('addTournament', { tournament });
}

async function updateTournament(tournament) {
  return await sendData('updateTournament', { tournament });
}

async function deleteTournament(id) {
  return await sendData('deleteTournament', { id });
}

// Message Functions
async function fetchMessages() {
  return await fetchData('getMessages');
}

async function addMessage(message) {
  return await sendData('addMessage', { message });
}

async function deleteMessage(id) {
  return await sendData('deleteMessage', { id });
}

// Activity Log Functions
async function fetchActivityLog() {
  return await fetchData('getActivityLog');
}

async function addActivity(activity) {
  return await sendData('addActivity', { activity });
}

// For backwards compatibility and initial loading
async function loadInitialData() {
  // Get tournaments data
  let tournaments = await fetchTournaments();
  
  // If no tournaments, add sample data
  if (tournaments.length === 0) {
    const sampleTournaments = [
      {
        name: "Apex Legends Showdown",
        date: "2023-06-15",
        teams: 32,
        description: "The premier Apex Legends tournament featuring the top 32 teams from around the world competing for a prize pool of $100,000.",
        status: "upcoming",
        buttonText: "Register Now",
        buttonUrl: "https://example.com/register/apex",
        image: "https://images.unsplash.com/photo-1593305841991-05c297ba4575?ixid=M3w3MjUzNDh8MHwxfHNlYXJjaHwyfHxlc3BvcnRzJTIwZ2FtaW5nJTIwdG91cm5hbWVudCUyMGFyZW5hJTIwY3liZXJwdW5rfGVufDB8fHx8MTc0NzQwNTc1NHww&ixlib=rb-4.1.0&fit=fillmax&h=800&w=1200"
      },
      {
        name: "Valorant Champions Tour",
        date: "2023-05-20",
        teams: 16,
        description: "The official Valorant esports tournament featuring 16 teams competing for the championship title and a $50,000 prize.",
        status: "ongoing",
        buttonText: "Watch Live",
        buttonUrl: "https://example.com/watch/valorant",
        image: "https://images.unsplash.com/photo-1607853202273-797f1c22a38e?ixid=M3w3MjUzNDh8MHwxfHNlYXJjaHwzfHxlc3BvcnRzJTIwZ2FtaW5nJTIwdG91cm5hbWVudCUyMGFyZW5hJTIwY3liZXJwdW5rfGVufDB8fHx8MTc0NzQwNTc1NHww&ixlib=rb-4.1.0&fit=fillmax&h=800&w=1200"
      }, 
      {
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

    // Add sample tournaments
    for (const tournament of sampleTournaments) {
      await addTournament(tournament);
    }
    
    // Add sample activities
    const sampleActivities = [
      {
        type: 'add',
        text: 'New tournament created: Apex Legends Showdown',
        time: `Today, ${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`
      },
      {
        type: 'add',
        text: 'New tournament created: Valorant Champions Tour',
        time: `Today, ${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`
      }
    ];
    
    for (const activity of sampleActivities) {
      await addActivity(activity);
    }
  }
}
  