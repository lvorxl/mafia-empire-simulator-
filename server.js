const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Database setup
const db = new sqlite3.Database('./game.db');

// Set EJS as template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layout');

// Middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
}));
app.use(compression());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'college-football-dynasty-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Serve static files from public directory
app.use('/static', express.static(path.join(__dirname, 'public')));

// Initialize database tables
function initializeDatabase() {
    db.serialize(() => {
        // Users table
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            email TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Game saves table
        db.run(`CREATE TABLE IF NOT EXISTS game_saves (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT,
            user_id INTEGER,
            save_name TEXT NOT NULL,
            game_data TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )`);

        // Game statistics table
        db.run(`CREATE TABLE IF NOT EXISTS game_stats (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT,
            user_id INTEGER,
            coach_name TEXT,
            school_name TEXT,
            season INTEGER,
            wins INTEGER,
            losses INTEGER,
            championships INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )`);

        // Leaderboard table
        db.run(`CREATE TABLE IF NOT EXISTS leaderboard (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT,
            user_id INTEGER,
            coach_name TEXT,
            school_name TEXT,
            total_wins INTEGER DEFAULT 0,
            total_championships INTEGER DEFAULT 0,
            seasons_played INTEGER DEFAULT 0,
            prestige_points INTEGER DEFAULT 0,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )`);

        // Active games table for real-time tracking
        db.run(`CREATE TABLE IF NOT EXISTS active_games (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT UNIQUE,
            game_state TEXT NOT NULL,
            last_activity DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);
    });
}

// School data
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
        description: 'Elite program with championship tradition',
        mascot: 'Big Al',
        founded: 1831
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
        description: 'Elite program with passionate fanbase',
        mascot: 'Uga',
        founded: 1785
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
        description: 'Historic program with massive stadium',
        mascot: 'Wolverine',
        founded: 1817
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
        description: 'Elite program with national reach',
        mascot: 'Brutus Buckeye',
        founded: 1870
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
        description: 'Prestigious program in football-crazy Texas',
        mascot: 'Bevo',
        founded: 1883
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
        description: 'Traditional powerhouse with rich history',
        mascot: 'Boomer and Sooner',
        founded: 1890
    }
];

// Game logic classes
class GameEngine {
    constructor() {
        this.schools = SCHOOLS;
    }

    generatePlayer(position, isRecruit = false, schoolPrestige = 3) {
        const firstNames = ['James', 'Michael', 'Robert', 'John', 'David', 'William', 'Richard', 'Joseph', 'Thomas', 'Christopher', 'Daniel', 'Matthew', 'Anthony', 'Mark', 'Donald', 'Steven', 'Paul', 'Andrew', 'Joshua', 'Kenneth'];
        const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'];
        
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        
        const baseRating = isRecruit ? 
            Math.floor(Math.random() * 40) + 60 : 
            Math.floor(Math.random() * 30) + 65 + (schoolPrestige * 2);
        
        const rating = Math.max(60, Math.min(99, baseRating));
        const stars = Math.ceil(rating / 20);
        
        return {
            id: uuidv4(),
            firstName,
            lastName,
            fullName: `${firstName} ${lastName}`,
            position,
            year: isRecruit ? 'FR' : ['FR', 'SO', 'JR', 'SR'][Math.floor(Math.random() * 4)],
            rating,
            stars,
            potential: Math.max(rating, rating + Math.floor(Math.random() * 15)),
            recruited: false,
            interest: isRecruit ? Math.floor(Math.random() * 100) : 100
        };
    }

    generateSchedule(selectedSchool) {
        const opponents = this.schools.filter(school => school.id !== selectedSchool.id);
        const schedule = [];
        
        for (let week = 1; week <= 12; week++) {
            const opponent = opponents[Math.floor(Math.random() * opponents.length)];
            const isHome = Math.random() > 0.5;
            const isConference = opponent.conference === selectedSchool.conference;
            
            schedule.push({
                week,
                opponent,
                isHome,
                isConference,
                played: false,
                result: null
            });
        }
        
        return schedule;
    }

    simulateGame(playerTeam, opponent, isHome) {
        const playerStrength = playerTeam.overall;
        const opponentStrength = Math.floor(Math.random() * 30) + 60 + (opponent.prestige * 3);
        const homeAdvantage = isHome ? 5 : 0;
        
        const playerScore = Math.floor(Math.random() * 21) + Math.floor((playerStrength + homeAdvantage) / 4) + 7;
        const opponentScore = Math.floor(Math.random() * 21) + Math.floor(opponentStrength / 4) + 7;
        
        return {
            playerScore,
            opponentScore,
            won: playerScore > opponentScore,
            stats: {
                totalYards: Math.floor(Math.random() * 200) + 300,
                passingYards: Math.floor(Math.random() * 150) + 150,
                rushingYards: Math.floor(Math.random() * 150) + 100,
                turnovers: Math.floor(Math.random() * 4)
            }
        };
    }

    generateRecruits(count = 50, schoolPrestige = 3, coachStyle = 'balanced') {
        const positions = ['QB', 'RB', 'WR', 'TE', 'OL', 'DL', 'LB', 'DB', 'K'];
        const recruits = [];
        
        for (let i = 0; i < count; i++) {
            const position = positions[Math.floor(Math.random() * positions.length)];
            const recruit = this.generatePlayer(position, true, schoolPrestige);
            
            recruit.interest = Math.max(10, Math.min(90, 
                schoolPrestige * 15 + 
                Math.floor(Math.random() * 30) + 
                (coachStyle === 'recruiting' ? 10 : 0)
            ));
            
            recruits.push(recruit);
        }
        
        return recruits;
    }
}

const gameEngine = new GameEngine();

// Helper function to save game state to database
function saveGameState(sessionId, gameState) {
    return new Promise((resolve, reject) => {
        const gameData = JSON.stringify(gameState);
        db.run(
            `INSERT OR REPLACE INTO active_games (session_id, game_state, last_activity) 
             VALUES (?, ?, CURRENT_TIMESTAMP)`,
            [sessionId, gameData],
            function(err) {
                if (err) reject(err);
                else resolve();
            }
        );
    });
}

// Helper function to load game state from database
function loadGameState(sessionId) {
    return new Promise((resolve, reject) => {
        db.get(
            `SELECT game_state FROM active_games WHERE session_id = ?`,
            [sessionId],
            (err, row) => {
                if (err) reject(err);
                else if (row) resolve(JSON.parse(row.game_state));
                else resolve(null);
            }
        );
    });
}

// Routes

// Home page - dynamic loading screen
app.get('/', async (req, res) => {
    try {
        // Check if there's an existing game
        const existingGame = await loadGameState(req.sessionID);
        
        res.render('index', {
            title: 'College Football Dynasty Manager',
            hasExistingGame: !!existingGame,
            schools: SCHOOLS
        });
    } catch (error) {
        console.error('Error loading home page:', error);
        res.render('index', {
            title: 'College Football Dynasty Manager',
            hasExistingGame: false,
            schools: SCHOOLS
        });
    }
});

// Coach creation page
app.get('/create-coach', (req, res) => {
    res.render('create-coach', {
        title: 'Create Your Coach - Dynasty Manager'
    });
});

// School selection page
app.get('/select-school', (req, res) => {
    const { coachName, coachingStyle, difficulty } = req.query;
    
    if (!coachName) {
        return res.redirect('/create-coach');
    }
    
    res.render('select-school', {
        title: 'Choose Your Program - Dynasty Manager',
        schools: SCHOOLS,
        coachData: { coachName, coachingStyle, difficulty }
    });
});

// Game dashboard - main game interface
app.get('/dashboard', async (req, res) => {
    try {
        const gameState = await loadGameState(req.sessionID);
        
        if (!gameState) {
            return res.redirect('/');
        }
        
        res.render('dashboard', {
            title: `${gameState.school.nickname} Dynasty - Dynasty Manager`,
            gameState: gameState,
            currentView: req.query.view || 'overview'
        });
    } catch (error) {
        console.error('Error loading dashboard:', error);
        res.redirect('/');
    }
});

// Create new game
app.post('/create-game', async (req, res) => {
    const { coachName, coachingStyle, difficulty, schoolId } = req.body;
    
    if (!coachName || !schoolId) {
        return res.status(400).json({ error: 'Coach name and school are required' });
    }
    
    const selectedSchool = SCHOOLS.find(school => school.id === schoolId);
    if (!selectedSchool) {
        return res.status(400).json({ error: 'Invalid school selected' });
    }
    
    try {
        // Initialize game state
        const gameState = {
            coach: {
                name: coachName,
                style: coachingStyle,
                difficulty: difficulty,
                experience: 0,
                reputation: 50
            },
            school: selectedSchool,
            season: 2024,
            week: 1,
            gameWeek: 1,
            phase: 'preseason',
            team: {
                overall: Math.max(60, Math.min(85, 75 + (selectedSchool.prestige - 3) * 5 + Math.floor(Math.random() * 10 - 5))),
                offense: Math.max(60, Math.min(85, 75 + (selectedSchool.prestige - 3) * 5 + Math.floor(Math.random() * 10 - 5))),
                defense: Math.max(60, Math.min(85, 72 + (selectedSchool.prestige - 3) * 5 + Math.floor(Math.random() * 10 - 5))),
                specialTeams: Math.max(60, Math.min(85, 70 + (selectedSchool.prestige - 3) * 5 + Math.floor(Math.random() * 10 - 5))),
                chemistry: Math.max(50, Math.min(90, 68 + Math.floor(Math.random() * 20 - 10))),
                discipline: Math.max(50, Math.min(95, 82 + Math.floor(Math.random() * 20 - 10))),
                morale: Math.max(50, Math.min(95, 75 + Math.floor(Math.random() * 20 - 10)))
            },
            record: { wins: 0, losses: 0, confWins: 0, confLosses: 0 },
            resources: { practicePoints: 3, recruitingPoints: 100, scholarships: 25 },
            schedule: gameEngine.generateSchedule(selectedSchool),
            recruits: gameEngine.generateRecruits(50, selectedSchool.prestige, coachingStyle),
            roster: [],
            news: [
                { message: `Welcome to ${selectedSchool.name}! Your journey as head coach begins now.`, week: 1 },
                { message: 'Focus on recruiting, practice, and game preparation to build a championship program.', week: 1 }
            ]
        };
        
        // Calculate overall rating
        gameState.team.overall = Math.round(
            (gameState.team.offense + gameState.team.defense + gameState.team.specialTeams) / 3
        );
        
        // Save game state to database
        await saveGameState(req.sessionID, gameState);
        
        res.redirect('/dashboard');
    } catch (error) {
        console.error('Error creating game:', error);
        res.status(500).json({ error: 'Failed to create game' });
    }
});

// Simulate game
app.post('/simulate-game', async (req, res) => {
    try {
        const gameState = await loadGameState(req.sessionID);
        if (!gameState) {
            return res.status(404).json({ error: 'No active game found' });
        }
        
        const nextGame = gameState.schedule.find(game => !game.played);
        if (!nextGame) {
            return res.status(400).json({ error: 'No games to simulate' });
        }
        
        const result = gameEngine.simulateGame(gameState.team, nextGame.opponent, nextGame.isHome);
        
        // Update game result
        nextGame.played = true;
        nextGame.result = result;
        
        // Update record
        if (result.won) {
            gameState.record.wins++;
            if (nextGame.isConference) gameState.record.confWins++;
            gameState.team.morale = Math.min(100, gameState.team.morale + Math.floor(Math.random() * 5) + 2);
        } else {
            gameState.record.losses++;
            if (nextGame.isConference) gameState.record.confLosses++;
            gameState.team.morale = Math.max(30, gameState.team.morale - Math.floor(Math.random() * 5) + 2);
        }
        
        // Add news
        const newsMessage = result.won ? 
            `🎉 Victory! ${gameState.school.nickname} defeats ${nextGame.opponent.nickname} ${result.playerScore}-${result.opponentScore}!` :
            `😞 Tough loss. ${nextGame.opponent.nickname} beats ${gameState.school.nickname} ${result.opponentScore}-${result.playerScore}.`;
        
        gameState.news.push({ message: newsMessage, week: gameState.week });
        
        await saveGameState(req.sessionID, gameState);
        
        res.render('game-result', {
            title: 'Game Result - Dynasty Manager',
            gameState: gameState,
            gameResult: {
                game: nextGame,
                result: result
            }
        });
    } catch (error) {
        console.error('Error simulating game:', error);
        res.status(500).json({ error: 'Failed to simulate game' });
    }
});

// Recruit player
app.post('/recruit-player', async (req, res) => {
    try {
        const gameState = await loadGameState(req.sessionID);
        if (!gameState) {
            return res.status(404).json({ error: 'No active game found' });
        }
        
        const { recruitId } = req.body;
        const recruit = gameState.recruits.find(r => r.id === recruitId);
        
        if (!recruit || recruit.recruited) {
            return res.status(400).json({ error: 'Invalid recruit or already recruited' });
        }
        
        const cost = Math.floor(recruit.rating / 10);
        if (gameState.resources.recruitingPoints < cost) {
            return res.status(400).json({ error: 'Not enough recruiting points' });
        }
        
        if (gameState.resources.scholarships <= 0) {
            return res.status(400).json({ error: 'No scholarships available' });
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
            gameState.news.push({ 
                message: `🎉 Successfully recruited ${recruit.fullName} (${recruit.position})!`, 
                week: gameState.week 
            });
        } else {
            gameState.resources.recruitingPoints -= Math.floor(cost / 2);
            gameState.news.push({ 
                message: `😞 Failed to recruit ${recruit.fullName}. Better luck next time.`, 
                week: gameState.week 
            });
        }
        
        await saveGameState(req.sessionID, gameState);
        
        res.redirect('/dashboard?view=recruiting&result=' + (success ? 'success' : 'failure'));
    } catch (error) {
        console.error('Error recruiting player:', error);
        res.status(500).json({ error: 'Failed to recruit player' });
    }
});

// Practice/Training
app.post('/practice', async (req, res) => {
    try {
        const gameState = await loadGameState(req.sessionID);
        if (!gameState) {
            return res.status(404).json({ error: 'No active game found' });
        }
        
        const { type } = req.body;
        
        if (gameState.resources.practicePoints <= 0) {
            return res.status(400).json({ error: 'No practice points available' });
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
            default:
                return res.status(400).json({ error: 'Invalid practice type' });
        }
        
        // Recalculate overall rating
        gameState.team.overall = Math.round(
            (gameState.team.offense + gameState.team.defense + gameState.team.specialTeams) / 3
        );
        
        gameState.news.push({ message, week: gameState.week });
        await saveGameState(req.sessionID, gameState);
        
        res.redirect('/dashboard?view=team&result=practice-success');
    } catch (error) {
        console.error('Error practicing:', error);
        res.status(500).json({ error: 'Failed to complete practice' });
    }
});

// Advance week
app.post('/advance-week', async (req, res) => {
    try {
        const gameState = await loadGameState(req.sessionID);
        if (!gameState) {
            return res.status(404).json({ error: 'No active game found' });
        }
        
        gameState.week++;
        gameState.gameWeek++;
        gameState.resources.practicePoints = 3; // Reset practice points
        
        // Check for season end
        if (gameState.gameWeek > 12) {
            // Season ended - calculate results
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
            
            gameState.news.push({ message, week: gameState.week });
            gameState.news.push({ 
                message: `Final Record: ${gameState.record.wins}-${gameState.record.losses}`, 
                week: gameState.week 
            });
            
            await saveGameState(req.sessionID, gameState);
            return res.render('season-end', {
                title: 'Season Complete - Dynasty Manager',
                gameState: gameState
            });
        }
        
        await saveGameState(req.sessionID, gameState);
        res.redirect('/dashboard');
    } catch (error) {
        console.error('Error advancing week:', error);
        res.status(500).json({ error: 'Failed to advance week' });
    }
});

// Get leaderboard
app.get('/leaderboard', (req, res) => {
    db.all(`
        SELECT coach_name, school_name, total_wins, total_championships, seasons_played, prestige_points 
        FROM leaderboard 
        ORDER BY prestige_points DESC, total_championships DESC, total_wins DESC 
        LIMIT 50
    `, (err, rows) => {
        if (err) {
            console.error('Database error:', err);
            rows = [];
        }
        res.render('leaderboard', {
            title: 'Dynasty Leaderboard - Dynasty Manager',
            leaderboard: rows
        });
    });
});

// Reset game
app.post('/reset-game', async (req, res) => {
    try {
        // Delete the active game for this session
        db.run('DELETE FROM active_games WHERE session_id = ?', [req.sessionID]);
        res.redirect('/');
    } catch (error) {
        console.error('Error resetting game:', error);
        res.status(500).json({ error: 'Failed to reset game' });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error', {
        title: 'Error - Dynasty Manager',
        error: 'Something went wrong!'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).render('error', {
        title: '404 - Dynasty Manager',
        error: 'Page not found'
    });
});

// Start server
initializeDatabase();

app.listen(PORT, () => {
    console.log(`🏈 College Football Dynasty Manager running on port ${PORT}`);
    console.log(`🌐 Access your game at: http://localhost:${PORT}`);
    console.log(`📊 Database initialized and ready`);
    console.log(`🎮 Game engine loaded with ${SCHOOLS.length} schools`);
    console.log(`🏗️ Server-side rendering enabled with EJS templates`);
});