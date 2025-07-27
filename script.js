// Game State
let gameState = {
    currentScreen: 'main-menu',
    selectedTeam: null,
    season: 2024,
    week: 1,
    gameWeek: 1,
    teamStats: {
        offense: 75,
        defense: 72,
        specialTeams: 70,
        overall: 72
    },
    record: {
        wins: 0,
        losses: 0,
        confWins: 0,
        confLosses: 0
    },
    prestige: 2,
    coachName: 'Smith',
    schedule: [],
    playedGames: [],
    newsItems: [],
    availableRecruits: [],
    practiceUsed: false
};

// College Football Teams Data
const teams = [
    { id: 'alabama', name: 'Alabama Crimson Tide', conference: 'SEC', logo: 'ALA', colors: ['#A6192E', '#FFFFFF'] },
    { id: 'georgia', name: 'Georgia Bulldogs', conference: 'SEC', logo: 'UGA', colors: ['#BA0C2F', '#000000'] },
    { id: 'michigan', name: 'Michigan Wolverines', conference: 'Big Ten', logo: 'MICH', colors: ['#00274C', '#FFCB05'] },
    { id: 'ohio-state', name: 'Ohio State Buckeyes', conference: 'Big Ten', logo: 'OSU', colors: ['#BB0000', '#FFFFFF'] },
    { id: 'texas', name: 'Texas Longhorns', conference: 'Big 12', logo: 'TEX', colors: ['#BF5700', '#FFFFFF'] },
    { id: 'oklahoma', name: 'Oklahoma Sooners', conference: 'Big 12', logo: 'OU', colors: ['#841617', '#FDD116'] },
    { id: 'clemson', name: 'Clemson Tigers', conference: 'ACC', logo: 'CLEM', colors: ['#F56600', '#522D80'] },
    { id: 'notre-dame', name: 'Notre Dame Fighting Irish', conference: 'Independent', logo: 'ND', colors: ['#0C2340', '#C99700'] },
    { id: 'usc', name: 'USC Trojans', conference: 'Pac-12', logo: 'USC', colors: ['#990000', '#FFCC00'] },
    { id: 'oregon', name: 'Oregon Ducks', conference: 'Pac-12', logo: 'ORE', colors: ['#154733', '#FEE123'] },
    { id: 'florida', name: 'Florida Gators', conference: 'SEC', logo: 'FLA', colors: ['#0021A5', '#FA4616'] },
    { id: 'lsu', name: 'LSU Tigers', conference: 'SEC', logo: 'LSU', colors: ['#461D7C', '#FDD023'] }
];

// Initialize the game
document.addEventListener('DOMContentLoaded', function() {
    showScreen('main-menu');
    generateAvailableRecruits();
});

// Screen Management
function showScreen(screenId) {
    // Hide all screens
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Show target screen
    document.getElementById(screenId).classList.add('active');
    gameState.currentScreen = screenId;
}

// Navigation Functions
function showMainMenu() {
    showScreen('main-menu');
}

function showTeamSelection() {
    showScreen('team-selection');
    populateTeamGrid();
}

function showRules() {
    document.getElementById('rules-modal').classList.add('show');
}

function showCredits() {
    alert('College Football Dynasty Simulator\nCreated with passion for college football!\n\nFeatures:\n- Team Management\n- Game Simulation\n- Player Recruitment\n- Dynasty Building');
}

// Team Selection
function populateTeamGrid() {
    const teamGrid = document.getElementById('team-grid');
    teamGrid.innerHTML = '';
    
    teams.forEach(team => {
        const teamCard = document.createElement('div');
        teamCard.className = 'team-card';
        teamCard.onclick = () => selectTeam(team);
        
        teamCard.innerHTML = `
            <div class="team-logo-placeholder" style="background: linear-gradient(45deg, ${team.colors[0]}, ${team.colors[1] || team.colors[0]}); color: ${team.colors[1] || '#FFFFFF'}; font-weight: bold; font-size: 1.2rem;">${team.logo}</div>
            <h3>${team.name}</h3>
            <p>${team.conference}</p>
        `;
        
        teamGrid.appendChild(teamCard);
    });
}

