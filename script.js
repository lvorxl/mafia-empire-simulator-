// Game State Management
class GameState {
    constructor() {
        this.currentScreen = 'loading-screen';
        this.coach = null;
        this.school = null;
        this.season = 2024;
        this.week = 1;
        this.gameWeek = 1;
        this.phase = 'preseason'; // preseason, regular, postseason, offseason
        
        this.team = {
            overall: 75,
            offense: 75,
            defense: 72,
            specialTeams: 70,
            chemistry: 68,
            discipline: 82,
            morale: 75
        };
        
        this.record = {
            wins: 0,
            losses: 0,
            confWins: 0,
            confLosses: 0
        };
        
        this.resources = {
            practicePoints: 3,
            recruitingPoints: 100,
            scholarships: 25
        };
        
        this.roster = [];
        this.recruits = [];
        this.schedule = [];
        this.news = [];
        this.facilities = {};
        this.coachingStaff = {};
        
        this.gameInProgress = false;
    }
}

// School Data
const SCHOOLS = [
    {
        id: 'alabama',
        name: 'University of Alabama',
        nickname: 'Crimson Tide',
        abbreviation: 'ALA',
        conference: 'SEC',
        division: 'West',
        prestige: 5,
        colors: ['#A6192E', '#FFFFFF'],
        location: 'Tuscaloosa, AL',
        stadium: 'Bryant-Denny Stadium',
        capacity: 101821,
        description: 'Elite program with championship tradition'
    },
    {
        id: 'georgia',
        name: 'University of Georgia',
        nickname: 'Bulldogs',
        abbreviation: 'UGA',
        conference: 'SEC',
        division: 'East',
        prestige: 5,
        colors: ['#BA0C2F', '#000000'],
        location: 'Athens, GA',
        stadium: 'Sanford Stadium',
        capacity: 92746,
        description: 'Elite program with passionate fanbase'
    },
    {
        id: 'michigan',
        name: 'University of Michigan',
        nickname: 'Wolverines',
        abbreviation: 'MICH',
        conference: 'Big Ten',
        division: 'East',
        prestige: 4,
        colors: ['#00274C', '#FFCB05'],
        location: 'Ann Arbor, MI',
        stadium: 'Michigan Stadium',
        capacity: 107601,
        description: 'Historic program with massive stadium'
    },
    {
        id: 'ohio-state',
        name: 'Ohio State University',
        nickname: 'Buckeyes',
        abbreviation: 'OSU',
        conference: 'Big Ten',
        division: 'East',
        prestige: 5,
        colors: ['#BB0000', '#FFFFFF'],
        location: 'Columbus, OH',
        stadium: 'Ohio Stadium',
        capacity: 104944,
        description: 'Elite program with national reach'
    },
    {
        id: 'texas',
        name: 'University of Texas',
        nickname: 'Longhorns',
        abbreviation: 'TEX',
        conference: 'Big 12',
        division: 'South',
        prestige: 4,
        colors: ['#BF5700', '#FFFFFF'],
        location: 'Austin, TX',
        stadium: 'Darrell K Royal Stadium',
        capacity: 100119,
        description: 'Prestigious program in football-crazy Texas'
    },
    {
        id: 'oklahoma',
        name: 'University of Oklahoma',
        nickname: 'Sooners',
        abbreviation: 'OU',
        conference: 'Big 12',
        division: 'South',
        prestige: 4,
        colors: ['#841617', '#FDD116'],
        location: 'Norman, OK',
        stadium: 'Gaylord Family Stadium',
        capacity: 80126,
        description: 'Traditional powerhouse with rich history'
    },
    {
        id: 'clemson',
        name: 'Clemson University',
        nickname: 'Tigers',
        abbreviation: 'CLEM',
        conference: 'ACC',
        division: 'Atlantic',
        prestige: 4,
        colors: ['#F56600', '#522D80'],
        location: 'Clemson, SC',
        stadium: 'Memorial Stadium',
        capacity: 81500,
        description: 'Recent championship success'
    },
    {
        id: 'notre-dame',
        name: 'University of Notre Dame',
        nickname: 'Fighting Irish',
        abbreviation: 'ND',
        conference: 'Independent',
        division: null,
        prestige: 4,
        colors: ['#0C2340', '#C99700'],
        location: 'South Bend, IN',
        stadium: 'Notre Dame Stadium',
        capacity: 77622,
        description: 'Independent with national following'
    },
    {
        id: 'usc',
        name: 'University of Southern California',
        nickname: 'Trojans',
        abbreviation: 'USC',
        conference: 'Pac-12',
        division: 'South',
        prestige: 3,
        colors: ['#990000', '#FFCC00'],
        location: 'Los Angeles, CA',
        stadium: 'Los Angeles Memorial Coliseum',
        capacity: 77500,
        description: 'Rebuilding West Coast power'
    },
    {
        id: 'oregon',
        name: 'University of Oregon',
        nickname: 'Ducks',
        abbreviation: 'ORE',
        conference: 'Pac-12',
        division: 'North',
        prestige: 3,
        colors: ['#154733', '#FEE123'],
        location: 'Eugene, OR',
        stadium: 'Autzen Stadium',
        capacity: 54000,
        description: 'Modern facilities and innovative offense'
    },
    {
        id: 'florida',
        name: 'University of Florida',
        nickname: 'Gators',
        abbreviation: 'FLA',
        conference: 'SEC',
        division: 'East',
        prestige: 4,
        colors: ['#0021A5', '#FA4616'],
        location: 'Gainesville, FL',
        stadium: 'Ben Hill Griffin Stadium',
        capacity: 88548,
        description: 'SEC East contender with strong tradition'
    },
    {
        id: 'lsu',
        name: 'Louisiana State University',
        nickname: 'Tigers',
        abbreviation: 'LSU',
        conference: 'SEC',
        division: 'West',
        prestige: 4,
        colors: ['#461D7C', '#FDD023'],
        location: 'Baton Rouge, LA',
        stadium: 'Tiger Stadium',
        capacity: 102321,
        description: 'Death Valley atmosphere and championship pedigree'
    }
];

