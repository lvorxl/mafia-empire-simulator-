// API Helper Functions
class GameAPI {
    static async request(endpoint, options = {}) {
        try {
            const response = await fetch(endpoint, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Request failed');
            }
            
            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    static async getSchools() {
        return this.request('/api/schools');
    }

    static async createNewGame(coachData) {
        return this.request('/api/game/new', {
            method: 'POST',
            body: JSON.stringify(coachData)
        });
    }

    static async getGameState() {
        return this.request('/api/game/state');
    }

    static async simulateGame() {
        return this.request('/api/game/simulate', {
            method: 'POST'
        });
    }

    static async recruitPlayer(recruitId) {
        return this.request('/api/game/recruit', {
            method: 'POST',
            body: JSON.stringify({ recruitId })
        });
    }

    static async practice(type) {
        return this.request('/api/game/practice', {
            method: 'POST',
            body: JSON.stringify({ type })
        });
    }

    static async advanceWeek() {
        return this.request('/api/game/advance-week', {
            method: 'POST'
        });
    }

    static async saveGame(saveName) {
        return this.request('/api/game/save', {
            method: 'POST',
            body: JSON.stringify({ saveName })
        });
    }

    static async loadGame(saveName) {
        return this.request('/api/game/load', {
            method: 'POST',
            body: JSON.stringify({ saveName })
        });
    }

    static async getLeaderboard() {
        return this.request('/api/leaderboard');
    }
}

// Game State Management
let gameState = null;
let schools = [];

// Initialize the game
document.addEventListener('DOMContentLoaded', function() {
    initializeGame();
});

// Game Initialization
async function initializeGame() {
    showLoadingScreen();
    
    try {
        // Load schools data
        schools = await GameAPI.getSchools();
        
        // Try to load existing game state
        try {
            gameState = await GameAPI.getGameState();
            if (gameState) {
                // Resume existing game
                showScreen('game-dashboard');
                showDashboardScreen('overview');
                updateUI();
                return;
            }
        } catch (error) {
            // No existing game, continue to main menu
        }
        
        // Show main menu after loading
        setTimeout(() => {
            showScreen('main-menu');
        }, 2000);
        
    } catch (error) {
        console.error('Failed to initialize game:', error);
        alert('Failed to load game data. Please refresh the page.');
    }
}

function showLoadingScreen() {
    showScreen('loading-screen');
    
    // Animate loading progress
    const progressBar = document.querySelector('.loading-progress');
    const loadingText = document.querySelector('.loading-text');
    
    const loadingSteps = [
        'Loading team data...',
        'Connecting to server...',
        'Setting up database...',
        'Preparing season...',
        'Ready to play!'
    ];
    
    let step = 0;
    const interval = setInterval(() => {
        if (step < loadingSteps.length) {
            loadingText.textContent = loadingSteps[step];
            progressBar.style.width = `${((step + 1) / loadingSteps.length) * 100}%`;
            step++;
        } else {
            clearInterval(interval);
        }
    }, 400);
}

// Screen Management
function showScreen(screenId) {
    // Hide all screens
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Show target screen
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.add('active');
    }
}

// Main Menu Functions
function startNewCareer() {
    showScreen('coach-creation');
}

function showLoadGame() {
    alert('Load game functionality available in-game after creating a career!');
}

function showSettings() {
    alert('Settings coming soon!');
}

function showCredits() {
    alert('College Football Dynasty Manager\n\nA comprehensive football management simulation\n\nFeatures:\n• Deep team management\n• Realistic recruiting\n• Detailed game simulation\n• Dynasty building\n• Online leaderboards\n\nBuilt with Node.js and modern web technologies!');
}

// Coach Creation
function showCoachCreation() {
    showScreen('coach-creation');
}

async function showSchoolSelection() {
    const coachName = document.getElementById('coach-name').value.trim();
    const coachingStyle = document.getElementById('coaching-style').value;
    const difficulty = document.getElementById('difficulty').value;
    
    if (!coachName) {
        alert('Please enter your coach name!');
        return;
    }
    
    // Store coach data temporarily
    window.tempCoachData = {
        coachName,
        coachingStyle,
        difficulty
    };
    
    showScreen('school-selection');
    await populateSchoolGrid();
}

async function populateSchoolGrid() {
    const schoolsGrid = document.getElementById('schools-grid');
    schoolsGrid.innerHTML = '';
    
    let filteredSchools = [...schools];
    
    // Apply filters
    const conferenceFilter = document.getElementById('conference-filter').value;
    const prestigeFilter = document.getElementById('prestige-filter').value;
    
    if (conferenceFilter !== 'all') {
        filteredSchools = filteredSchools.filter(school => school.conference === conferenceFilter);
    }
    
    if (prestigeFilter !== 'all') {
        const prestigeMap = {
            'elite': [5],
            'good': [4],
            'average': [3],
            'rebuilding': [1, 2]
        };
        filteredSchools = filteredSchools.filter(school => prestigeMap[prestigeFilter].includes(school.prestige));
    }
    
    filteredSchools.forEach(school => {
        const schoolCard = document.createElement('div');
        schoolCard.className = 'school-card';
        schoolCard.onclick = () => selectSchool(school);
        
        const prestigeStars = '★'.repeat(school.prestige) + '☆'.repeat(5 - school.prestige);
        
        schoolCard.innerHTML = `
            <div class="school-header">
                <div class="school-logo" style="background: linear-gradient(45deg, ${school.colors[0]}, ${school.colors[1]}); color: white;">
                    ${school.abbreviation}
                </div>
                <div class="school-info">
                    <h3>${school.name}</h3>
                    <p class="nickname">${school.nickname}</p>
                    <p class="conference">${school.conference}${school.division ? ` ${school.division}` : ''}</p>
                </div>
            </div>
            <div class="school-details">
                <p class="location"><i class="fas fa-map-marker-alt"></i> ${school.location}</p>
                <p class="stadium"><i class="fas fa-building"></i> ${school.stadium}</p>
                <p class="capacity"><i class="fas fa-users"></i> ${school.capacity.toLocaleString()} capacity</p>
                <p class="prestige"><i class="fas fa-star"></i> Prestige: ${prestigeStars}</p>
                <p class="description">${school.description}</p>
            </div>
        `;
        
        schoolsGrid.appendChild(schoolCard);
    });
}

async function selectSchool(school) {
    // Remove previous selection
    document.querySelectorAll('.school-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    // Select new school
    event.target.closest('.school-card').classList.add('selected');
    
    // Show loading
    const selectedCard = event.target.closest('.school-card');
    selectedCard.innerHTML += '<div style="margin-top: 1rem; color: #28a745; font-weight: bold;"><i class="fas fa-spinner fa-spin"></i> Creating your dynasty...</div>';
    
    try {
        // Create new game
        const response = await GameAPI.createNewGame({
            coachName: window.tempCoachData.coachName,
            coachingStyle: window.tempCoachData.coachingStyle,
            difficulty: window.tempCoachData.difficulty,
            schoolId: school.id
        });
        
        gameState = response.gameState;
        
        // Start the game
        setTimeout(() => {
            showScreen('game-dashboard');
            showDashboardScreen('overview');
            updateUI();
        }, 1500);
        
    } catch (error) {
        console.error('Failed to create game:', error);
        alert('Failed to create game. Please try again.');
        selectedCard.innerHTML = selectedCard.innerHTML.replace(/<div style="margin-top: 1rem.*?<\/div>/, '');
    }
}

// Dashboard Management
function showDashboardScreen(screenName) {
    // Hide all dashboard screens
    document.querySelectorAll('.dashboard-screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Show target screen
    document.getElementById(`${screenName}-screen`).classList.add('active');
    
    // Update sidebar
    document.querySelectorAll('.sidebar-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    const targetBtn = document.querySelector(`[data-screen="${screenName}"]`);
    if (targetBtn) {
        targetBtn.classList.add('active');
    }
    
    // Update screen content
    updateScreenContent(screenName);
}

function updateScreenContent(screenName) {
    switch (screenName) {
        case 'overview':
            updateOverviewScreen();
            break;
        case 'team':
            updateTeamScreen();
            break;
        case 'recruiting':
            updateRecruitingScreen();
            break;
        case 'schedule':
            updateScheduleScreen();
            break;
    }
}

// UI Updates
function updateUI() {
    if (!gameState) return;
    
    updateNavigation();
    updateOverviewScreen();
}

function updateNavigation() {
    if (!gameState) return;
    
    // Update school info
    document.getElementById('nav-school-logo').textContent = gameState.school.abbreviation;
    document.getElementById('nav-school-logo').style.background = 
        `linear-gradient(45deg, ${gameState.school.colors[0]}, ${gameState.school.colors[1]})`;
    document.getElementById('nav-school-name').textContent = gameState.school.nickname;
    document.getElementById('nav-record').textContent = 
        `${gameState.record.wins}-${gameState.record.losses} (${gameState.record.confWins}-${gameState.record.confLosses})`;
    
    // Update season info
    document.getElementById('current-season').textContent = `${gameState.season} Season`;
    document.getElementById('current-week').textContent = `Week ${gameState.week} • ${gameState.phase}`;
    
    // Update coach info
    document.getElementById('nav-coach-name').textContent = `Coach ${gameState.coach.name}`;
    document.getElementById('nav-prestige').textContent = 
        '★'.repeat(gameState.school.prestige) + '☆'.repeat(5 - gameState.school.prestige);
}

function updateOverviewScreen() {
    if (!gameState) return;
    
    // Update team status
    document.getElementById('overall-rating').textContent = gameState.team.overall;
    document.getElementById('team-chemistry').textContent = gameState.team.chemistry;
    document.getElementById('team-discipline').textContent = gameState.team.discipline;
    document.getElementById('team-morale').textContent = gameState.team.morale;
    
    // Update next game
    updateNextGame();
    
    // Update top recruits
    updateTopRecruits();
    
    // Update news feed
    updateNewsFeed();
}

function updateNextGame() {
    if (!gameState) return;
    
    const nextGame = gameState.schedule.find(game => !game.played);
    if (!nextGame) {
        document.getElementById('next-game-info').innerHTML = '<p>Season Complete!</p>';
        return;
    }
    
    const homeTeam = nextGame.isHome ? gameState.school : nextGame.opponent;
    const awayTeam = nextGame.isHome ? nextGame.opponent : gameState.school;
    
    document.getElementById('next-home-logo').textContent = homeTeam.abbreviation;
    document.getElementById('next-home-logo').style.background = 
        `linear-gradient(45deg, ${homeTeam.colors[0]}, ${homeTeam.colors[1]})`;
    document.getElementById('next-home-name').textContent = homeTeam.nickname;
    
    document.getElementById('next-away-logo').textContent = awayTeam.abbreviation;
    document.getElementById('next-away-logo').style.background = 
        `linear-gradient(45deg, ${awayTeam.colors[0]}, ${awayTeam.colors[1]})`;
    document.getElementById('next-away-name').textContent = awayTeam.nickname;
    
    document.getElementById('next-game-date').textContent = `Week ${nextGame.week} • Saturday`;
    document.getElementById('next-game-time').textContent = `${Math.floor(Math.random() * 4) + 12}:${Math.random() > 0.5 ? '00' : '30'} PM ET`;
}

function updateTopRecruits() {
    if (!gameState) return;
    
    const topRecruits = gameState.recruits
        .filter(recruit => !recruit.recruited)
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 5);
    
    const recruitsList = document.getElementById('top-recruits-list');
    recruitsList.innerHTML = '';
    
    topRecruits.forEach(recruit => {
        const recruitItem = document.createElement('div');
        recruitItem.className = 'recruit-item-small';
        recruitItem.innerHTML = `
            <div class="recruit-info">
                <strong>${recruit.fullName}</strong>
                <span class="position">${recruit.position}</span>
                <span class="stars">${'⭐'.repeat(recruit.stars)}</span>
            </div>
            <div class="interest-level ${getInterestClass(recruit.interest)}">
                ${getInterestText(recruit.interest)}
            </div>
        `;
        recruitsList.appendChild(recruitItem);
    });
}

function getInterestClass(interest) {
    if (interest >= 70) return 'high';
    if (interest >= 40) return 'medium';
    return 'low';
}

function getInterestText(interest) {
    if (interest >= 70) return 'High Interest';
    if (interest >= 40) return 'Medium Interest';
    return 'Low Interest';
}

function updateNewsFeed() {
    if (!gameState) return;
    
    const newsFeed = document.getElementById('news-feed');
    newsFeed.innerHTML = '';
    
    const recentNews = gameState.news.slice(-5).reverse();
    
    recentNews.forEach(newsItem => {
        const newsElement = document.createElement('div');
        newsElement.className = 'news-item';
        newsElement.innerHTML = `
            <p>${newsItem.message}</p>
            <small>Week ${newsItem.week}</small>
        `;
        newsFeed.appendChild(newsElement);
    });
}

// Game Simulation
async function simulateGame() {
    if (!gameState) return;
    
    const nextGame = gameState.schedule.find(game => !game.played);
    if (!nextGame) return;
    
    try {
        // Show simulation modal
        showGameSimulation(nextGame);
        
        // Simulate game on server
        const response = await GameAPI.simulateGame();
        gameState = response.gameState;
        
        // Show result
        setTimeout(() => {
            showGameResult(nextGame, response.result);
        }, 2000);
        
    } catch (error) {
        console.error('Failed to simulate game:', error);
        alert('Failed to simulate game. Please try again.');
    }
}

function showGameSimulation(game) {
    const modal = document.getElementById('game-simulation-modal');
    
    // Set up simulation UI
    const homeTeam = game.isHome ? gameState.school : game.opponent;
    const awayTeam = game.isHome ? game.opponent : gameState.school;
    
    document.getElementById('sim-matchup').textContent = 
        `${awayTeam.nickname} @ ${homeTeam.nickname}`;
    document.getElementById('sim-game-info').textContent = 
        `Week ${game.week} • Saturday 3:30 PM ET`;
    
    // Set team info
    document.getElementById('sim-home-logo').textContent = homeTeam.abbreviation;
    document.getElementById('sim-home-logo').style.background = 
        `linear-gradient(45deg, ${homeTeam.colors[0]}, ${homeTeam.colors[1]})`;
    document.getElementById('sim-home-name').textContent = homeTeam.nickname;
    
    document.getElementById('sim-away-logo').textContent = awayTeam.abbreviation;
    document.getElementById('sim-away-logo').style.background = 
        `linear-gradient(45deg, ${awayTeam.colors[0]}, ${awayTeam.colors[1]})`;
    document.getElementById('sim-away-name').textContent = awayTeam.nickname;
    
    // Reset scores and progress
    document.getElementById('sim-home-score').textContent = '0';
    document.getElementById('sim-away-score').textContent = '0';
    document.getElementById('sim-progress').style.width = '0%';
    document.getElementById('sim-status').textContent = 'Simulating game...';
    document.getElementById('play-by-play').innerHTML = '';
    
    // Animate progress
    let progress = 0;
    const progressInterval = setInterval(() => {
        progress += Math.random() * 10;
        if (progress >= 100) {
            progress = 100;
            clearInterval(progressInterval);
        }
        document.getElementById('sim-progress').style.width = `${progress}%`;
    }, 200);
    
    modal.classList.add('show');
}

function showGameResult(game, result) {
    // Update scores
    if (game.isHome) {
        document.getElementById('sim-home-score').textContent = result.playerScore;
        document.getElementById('sim-away-score').textContent = result.opponentScore;
    } else {
        document.getElementById('sim-home-score').textContent = result.opponentScore;
        document.getElementById('sim-away-score').textContent = result.playerScore;
    }
    
    // Update status
    document.getElementById('sim-status').textContent = result.won ? 'Victory!' : 'Defeat';
    document.getElementById('sim-progress').style.width = '100%';
    
    // Show continue button
    document.getElementById('continue-btn').style.display = 'block';
    document.getElementById('skip-sim-btn').style.display = 'none';
}

function skipSimulation() {
    // This functionality is handled by the server now
    simulateGame();
}

async function continueFromGame() {
    document.getElementById('game-simulation-modal').classList.remove('show');
    
    try {
        // Advance week
        const response = await GameAPI.advanceWeek();
        gameState = response.gameState;
        
        if (response.seasonEnded) {
            alert('Season complete! Check the news for your final results.');
        }
        
        updateUI();
        
    } catch (error) {
        console.error('Failed to advance week:', error);
        alert('Failed to advance week. Please try again.');
    }
}

// Recruiting Functions
function updateRecruitingScreen() {
    if (!gameState) return;
    
    updateRecruitingStats();
    displayRecruits();
}

function updateRecruitingStats() {
    if (!gameState) return;
    
    document.getElementById('recruiting-points').textContent = gameState.resources.recruitingPoints;
    document.getElementById('scholarships-available').textContent = gameState.resources.scholarships;
    document.getElementById('current-commits').textContent = 
        gameState.recruits.filter(r => r.recruited).length;
}

function displayRecruits() {
    const recruitsGrid = document.getElementById('recruits-grid');
    if (!recruitsGrid || !gameState) return;
    
    recruitsGrid.innerHTML = '';
    
    // Filter recruits
    let filteredRecruits = gameState.recruits.filter(recruit => !recruit.recruited);
    
    // Apply filters
    const positionFilter = document.getElementById('recruit-position-filter')?.value;
    const starFilter = document.getElementById('recruit-star-filter')?.value;
    const interestFilter = document.getElementById('recruit-interest-filter')?.value;
    
    if (positionFilter && positionFilter !== 'all') {
        filteredRecruits = filteredRecruits.filter(r => r.position === positionFilter);
    }
    
    if (starFilter && starFilter !== 'all') {
        filteredRecruits = filteredRecruits.filter(r => r.stars === parseInt(starFilter));
    }
    
    if (interestFilter && interestFilter !== 'all') {
        filteredRecruits = filteredRecruits.filter(r => {
            const interest = r.interest;
            switch (interestFilter) {
                case 'high': return interest >= 70;
                case 'medium': return interest >= 40 && interest < 70;
                case 'low': return interest < 40;
                default: return true;
            }
        });
    }
    
    // Display recruits
    filteredRecruits.slice(0, 20).forEach(recruit => {
        const recruitCard = document.createElement('div');
        recruitCard.className = 'recruit-card';
        recruitCard.innerHTML = `
            <div class="recruit-header">
                <h4>${recruit.fullName}</h4>
                <div class="recruit-rating">
                    <span class="stars">${'⭐'.repeat(recruit.stars)}</span>
                    <span class="overall">${recruit.rating}</span>
                </div>
            </div>
            <div class="recruit-details">
                <p class="position">${recruit.position}</p>
                <p class="interest ${getInterestClass(recruit.interest)}">
                    Interest: ${recruit.interest}%
                </p>
            </div>
            <button class="recruit-btn" onclick="recruitPlayer('${recruit.id}')">
                Recruit (${Math.floor(recruit.rating / 10)} pts)
            </button>
        `;
        recruitsGrid.appendChild(recruitCard);
    });
}

async function recruitPlayer(recruitId) {
    if (!gameState) return;
    
    try {
        const response = await GameAPI.recruitPlayer(recruitId);
        gameState = response.gameState;
        
        if (response.success) {
            alert('Recruitment successful!');
        } else {
            alert('Recruitment failed. Better luck next time.');
        }
        
        updateRecruitingScreen();
        updateUI();
        
    } catch (error) {
        console.error('Failed to recruit player:', error);
        alert(error.message || 'Failed to recruit player.');
    }
}

// Training Functions
async function startTraining(type) {
    if (!gameState) return;
    
    try {
        const response = await GameAPI.practice(type);
        gameState = response.gameState;
        
        alert('Practice complete! Check the news for results.');
        updateUI();
        
        // Update practice points display
        const practicePointsElement = document.getElementById('practice-points');
        if (practicePointsElement) {
            practicePointsElement.textContent = gameState.resources.practicePoints;
        }
        
    } catch (error) {
        console.error('Failed to practice:', error);
        alert(error.message || 'Failed to complete practice.');
    }
}

// Team Management Functions
function updateTeamScreen() {
    // Implementation for team screen updates
}

function showTeamTab(tabName) {
    // Hide all team tabs
    document.querySelectorAll('.team-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Show target tab
    document.getElementById(`${tabName}-tab`).classList.add('active');
    
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
}

// Schedule Functions
function updateScheduleScreen() {
    const scheduleContainer = document.getElementById('schedule-container');
    if (!scheduleContainer || !gameState) return;
    
    scheduleContainer.innerHTML = '';
    
    gameState.schedule.forEach(game => {
        const gameItem = document.createElement('div');
        gameItem.className = `schedule-game ${game.played ? 'completed' : 'upcoming'}`;
        
        const opponent = game.opponent;
        const location = game.isHome ? 'vs' : '@';
        const result = game.played ? 
            `${game.result.won ? 'W' : 'L'} ${game.result.playerScore}-${game.result.opponentScore}` : 
            'TBD';
        
        gameItem.innerHTML = `
            <div class="game-week">Week ${game.week}</div>
            <div class="game-matchup">
                <div class="opponent-logo" style="background: linear-gradient(45deg, ${opponent.colors[0]}, ${opponent.colors[1]})">
                    ${opponent.abbreviation}
                </div>
                <div class="game-details">
                    <h4>${location} ${opponent.nickname}</h4>
                    <p class="conference">${opponent.conference}</p>
                </div>
            </div>
            <div class="game-result ${game.played ? (game.result.won ? 'win' : 'loss') : 'pending'}">
                ${result}
            </div>
        `;
        
        scheduleContainer.appendChild(gameItem);
    });
}

// Save/Load Functions
async function saveGame() {
    if (!gameState) return;
    
    const saveName = prompt('Enter a name for your save:');
    if (!saveName) return;
    
    try {
        await GameAPI.saveGame(saveName);
        alert('Game saved successfully!');
    } catch (error) {
        console.error('Failed to save game:', error);
        alert('Failed to save game.');
    }
}

async function loadGame() {
    const saveName = prompt('Enter the name of your save:');
    if (!saveName) return;
    
    try {
        const response = await GameAPI.loadGame(saveName);
        gameState = response.gameState;
        
        showScreen('game-dashboard');
        showDashboardScreen('overview');
        updateUI();
        
        alert('Game loaded successfully!');
    } catch (error) {
        console.error('Failed to load game:', error);
        alert('Failed to load game. Save not found.');
    }
}

// Event Listeners
document.addEventListener('change', function(e) {
    if (e.target.id === 'conference-filter' || e.target.id === 'prestige-filter') {
        populateSchoolGrid();
    }
    
    if (e.target.classList.contains('recruit-filter')) {
        displayRecruits();
    }
});

// Initialize filter event listeners when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Add event listeners for recruiting filters
    const recruitFilters = ['recruit-position-filter', 'recruit-star-filter', 'recruit-interest-filter'];
    recruitFilters.forEach(filterId => {
        const filter = document.getElementById(filterId);
        if (filter) {
            filter.addEventListener('change', displayRecruits);
        }
    });
});

// Add keyboard shortcuts
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        // Close any open modal
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('show');
        });
    }
    
    // Quick save with Ctrl+S
    if (event.ctrlKey && event.key === 's') {
        event.preventDefault();
        saveGame();
    }
});

// Add save/load buttons to the UI
document.addEventListener('DOMContentLoaded', function() {
    // Add save/load buttons to the navigation
    const navRight = document.querySelector('.nav-right');
    if (navRight) {
        const saveLoadButtons = document.createElement('div');
        saveLoadButtons.innerHTML = `
            <button class="btn secondary" onclick="saveGame()" style="margin-right: 0.5rem;">
                <i class="fas fa-save"></i> Save
            </button>
            <button class="btn secondary" onclick="loadGame()">
                <i class="fas fa-folder-open"></i> Load
            </button>
        `;
        navRight.appendChild(saveLoadButtons);
    }
});