function selectTeam(team) {
    // Remove previous selection
    document.querySelectorAll('.team-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    // Select new team
    const selectedCard = event.target.closest('.team-card');
    selectedCard.classList.add('selected');
    gameState.selectedTeam = team;
    
    // Add loading feedback
    selectedCard.innerHTML += '<div style="margin-top: 1rem; color: #28a745; font-weight: bold;"><i class="fas fa-spinner fa-spin"></i> Loading...</div>';
    
    // Start the game after a short delay
    setTimeout(() => {
        startGame();
    }, 1500);
}

function startGame() {
    if (!gameState.selectedTeam) return;
    
    // Initialize game state
    generateSchedule();
    addNewsItem(`Welcome to ${gameState.selectedTeam.name}! Your journey as head coach begins now.`);
    addNewsItem('Focus on recruiting, practice, and game preparation to build a championship team.');
    
    // Update UI
    updateDashboard();
    showScreen('game-dashboard');
}

// Dashboard Updates
function updateDashboard() {
    // Update team info
    document.getElementById('team-name').textContent = gameState.selectedTeam.name;
    const teamLogo = document.getElementById('team-logo');
    teamLogo.innerHTML = gameState.selectedTeam.logo;
    teamLogo.style.background = `linear-gradient(45deg, ${gameState.selectedTeam.colors[0]}, ${gameState.selectedTeam.colors[1] || gameState.selectedTeam.colors[0]})`;
    teamLogo.style.color = gameState.selectedTeam.colors[1] || '#FFFFFF';
    document.getElementById('team-record').textContent = 
        `${gameState.record.wins}-${gameState.record.losses} (Conference: ${gameState.record.confWins}-${gameState.record.confLosses})`;
    
    // Update season info
    document.getElementById('season-year').textContent = `${gameState.season} Season`;
    document.getElementById('week-info').textContent = `Week ${gameState.week}`;
    
    // Update coach info
    document.getElementById('coach-name').textContent = gameState.coachName;
    document.getElementById('prestige').textContent = '★'.repeat(gameState.prestige) + '☆'.repeat(5 - gameState.prestige);
    
    // Update team stats
    document.getElementById('offense-rating').textContent = gameState.teamStats.offense;
    document.getElementById('defense-rating').textContent = gameState.teamStats.defense;
    document.getElementById('special-teams').textContent = gameState.teamStats.specialTeams;
    document.getElementById('overall-rating').textContent = gameState.teamStats.overall;
    
    updateScheduleDisplay();
    updateNewsDisplay();
    updateActionButtons();
}

function updateScheduleDisplay() {
    const scheduleList = document.getElementById('schedule-list');
    scheduleList.innerHTML = '';
    
    // Show next 5 games
    const upcomingGames = gameState.schedule.slice(gameState.gameWeek - 1, gameState.gameWeek + 4);
    
    upcomingGames.forEach((game, index) => {
        const gameItem = document.createElement('div');
        gameItem.className = 'schedule-item';
        if (game.played) gameItem.classList.add('completed');
        
        const opponent = game.opponent;
        const isHome = game.isHome;
        const result = game.result || '';
        
        gameItem.innerHTML = `
            <div>
                <strong>Week ${game.week}: ${isHome ? 'vs' : '@'} ${opponent.name}</strong>
                <br><small>${opponent.conference} • ${result}</small>
            </div>
            <div>${game.played ? (game.won ? 'W' : 'L') : '📅'}</div>
        `;
        
        scheduleList.appendChild(gameItem);
    });
}

function updateNewsDisplay() {
    const newsFeed = document.getElementById('news-feed');
    newsFeed.innerHTML = '';
    
    // Show latest 5 news items
    gameState.newsItems.slice(-5).reverse().forEach(news => {
        const newsItem = document.createElement('div');
        newsItem.className = 'news-item';
        newsItem.innerHTML = `
            <p>${news.message}</p>
            <small>${news.timestamp}</small>
        `;
        newsFeed.appendChild(newsItem);
    });
}

function updateActionButtons() {
    const simulateBtn = document.getElementById('simulate-btn');
    const advanceBtn = document.getElementById('advance-btn');
    
    const currentGame = gameState.schedule[gameState.gameWeek - 1];
    
    if (currentGame && !currentGame.played) {
        simulateBtn.style.display = 'flex';
        advanceBtn.style.display = 'none';
    } else {
        simulateBtn.style.display = 'none';
        advanceBtn.style.display = 'flex';
    }
}

// Schedule Generation
function generateSchedule() {
    gameState.schedule = [];
    const availableOpponents = teams.filter(t => t.id !== gameState.selectedTeam.id);
    
    // Generate 12 regular season games
    for (let week = 1; week <= 12; week++) {
        const opponent = availableOpponents[Math.floor(Math.random() * availableOpponents.length)];
        const isHome = Math.random() > 0.5;
        const isConference = opponent.conference === gameState.selectedTeam.conference;
        
        gameState.schedule.push({
            week: week,
            opponent: opponent,
            isHome: isHome,
            isConference: isConference,
            played: false,
            won: false,
            result: ''
        });
    }
}

// Game Simulation
function simulateNextGame() {
    const currentGame = gameState.schedule[gameState.gameWeek - 1];
    if (!currentGame || currentGame.played) return;
    
    // Add visual feedback
    const simulateBtn = document.getElementById('simulate-btn');
    simulateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Simulating Game...';
    simulateBtn.disabled = true;
    
    // Simulate game after short delay for suspense
    setTimeout(() => {
        runGameSimulation(currentGame);
        simulateBtn.innerHTML = '<i class="fas fa-fast-forward"></i> Simulate Next Game';
        simulateBtn.disabled = false;
    }, 2000);
}

function runGameSimulation(currentGame) {
    
    // Calculate team strengths
    const playerStrength = gameState.teamStats.overall;
    const opponentStrength = Math.floor(Math.random() * 30) + 60; // Random opponent strength 60-90
    
    // Home field advantage
    const homeAdvantage = currentGame.isHome ? 3 : 0;
    const adjustedPlayerStrength = playerStrength + homeAdvantage;
    
    // More realistic scoring simulation
    const playerScoreBase = Math.floor(adjustedPlayerStrength / 4) + Math.floor(Math.random() * 21); // 0-20 random + strength
    const opponentScoreBase = Math.floor(opponentStrength / 4) + Math.floor(Math.random() * 21);
    
    // Add some variance for exciting games
    const playerScore = Math.max(0, playerScoreBase + (Math.random() > 0.8 ? Math.floor(Math.random() * 14) : 0));
    const opponentScore = Math.max(0, opponentScoreBase + (Math.random() > 0.8 ? Math.floor(Math.random() * 14) : 0));
    
    const won = playerScore > opponentScore;
    
    // Update game result
    currentGame.played = true;
    currentGame.won = won;
    currentGame.playerScore = playerScore;
    currentGame.opponentScore = opponentScore;
    currentGame.result = `${playerScore}-${opponentScore} ${won ? 'W' : 'L'}`;
    
    // Update record
    if (won) {
        gameState.record.wins++;
        if (currentGame.isConference) gameState.record.confWins++;
    } else {
        gameState.record.losses++;
        if (currentGame.isConference) gameState.record.confLosses++;
    }
    
    // Update team stats based on performance
    if (won) {
        // Small improvement for wins
        gameState.teamStats.offense = Math.min(99, gameState.teamStats.offense + Math.floor(Math.random() * 2));
        gameState.teamStats.defense = Math.min(99, gameState.teamStats.defense + Math.floor(Math.random() * 2));
    }
    
    updateOverallRating();
    
    // Show game result modal
    showGameResult(currentGame);
    
    // Add news
    const newsMessage = won ? 
        `🎉 Victory! ${gameState.selectedTeam.name} defeats ${currentGame.opponent.name} ${playerScore}-${opponentScore}!` :
        `😞 Tough loss. ${currentGame.opponent.name} beats ${gameState.selectedTeam.name} ${opponentScore}-${playerScore}.`;
    
    addNewsItem(newsMessage);
    
    updateDashboard();
}

function showGameResult(game) {
    const modal = document.getElementById('game-modal');
    
    // Update modal content
    document.getElementById('game-matchup').textContent = 
        `${gameState.selectedTeam.name} ${game.isHome ? 'vs' : '@'} ${game.opponent.name}`;
    document.getElementById('game-week').textContent = `Week ${game.week}`;
    
    // Home team (or selected team if away)
    if (game.isHome) {
        document.getElementById('home-team').textContent = gameState.selectedTeam.name;
        document.getElementById('home-score').textContent = game.playerScore;
        document.getElementById('away-team').textContent = game.opponent.name;
        document.getElementById('away-score').textContent = game.opponentScore;
        const homeLogo = document.getElementById('home-logo');
        homeLogo.innerHTML = gameState.selectedTeam.logo;
        homeLogo.style.background = `linear-gradient(45deg, ${gameState.selectedTeam.colors[0]}, ${gameState.selectedTeam.colors[1] || gameState.selectedTeam.colors[0]})`;
        homeLogo.style.color = gameState.selectedTeam.colors[1] || '#FFFFFF';
        
        const awayLogo = document.getElementById('away-logo');
        awayLogo.innerHTML = game.opponent.logo;
        awayLogo.style.background = `linear-gradient(45deg, ${game.opponent.colors[0]}, ${game.opponent.colors[1] || game.opponent.colors[0]})`;
        awayLogo.style.color = game.opponent.colors[1] || '#FFFFFF';
    } else {
        document.getElementById('home-team').textContent = game.opponent.name;
        document.getElementById('home-score').textContent = game.opponentScore;
        document.getElementById('away-team').textContent = gameState.selectedTeam.name;
        document.getElementById('away-score').textContent = game.playerScore;
        const homeLogo = document.getElementById('home-logo');
        homeLogo.innerHTML = game.opponent.logo;
        homeLogo.style.background = `linear-gradient(45deg, ${game.opponent.colors[0]}, ${game.opponent.colors[1] || game.opponent.colors[0]})`;
        homeLogo.style.color = game.opponent.colors[1] || '#FFFFFF';
        
        const awayLogo = document.getElementById('away-logo');
        awayLogo.innerHTML = gameState.selectedTeam.logo;
        awayLogo.style.background = `linear-gradient(45deg, ${gameState.selectedTeam.colors[0]}, ${gameState.selectedTeam.colors[1] || gameState.selectedTeam.colors[0]})`;
        awayLogo.style.color = gameState.selectedTeam.colors[1] || '#FFFFFF';
    }
    
    // Game stats
    const statsContent = document.getElementById('game-stats-content');
    statsContent.innerHTML = `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div>
                <strong>${gameState.selectedTeam.name}</strong><br>
                Total Yards: ${Math.floor(Math.random() * 200) + 300}<br>
                Passing: ${Math.floor(Math.random() * 150) + 150}<br>
                Rushing: ${Math.floor(Math.random() * 150) + 100}<br>
                Turnovers: ${Math.floor(Math.random() * 4)}
            </div>
            <div>
                <strong>${game.opponent.name}</strong><br>
                Total Yards: ${Math.floor(Math.random() * 200) + 300}<br>
                Passing: ${Math.floor(Math.random() * 150) + 150}<br>
                Rushing: ${Math.floor(Math.random() * 150) + 100}<br>
                Turnovers: ${Math.floor(Math.random() * 4)}
            </div>
        </div>
    `;
    
    modal.classList.add('show');
}

function closeGameModal() {
    document.getElementById('game-modal').classList.remove('show');
}

// Week Advancement
function advanceWeek() {
    gameState.week++;
    gameState.gameWeek++;
    gameState.practiceUsed = false;
    
    // Check if season is over
    if (gameState.gameWeek > 12) {
        endSeason();
        return;
    }
    
    // Random events
    if (Math.random() < 0.3) {
        generateRandomEvent();
    }
    
    updateDashboard();
}

function endSeason() {
    const totalWins = gameState.record.wins;
    let message = '';
    
    if (totalWins >= 10) {
        message = '🏆 Outstanding season! Championship hopes are alive!';
        gameState.prestige = Math.min(5, gameState.prestige + 1);
    } else if (totalWins >= 8) {
        message = '🎉 Great season! Bowl game bound!';
        gameState.prestige = Math.min(5, gameState.prestige + 1);
    } else if (totalWins >= 6) {
        message = '👍 Decent season. Room for improvement.';
    } else {
        message = '😞 Disappointing season. Time to rebuild.';
        gameState.prestige = Math.max(1, gameState.prestige - 1);
    }
    
    addNewsItem(message);
    addNewsItem(`Final Record: ${gameState.record.wins}-${gameState.record.losses}`);
    
    // Reset for new season
    setTimeout(() => {
        if (confirm('Season complete! Start a new season?')) {
            startNewSeason();
        }
    }, 2000);
}

function startNewSeason() {
    gameState.season++;
    gameState.week = 1;
    gameState.gameWeek = 1;
    gameState.record = { wins: 0, losses: 0, confWins: 0, confLosses: 0 };
    gameState.practiceUsed = false;
    
    generateSchedule();
    generateAvailableRecruits();
    
    addNewsItem(`Welcome to the ${gameState.season} season! New challenges await.`);
    updateDashboard();
}

// Recruitment System
function generateAvailableRecruits() {
    const positions = ['QB', 'RB', 'WR', 'TE', 'OL', 'DL', 'LB', 'DB', 'K'];
    const firstNames = ['James', 'Michael', 'Robert', 'John', 'David', 'William', 'Richard', 'Joseph', 'Thomas', 'Christopher'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
    
    gameState.availableRecruits = [];
    
    for (let i = 0; i < 10; i++) {
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        const position = positions[Math.floor(Math.random() * positions.length)];
        const rating = Math.floor(Math.random() * 40) + 60; // 60-99 rating
        const stars = Math.ceil(rating / 20);
        
        gameState.availableRecruits.push({
            id: i,
            name: `${firstName} ${lastName}`,
            position: position,
            rating: rating,
            stars: stars,
            recruited: false
        });
    }
}

function showRecruitment() {
    const modal = document.getElementById('recruitment-modal');
    const recruitList = document.getElementById('recruit-list');
    
    recruitList.innerHTML = '';
    
    gameState.availableRecruits.forEach(recruit => {
        if (recruit.recruited) return;
        
        const recruitItem = document.createElement('div');
        recruitItem.className = 'recruit-item';
        
        recruitItem.innerHTML = `
            <div class="recruit-info">
                <h4>${recruit.name}</h4>
                <p>${recruit.position} • ${recruit.rating} OVR • ${'⭐'.repeat(recruit.stars)}</p>
            </div>
            <button class="recruit-btn" onclick="recruitPlayer(${recruit.id})">
                Recruit
            </button>
        `;
        
        recruitList.appendChild(recruitItem);
    });
    
    modal.classList.add('show');
}

function recruitPlayer(recruitId) {
    const recruit = gameState.availableRecruits.find(r => r.id === recruitId);
    if (!recruit || recruit.recruited) return;
    
    // Success chance based on prestige and recruit rating
    const successChance = (gameState.prestige * 20 + (100 - recruit.rating)) / 100;
    const success = Math.random() < successChance;
    
    if (success) {
        recruit.recruited = true;
        
        // Improve team stats based on recruit quality
        const improvement = Math.floor(recruit.rating / 25);
        gameState.teamStats.offense = Math.min(99, gameState.teamStats.offense + improvement);
        gameState.teamStats.defense = Math.min(99, gameState.teamStats.defense + improvement);
        
        updateOverallRating();
        
        addNewsItem(`🎉 Successfully recruited ${recruit.name} (${recruit.position})! Team improved!`);
        
        // Refresh the recruitment modal
        showRecruitment();
    } else {
        addNewsItem(`😞 Failed to recruit ${recruit.name}. Better luck next time.`);
    }
    
    updateDashboard();
}

function closeRecruitmentModal() {
    document.getElementById('recruitment-modal').classList.remove('show');
}

// Practice System
function showPractice() {
    if (gameState.practiceUsed) {
        alert('You have already practiced this week. Wait until next week!');
        return;
    }
    
    document.getElementById('practice-modal').classList.add('show');
}

function focusPractice(type) {
    if (gameState.practiceUsed) return;
    
    gameState.practiceUsed = true;
    let improvement = Math.floor(Math.random() * 3) + 1; // 1-3 point improvement
    
    switch (type) {
        case 'offense':
            gameState.teamStats.offense = Math.min(99, gameState.teamStats.offense + improvement);
            addNewsItem(`🏃 Offensive practice complete! Offense improved by ${improvement} points.`);
            break;
        case 'defense':
            gameState.teamStats.defense = Math.min(99, gameState.teamStats.defense + improvement);
            addNewsItem(`🛡️ Defensive practice complete! Defense improved by ${improvement} points.`);
            break;
        case 'special':
            gameState.teamStats.specialTeams = Math.min(99, gameState.teamStats.specialTeams + improvement);
            addNewsItem(`🥅 Special teams practice complete! Special teams improved by ${improvement} points.`);
            break;
        case 'conditioning':
            // Conditioning improves all areas slightly
            gameState.teamStats.offense = Math.min(99, gameState.teamStats.offense + 1);
            gameState.teamStats.defense = Math.min(99, gameState.teamStats.defense + 1);
            gameState.teamStats.specialTeams = Math.min(99, gameState.teamStats.specialTeams + 1);
            addNewsItem(`💪 Conditioning complete! All areas improved slightly.`);
            break;
    }
    
    updateOverallRating();
    updateDashboard();
    closePracticeModal();
}

function closePracticeModal() {
    document.getElementById('practice-modal').classList.remove('show');
}

// Utility Functions
function updateOverallRating() {
    gameState.teamStats.overall = Math.round(
        (gameState.teamStats.offense + gameState.teamStats.defense + gameState.teamStats.specialTeams) / 3
    );
}

function addNewsItem(message) {
    const timestamp = `Week ${gameState.week}`;
    gameState.newsItems.push({
        message: message,
        timestamp: timestamp,
        week: gameState.week
    });
}

function generateRandomEvent() {
    const events = [
        'A key player suffered a minor injury during practice. Team morale slightly affected.',
        'Great recruiting visit! A top prospect is very interested in your program.',
        'Your team was featured in a national magazine. Prestige boost!',
        'Academic achievement! Several players made the Dean\'s List.',
        'Facilities upgrade approved! Training effectiveness improved.',
        'Alumni donation received! Program resources enhanced.',
        'Weather delays practice. Lost some preparation time.',
        'Team bonding event successful! Chemistry improved.',
        'Local media coverage increased. Regional reputation growing.',
        'Coaching clinic attended. New strategies learned!'
    ];
    
    const event = events[Math.floor(Math.random() * events.length)];
    addNewsItem(`📰 ${event}`);
    
    // Some events have mechanical effects
    if (event.includes('Prestige boost')) {
        gameState.prestige = Math.min(5, gameState.prestige + 1);
    } else if (event.includes('Training effectiveness')) {
        // Next practice will be more effective
        gameState.nextPracticeBonus = true;
    }
}

// Modal Management
function closeRulesModal() {
    document.getElementById('rules-modal').classList.remove('show');
}

// Close modals when clicking outside
document.addEventListener('click', function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.classList.remove('show');
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        // Close any open modal
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('show');
        });
    }
});