// Position Data
const POSITIONS = {
    'QB': { name: 'Quarterback', group: 'offense', importance: 10 },
    'RB': { name: 'Running Back', group: 'offense', importance: 7 },
    'WR': { name: 'Wide Receiver', group: 'offense', importance: 8 },
    'TE': { name: 'Tight End', group: 'offense', importance: 6 },
    'OL': { name: 'Offensive Line', group: 'offense', importance: 8 },
    'DL': { name: 'Defensive Line', group: 'defense', importance: 8 },
    'LB': { name: 'Linebacker', group: 'defense', importance: 7 },
    'DB': { name: 'Defensive Back', group: 'defense', importance: 8 },
    'K': { name: 'Kicker', group: 'special', importance: 4 }
};

// Global game state
let gameState = new GameState();

// Initialize the game
document.addEventListener('DOMContentLoaded', function() {
    initializeGame();
});

// Game Initialization
function initializeGame() {
    showLoadingScreen();
    
    // Simulate loading time
    setTimeout(() => {
        showScreen('main-menu');
    }, 3000);
}

function showLoadingScreen() {
    showScreen('loading-screen');
    
    // Animate loading progress
    const progressBar = document.querySelector('.loading-progress');
    const loadingText = document.querySelector('.loading-text');
    
    const loadingSteps = [
        'Loading team data...',
        'Generating recruits...',
        'Setting up facilities...',
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
    }, 600);
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
        gameState.currentScreen = screenId;
    }
}

// Main Menu Functions
function startNewCareer() {
    showScreen('coach-creation');
}

function showLoadGame() {
    // Placeholder for load game functionality
    alert('Load game functionality coming soon!');
}

function showSettings() {
    // Placeholder for settings
    alert('Settings coming soon!');
}

function showCredits() {
    alert('College Football Dynasty Manager\n\nA comprehensive football management simulation\n\nFeatures:\n• Deep team management\n• Realistic recruiting\n• Detailed game simulation\n• Dynasty building\n\nBuilt with passion for college football!');
}

// Coach Creation
function showCoachCreation() {
    showScreen('coach-creation');
}

function showSchoolSelection() {
    const coachName = document.getElementById('coach-name').value.trim();
    const coachingStyle = document.getElementById('coaching-style').value;
    const difficulty = document.getElementById('difficulty').value;
    
    if (!coachName) {
        alert('Please enter your coach name!');
        return;
    }
    
    // Create coach object
    gameState.coach = {
        name: coachName,
        style: coachingStyle,
        difficulty: difficulty,
        experience: 0,
        reputation: 50
    };
    
    showScreen('school-selection');
    populateSchoolGrid();
}

function populateSchoolGrid() {
    const schoolsGrid = document.getElementById('schools-grid');
    schoolsGrid.innerHTML = '';
    
    let filteredSchools = [...SCHOOLS];
    
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

function selectSchool(school) {
    // Remove previous selection
    document.querySelectorAll('.school-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    // Select new school
    event.target.closest('.school-card').classList.add('selected');
    gameState.school = school;
    
    // Show loading and start game
    setTimeout(() => {
        startGame();
    }, 1000);
}

// Game Start
function startGame() {
    if (!gameState.coach || !gameState.school) return;
    
    // Initialize game data
    initializeTeam();
    generateSchedule();
    generateRecruits();
    initializeFacilities();
    initializeCoachingStaff();
    
    // Add initial news
    addNews(`Welcome to ${gameState.school.name}! Your journey as head coach begins now.`);
    addNews('Focus on recruiting, practice, and game preparation to build a championship program.');
    
    // Show dashboard
    showScreen('game-dashboard');
    showDashboardScreen('overview');
    updateUI();
}

// Team Initialization
function initializeTeam() {
    // Adjust team ratings based on school prestige
    const prestigeBonus = (gameState.school.prestige - 3) * 5;
    
    gameState.team = {
        overall: Math.max(60, Math.min(85, 75 + prestigeBonus + Math.floor(Math.random() * 10 - 5))),
        offense: Math.max(60, Math.min(85, 75 + prestigeBonus + Math.floor(Math.random() * 10 - 5))),
        defense: Math.max(60, Math.min(85, 72 + prestigeBonus + Math.floor(Math.random() * 10 - 5))),
        specialTeams: Math.max(60, Math.min(85, 70 + prestigeBonus + Math.floor(Math.random() * 10 - 5))),
        chemistry: Math.max(50, Math.min(90, 68 + Math.floor(Math.random() * 20 - 10))),
        discipline: Math.max(50, Math.min(95, 82 + Math.floor(Math.random() * 20 - 10))),
        morale: Math.max(50, Math.min(95, 75 + Math.floor(Math.random() * 20 - 10)))
    };
    
    // Calculate overall rating
    gameState.team.overall = Math.round(
        (gameState.team.offense + gameState.team.defense + gameState.team.specialTeams) / 3
    );
    
    // Generate roster
    generateRoster();
}

function generateRoster() {
    gameState.roster = [];
    
    const rosterNeeds = {
        'QB': 3, 'RB': 4, 'WR': 6, 'TE': 3, 'OL': 8,
        'DL': 6, 'LB': 6, 'DB': 8, 'K': 2
    };
    
    Object.entries(rosterNeeds).forEach(([position, count]) => {
        for (let i = 0; i < count; i++) {
            const player = generatePlayer(position, false);
            gameState.roster.push(player);
        }
    });
}

function generatePlayer(position, isRecruit = false) {
    const firstNames = ['James', 'Michael', 'Robert', 'John', 'David', 'William', 'Richard', 'Joseph', 'Thomas', 'Christopher', 'Daniel', 'Matthew', 'Anthony', 'Mark', 'Donald', 'Steven', 'Paul', 'Andrew', 'Joshua', 'Kenneth'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'];
    
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    
    // Rating based on position importance and team prestige
    const baseRating = isRecruit ? 
        Math.floor(Math.random() * 40) + 60 : // Recruits: 60-99
        Math.floor(Math.random() * 30) + 65 + (gameState.school?.prestige || 3) * 2; // Current players
    
    const rating = Math.max(60, Math.min(99, baseRating));
    const stars = Math.ceil(rating / 20);
    
    const player = {
        id: Math.random().toString(36).substr(2, 9),
        firstName,
        lastName,
        fullName: `${firstName} ${lastName}`,
        position,
        year: isRecruit ? 'FR' : ['FR', 'SO', 'JR', 'SR'][Math.floor(Math.random() * 4)],
        rating,
        stars,
        potential: Math.max(rating, rating + Math.floor(Math.random() * 15)),
        attributes: generatePlayerAttributes(position, rating),
        recruited: false,
        interest: isRecruit ? Math.floor(Math.random() * 100) : 100
    };
    
    return player;
}

function generatePlayerAttributes(position, rating) {
    // Generate position-specific attributes
    const attributes = {};
    const baseValue = Math.floor(rating * 0.8) + Math.floor(Math.random() * 20);
    
    switch (position) {
        case 'QB':
            attributes.accuracy = baseValue + Math.floor(Math.random() * 10);
            attributes.arm = baseValue + Math.floor(Math.random() * 10);
            attributes.mobility = baseValue - 10 + Math.floor(Math.random() * 15);
            break;
        case 'RB':
            attributes.speed = baseValue + Math.floor(Math.random() * 10);
            attributes.power = baseValue + Math.floor(Math.random() * 10);
            attributes.vision = baseValue + Math.floor(Math.random() * 10);
            break;
        case 'WR':
            attributes.speed = baseValue + Math.floor(Math.random() * 10);
            attributes.hands = baseValue + Math.floor(Math.random() * 10);
            attributes.route = baseValue + Math.floor(Math.random() * 10);
            break;
        default:
            attributes.strength = baseValue + Math.floor(Math.random() * 10);
            attributes.technique = baseValue + Math.floor(Math.random() * 10);
            attributes.awareness = baseValue + Math.floor(Math.random() * 10);
    }
    
    return attributes;
}

// Schedule Generation
function generateSchedule() {
    gameState.schedule = [];
    const opponents = SCHOOLS.filter(school => school.id !== gameState.school.id);
    
    // Generate 12 regular season games
    for (let week = 1; week <= 12; week++) {
        const opponent = opponents[Math.floor(Math.random() * opponents.length)];
        const isHome = Math.random() > 0.5;
        const isConference = opponent.conference === gameState.school.conference;
        
        gameState.schedule.push({
            week,
            opponent,
            isHome,
            isConference,
            played: false,
            result: null
        });
    }
}

// Recruit Generation
function generateRecruits() {
    gameState.recruits = [];
    
    // Generate 50 recruits
    for (let i = 0; i < 50; i++) {
        const positions = Object.keys(POSITIONS);
        const position = positions[Math.floor(Math.random() * positions.length)];
        const recruit = generatePlayer(position, true);
        
        // Set interest based on school prestige and coach style
        recruit.interest = Math.max(10, Math.min(90, 
            gameState.school.prestige * 15 + 
            Math.floor(Math.random() * 30) + 
            (gameState.coach.style === 'recruiting' ? 10 : 0)
        ));
        
        gameState.recruits.push(recruit);
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
    document.querySelector(`[data-screen="${screenName}"]`).classList.add('active');
    
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
        // Add other screens as needed
    }
}

// UI Updates
function updateUI() {
    updateNavigation();
    updateOverviewScreen();
}

function updateNavigation() {
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
    const nextGame = gameState.schedule.find(game => !game.played);
    if (!nextGame) return;
    
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
function simulateGame() {
    const nextGame = gameState.schedule.find(game => !game.played);
    if (!nextGame || gameState.gameInProgress) return;
    
    gameState.gameInProgress = true;
    showGameSimulation(nextGame);
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
    document.getElementById('sim-status').textContent = 'Preparing for kickoff...';
    document.getElementById('play-by-play').innerHTML = '';
    
    modal.classList.add('show');
    
    // Start simulation
    setTimeout(() => runGameSimulation(game), 1000);
}

function runGameSimulation(game) {
    const homeTeam = game.isHome ? gameState.school : game.opponent;
    const awayTeam = game.isHome ? game.opponent : gameState.school;
    
    // Calculate team strengths
    const playerStrength = gameState.team.overall;
    const opponentStrength = Math.floor(Math.random() * 30) + 60 + (game.opponent.prestige * 3);
    
    // Home field advantage
    const homeAdvantage = game.isHome ? 5 : 0;
    const adjustedPlayerStrength = playerStrength + homeAdvantage;
    
    // Simulate game progression
    let homeScore = 0;
    let awayScore = 0;
    let quarter = 1;
    let timeLeft = 15;
    let progress = 0;
    
    const playByPlay = document.getElementById('play-by-play');
    const progressBar = document.getElementById('sim-progress');
    const statusText = document.getElementById('sim-status');
    const quarterText = document.getElementById('sim-quarter');
    const timeText = document.getElementById('sim-time');
    
    const simulationInterval = setInterval(() => {
        // Update game clock
        timeLeft -= Math.random() * 3 + 1;
        if (timeLeft <= 0) {
            quarter++;
            timeLeft = 15;
            if (quarter > 4) {
                // Game over
                clearInterval(simulationInterval);
                finishGameSimulation(game, homeScore, awayScore);
                return;
            }
        }
        
        // Update UI
        progress = ((quarter - 1) * 15 + (15 - timeLeft)) / 60 * 100;
        progressBar.style.width = `${Math.min(100, progress)}%`;
        quarterText.textContent = `${quarter}${getOrdinalSuffix(quarter)}`;
        timeText.textContent = `${Math.floor(timeLeft)}:${String(Math.floor((timeLeft % 1) * 60)).padStart(2, '0')}`;
        
        // Random scoring events
        if (Math.random() < 0.15) {
            const scoringTeam = Math.random() < 0.5 ? 'home' : 'away';
            const points = Math.random() < 0.7 ? 7 : (Math.random() < 0.5 ? 3 : 6);
            
            if (scoringTeam === 'home') {
                homeScore += points;
                document.getElementById('sim-home-score').textContent = homeScore;
            } else {
                awayScore += points;
                document.getElementById('sim-away-score').textContent = awayScore;
            }
            
            // Add play-by-play
            const play = document.createElement('div');
            play.className = 'play';
            play.textContent = `${scoringTeam === 'home' ? homeTeam.nickname : awayTeam.nickname} ${points === 7 ? 'TOUCHDOWN' : points === 3 ? 'FIELD GOAL' : 'TOUCHDOWN (missed XP)'}!`;
            playByPlay.appendChild(play);
            playByPlay.scrollTop = playByPlay.scrollHeight;
        }
        
        statusText.textContent = `${quarter}${getOrdinalSuffix(quarter)} Quarter - ${Math.floor(timeLeft)}:${String(Math.floor((timeLeft % 1) * 60)).padStart(2, '0')}`;
        
    }, 500);
}

function getOrdinalSuffix(num) {
    const suffixes = ['st', 'nd', 'rd', 'th'];
    return suffixes[Math.min(num - 1, 3)];
}

function finishGameSimulation(game, homeScore, awayScore) {
    const playerScore = game.isHome ? homeScore : awayScore;
    const opponentScore = game.isHome ? awayScore : homeScore;
    const won = playerScore > opponentScore;
    
    // Update game result
    game.played = true;
    game.result = {
        playerScore,
        opponentScore,
        won
    };
    
    // Update record
    if (won) {
        gameState.record.wins++;
        if (game.isConference) gameState.record.confWins++;
    } else {
        gameState.record.losses++;
        if (game.isConference) gameState.record.confLosses++;
    }
    
    // Update team stats based on performance
    if (won) {
        gameState.team.morale = Math.min(100, gameState.team.morale + Math.floor(Math.random() * 5) + 2);
        gameState.team.chemistry = Math.min(100, gameState.team.chemistry + Math.floor(Math.random() * 3) + 1);
    } else {
        gameState.team.morale = Math.max(30, gameState.team.morale - Math.floor(Math.random() * 5) + 2);
    }
    
    // Add news
    const newsMessage = won ? 
        `🎉 Victory! ${gameState.school.nickname} defeats ${game.opponent.nickname} ${playerScore}-${opponentScore}!` :
        `😞 Tough loss. ${game.opponent.nickname} beats ${gameState.school.nickname} ${opponentScore}-${playerScore}.`;
    
    addNews(newsMessage);
    
    // Show continue button
    document.getElementById('continue-btn').style.display = 'block';
    document.getElementById('skip-sim-btn').style.display = 'none';
    document.getElementById('sim-status').textContent = 'Game Complete!';
}

function skipSimulation() {
    // Quick simulation without animation
    const nextGame = gameState.schedule.find(game => !game.played);
    if (!nextGame) return;
    
    const playerStrength = gameState.team.overall;
    const opponentStrength = Math.floor(Math.random() * 30) + 60 + (nextGame.opponent.prestige * 3);
    const homeAdvantage = nextGame.isHome ? 5 : 0;
    
    const playerScore = Math.floor(Math.random() * 21) + Math.floor((playerStrength + homeAdvantage) / 4) + 7;
    const opponentScore = Math.floor(Math.random() * 21) + Math.floor(opponentStrength / 4) + 7;
    
    finishGameSimulation(nextGame, 
        nextGame.isHome ? playerScore : opponentScore,
        nextGame.isHome ? opponentScore : playerScore
    );
}

function continueFromGame() {
    document.getElementById('game-simulation-modal').classList.remove('show');
    gameState.gameInProgress = false;
    
    // Advance week
    gameState.week++;
    gameState.gameWeek++;
    
    // Reset weekly resources
    gameState.resources.practicePoints = 3;
    
    // Check for season end
    if (gameState.gameWeek > 12) {
        endSeason();
    } else {
        updateUI();
    }
}

// Season Management
function endSeason() {
    const totalWins = gameState.record.wins;
    let message = '';
    
    if (totalWins >= 10) {
        message = '🏆 Outstanding season! Championship hopes are alive!';
        gameState.school.prestige = Math.min(5, gameState.school.prestige + 1);
    } else if (totalWins >= 8) {
        message = '🎉 Great season! Bowl game bound!';
    } else if (totalWins >= 6) {
        message = '👍 Decent season. Room for improvement.';
    } else {
        message = '😞 Disappointing season. Time to rebuild.';
        gameState.school.prestige = Math.max(1, gameState.school.prestige - 1);
    }
    
    addNews(message);
    addNews(`Final Record: ${gameState.record.wins}-${gameState.record.losses}`);
    
    // Prepare for next season
    setTimeout(() => {
        if (confirm('Season complete! Continue to next season?')) {
            startNewSeason();
        }
    }, 2000);
}

function startNewSeason() {
    gameState.season++;
    gameState.week = 1;
    gameState.gameWeek = 1;
    gameState.phase = 'preseason';
    gameState.record = { wins: 0, losses: 0, confWins: 0, confLosses: 0 };
    
    // Generate new schedule and recruits
    generateSchedule();
    generateRecruits();
    
    // Reset resources
    gameState.resources.practicePoints = 3;
    gameState.resources.recruitingPoints = 100;
    
    addNews(`Welcome to the ${gameState.season} season! New challenges await.`);
    updateUI();
}

// Utility Functions
function addNews(message) {
    gameState.news.push({
        message,
        week: gameState.week,
        timestamp: new Date().toLocaleString()
    });
}

function initializeFacilities() {
    gameState.facilities = {
        stadium: { level: gameState.school.prestige, capacity: gameState.school.capacity },
        practice: { level: gameState.school.prestige },
        academic: { level: gameState.school.prestige },
        training: { level: gameState.school.prestige }
    };
}

function initializeCoachingStaff() {
    gameState.coachingStaff = {
        offensive: { name: 'Mike Johnson', rating: 70 + Math.floor(Math.random() * 20) },
        defensive: { name: 'Tom Wilson', rating: 70 + Math.floor(Math.random() * 20) },
        special: { name: 'Dave Smith', rating: 65 + Math.floor(Math.random() * 20) }
    };
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

// Recruiting Functions
function updateRecruitingScreen() {
    updateRecruitingStats();
    displayRecruits();
}

function updateRecruitingStats() {
    document.getElementById('recruiting-points').textContent = gameState.resources.recruitingPoints;
    document.getElementById('scholarships-available').textContent = gameState.resources.scholarships;
    document.getElementById('current-commits').textContent = 
        gameState.recruits.filter(r => r.recruited).length;
}

function displayRecruits() {
    const recruitsGrid = document.getElementById('recruits-grid');
    if (!recruitsGrid) return;
    
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
                <p class="position">${POSITIONS[recruit.position].name}</p>
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

function recruitPlayer(recruitId) {
    const recruit = gameState.recruits.find(r => r.id === recruitId);
    if (!recruit || recruit.recruited) return;
    
    const cost = Math.floor(recruit.rating / 10);
    if (gameState.resources.recruitingPoints < cost) {
        alert('Not enough recruiting points!');
        return;
    }
    
    if (gameState.resources.scholarships <= 0) {
        alert('No scholarships available!');
        return;
    }
    
    // Calculate success chance
    const baseChance = recruit.interest;
    const prestigeBonus = gameState.school.prestige * 5;
    const coachBonus = gameState.coach.style === 'recruiting' ? 15 : 0;
    
    const successChance = Math.min(95, baseChance + prestigeBonus + coachBonus);
    const success = Math.random() * 100 < successChance;
    
    if (success) {
        recruit.recruited = true;
        gameState.resources.recruitingPoints -= cost;
        gameState.resources.scholarships--;
        gameState.roster.push(recruit);
        
        addNews(`🎉 Successfully recruited ${recruit.fullName} (${recruit.position})!`);
        updateRecruitingScreen();
    } else {
        gameState.resources.recruitingPoints -= Math.floor(cost / 2);
        addNews(`😞 Failed to recruit ${recruit.fullName}. Better luck next time.`);
    }
    
    updateUI();
}

// Schedule Functions
function updateScheduleScreen() {
    const scheduleContainer = document.getElementById('schedule-container');
    if (!scheduleContainer) return;
    
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

// Training Functions
function startTraining(type) {
    if (gameState.resources.practicePoints <= 0) {
        alert('No practice points available this week!');
        return;
    }
    
    gameState.resources.practicePoints--;
    
    const improvement = Math.floor(Math.random() * 3) + 1;
    let message = '';
    
    switch (type) {
        case 'offense':
            gameState.team.offense = Math.min(99, gameState.team.offense + improvement);
            message = `🏃 Offensive practice complete! Offense improved by ${improvement} points.`;
            break;
        case 'defense':
            gameState.team.defense = Math.min(99, gameState.team.defense + improvement);
            message = `🛡️ Defensive practice complete! Defense improved by ${improvement} points.`;
            break;
        case 'special':
            gameState.team.specialTeams = Math.min(99, gameState.team.specialTeams + improvement);
            message = `🥅 Special teams practice complete! Special teams improved by ${improvement} points.`;
            break;
        case 'conditioning':
            gameState.team.offense = Math.min(99, gameState.team.offense + 1);
            gameState.team.defense = Math.min(99, gameState.team.defense + 1);
            gameState.team.specialTeams = Math.min(99, gameState.team.specialTeams + 1);
            gameState.team.chemistry = Math.min(100, gameState.team.chemistry + 2);
            message = `💪 Conditioning complete! All areas improved slightly.`;
            break;
    }
    
    // Recalculate overall rating
    gameState.team.overall = Math.round(
        (gameState.team.offense + gameState.team.defense + gameState.team.specialTeams) / 3
    );
    
    addNews(message);
    updateUI();
    
    // Update practice points display
    document.getElementById('practice-points').textContent = gameState.resources.practicePoints;
}

// Event Listeners for filters
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