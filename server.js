const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Database setup
const db = new sqlite3.Database('./game.db');

// Set EJS as template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Session configuration
app.use(session({
    secret: 'college-football-dynasty-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

// Initialize database
function initializeDatabase() {
    db.serialize(() => {
        db.run(`CREATE TABLE IF NOT EXISTS game_sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT UNIQUE,
            game_data TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
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
        prestige: 5,
        colors: ['#A6192E', '#FFFFFF']
    },
    {
        id: 'georgia',
        name: 'University of Georgia',
        nickname: 'Bulldogs',
        abbreviation: 'UGA',
        conference: 'SEC',
        prestige: 5,
        colors: ['#BA0C2F', '#000000']
    },
    {
        id: 'michigan',
        name: 'University of Michigan',
        nickname: 'Wolverines',
        abbreviation: 'MICH',
        conference: 'Big Ten',
        prestige: 4,
        colors: ['#00274C', '#FFCB05']
    },
    {
        id: 'ohio-state',
        name: 'Ohio State University',
        nickname: 'Buckeyes',
        abbreviation: 'OSU',
        conference: 'Big Ten',
        prestige: 5,
        colors: ['#BB0000', '#FFFFFF']
    },
    {
        id: 'texas',
        name: 'University of Texas',
        nickname: 'Longhorns',
        abbreviation: 'TEX',
        conference: 'Big 12',
        prestige: 4,
        colors: ['#BF5700', '#FFFFFF']
    },
    {
        id: 'oklahoma',
        name: 'University of Oklahoma',
        nickname: 'Sooners',
        abbreviation: 'OU',
        conference: 'Big 12',
        prestige: 4,
        colors: ['#841617', '#FDD116']
    }
];

// Game engine
class CollegeFootballGame {
    constructor() {
        this.schools = SCHOOLS;
    }

    createNewGame(coachName, schoolId) {
        const school = this.schools.find(s => s.id === schoolId);
        if (!school) throw new Error('Invalid school');

        return {
            coach: { name: coachName },
            school: school,
            season: 2024,
            week: 1,
            team: {
                overall: 70 + (school.prestige * 3),
                offense: 68 + (school.prestige * 3),
                defense: 72 + (school.prestige * 3),
                morale: 75
            },
            record: { wins: 0, losses: 0 },
            resources: { practicePoints: 3, recruitingPoints: 100 },
            schedule: this.generateSchedule(school),
            recruits: this.generateRecruits(),
            news: [`Welcome to ${school.name}! Your dynasty begins now.`]
        };
    }

    generateSchedule(school) {
        const opponents = this.schools.filter(s => s.id !== school.id);
        const schedule = [];
        
        for (let week = 1; week <= 12; week++) {
            const opponent = opponents[Math.floor(Math.random() * opponents.length)];
            schedule.push({
                week,
                opponent,
                isHome: Math.random() > 0.5,
                played: false,
                result: null
            });
        }
        return schedule;
    }

    generateRecruits() {
        const positions = ['QB', 'RB', 'WR', 'OL', 'DL', 'LB', 'DB'];
        const recruits = [];
        
        for (let i = 0; i < 20; i++) {
            const position = positions[Math.floor(Math.random() * positions.length)];
            const rating = Math.floor(Math.random() * 40) + 60;
            
            recruits.push({
                id: uuidv4(),
                name: this.generatePlayerName(),
                position,
                rating,
                stars: Math.ceil(rating / 20),
                interest: Math.floor(Math.random() * 100),
                recruited: false
            });
        }
        return recruits;
    }

    generatePlayerName() {
        const firstNames = ['James', 'Michael', 'Robert', 'David', 'William', 'Richard', 'Joseph', 'Thomas', 'Christopher', 'Daniel'];
        const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis', 'Wilson', 'Moore', 'Taylor'];
        
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        
        return `${firstName} ${lastName}`;
    }

    simulateGame(gameState, gameIndex) {
        const game = gameState.schedule[gameIndex];
        if (!game || game.played) return null;

        const playerStrength = gameState.team.overall;
        const opponentStrength = 60 + (game.opponent.prestige * 5);
        const homeAdvantage = game.isHome ? 5 : 0;

        const playerScore = Math.floor(Math.random() * 21) + Math.floor((playerStrength + homeAdvantage) / 4) + 7;
        const opponentScore = Math.floor(Math.random() * 21) + Math.floor(opponentStrength / 4) + 7;

        const won = playerScore > opponentScore;
        
        game.played = true;
        game.result = { playerScore, opponentScore, won };

        // Update record
        if (won) {
            gameState.record.wins++;
            gameState.team.morale = Math.min(100, gameState.team.morale + 5);
        } else {
            gameState.record.losses++;
            gameState.team.morale = Math.max(30, gameState.team.morale - 3);
        }

        // Add news
        const newsMessage = won ? 
            `🎉 Victory! ${gameState.school.nickname} defeats ${game.opponent.nickname} ${playerScore}-${opponentScore}!` :
            `😞 Tough loss. ${game.opponent.nickname} beats ${gameState.school.nickname} ${opponentScore}-${playerScore}.`;
        
        gameState.news.push(newsMessage);

        return game.result;
    }

    recruitPlayer(gameState, recruitId) {
        const recruit = gameState.recruits.find(r => r.id === recruitId);
        if (!recruit || recruit.recruited) return false;

        const cost = Math.floor(recruit.rating / 10);
        if (gameState.resources.recruitingPoints < cost) return false;

        const successChance = recruit.interest + (gameState.school.prestige * 10);
        const success = Math.random() * 100 < successChance;

        if (success) {
            recruit.recruited = true;
            gameState.resources.recruitingPoints -= cost;
            gameState.news.push(`🎉 Successfully recruited ${recruit.name} (${recruit.position})!`);
            return true;
        } else {
            gameState.resources.recruitingPoints -= Math.floor(cost / 2);
            gameState.news.push(`😞 Failed to recruit ${recruit.name}.`);
            return false;
        }
    }

    practice(gameState, type) {
        if (gameState.resources.practicePoints <= 0) return false;

        gameState.resources.practicePoints--;
        const improvement = Math.floor(Math.random() * 3) + 1;

        switch (type) {
            case 'offense':
                gameState.team.offense = Math.min(99, gameState.team.offense + improvement);
                gameState.news.push(`🏃 Offensive practice complete! Offense improved by ${improvement} points.`);
                break;
            case 'defense':
                gameState.team.defense = Math.min(99, gameState.team.defense + improvement);
                gameState.news.push(`🛡️ Defensive practice complete! Defense improved by ${improvement} points.`);
                break;
        }

        // Recalculate overall
        gameState.team.overall = Math.round((gameState.team.offense + gameState.team.defense) / 2);
        return true;
    }

    advanceWeek(gameState) {
        gameState.week++;
        gameState.resources.practicePoints = 3; // Reset practice points
        
        if (gameState.week > 12) {
            // Season ended
            const totalWins = gameState.record.wins;
            let message = '';
            
            if (totalWins >= 10) {
                message = '🏆 Outstanding season! Championship hopes are alive!';
            } else if (totalWins >= 8) {
                message = '🎉 Great season! Bowl game bound!';
            } else if (totalWins >= 6) {
                message = '👍 Decent season. Room for improvement.';
            } else {
                message = '😞 Disappointing season. Time to rebuild.';
            }
            
            gameState.news.push(message);
            gameState.news.push(`Final Record: ${gameState.record.wins}-${gameState.record.losses}`);
            return true; // Season ended
        }
        
        return false; // Season continues
    }
}

const gameEngine = new CollegeFootballGame();

// Helper functions
function saveGameState(sessionId, gameState) {
    return new Promise((resolve, reject) => {
        const gameData = JSON.stringify(gameState);
        db.run(
            `INSERT OR REPLACE INTO game_sessions (session_id, game_data, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)`,
            [sessionId, gameData],
            function(err) {
                if (err) reject(err);
                else resolve();
            }
        );
    });
}

function loadGameState(sessionId) {
    return new Promise((resolve, reject) => {
        db.get(
            `SELECT game_data FROM game_sessions WHERE session_id = ?`,
            [sessionId],
            (err, row) => {
                if (err) reject(err);
                else if (row) resolve(JSON.parse(row.game_data));
                else resolve(null);
            }
        );
    });
}

// Routes

// Home page
app.get('/', async (req, res) => {
    try {
        const existingGame = await loadGameState(req.sessionID);
        res.render('home', { 
            hasExistingGame: !!existingGame,
            schools: SCHOOLS 
        });
    } catch (error) {
        console.error('Error:', error);
        res.render('home', { hasExistingGame: false, schools: SCHOOLS });
    }
});

// Coach creation
app.get('/coach', (req, res) => {
    res.render('coach');
});

// School selection
app.get('/schools', (req, res) => {
    const { coachName } = req.query;
    if (!coachName) return res.redirect('/coach');
    
    res.render('schools', { 
        schools: SCHOOLS,
        coachName 
    });
});

// Create game
app.post('/create', async (req, res) => {
    const { coachName, schoolId } = req.body;
    
    try {
        const gameState = gameEngine.createNewGame(coachName, schoolId);
        await saveGameState(req.sessionID, gameState);
        res.redirect('/game');
    } catch (error) {
        console.error('Error creating game:', error);
        res.redirect('/schools?coachName=' + encodeURIComponent(coachName));
    }
});

// Main game dashboard
app.get('/game', async (req, res) => {
    try {
        const gameState = await loadGameState(req.sessionID);
        if (!gameState) return res.redirect('/');
        
        res.render('game', { gameState });
    } catch (error) {
        console.error('Error loading game:', error);
        res.redirect('/');
    }
});

// Team management screen
app.get('/team', async (req, res) => {
    try {
        const gameState = await loadGameState(req.sessionID);
        if (!gameState) return res.redirect('/');
        
        res.render('team', { gameState });
    } catch (error) {
        console.error('Error:', error);
        res.redirect('/game');
    }
});

// Recruiting screen
app.get('/recruiting', async (req, res) => {
    try {
        const gameState = await loadGameState(req.sessionID);
        if (!gameState) return res.redirect('/');
        
        res.render('recruiting', { gameState });
    } catch (error) {
        console.error('Error:', error);
        res.redirect('/game');
    }
});

// Schedule screen
app.get('/schedule', async (req, res) => {
    try {
        const gameState = await loadGameState(req.sessionID);
        if (!gameState) return res.redirect('/');
        
        res.render('schedule', { gameState });
    } catch (error) {
        console.error('Error:', error);
        res.redirect('/game');
    }
});

// Game actions
app.post('/simulate/:gameIndex', async (req, res) => {
    try {
        const gameState = await loadGameState(req.sessionID);
        if (!gameState) return res.redirect('/');
        
        const gameIndex = parseInt(req.params.gameIndex);
        const result = gameEngine.simulateGame(gameState, gameIndex);
        
        if (result) {
            await saveGameState(req.sessionID, gameState);
            res.render('game-result', { gameState, result, gameIndex });
        } else {
            res.redirect('/game');
        }
    } catch (error) {
        console.error('Error:', error);
        res.redirect('/game');
    }
});

app.post('/recruit/:recruitId', async (req, res) => {
    try {
        const gameState = await loadGameState(req.sessionID);
        if (!gameState) return res.redirect('/');
        
        const success = gameEngine.recruitPlayer(gameState, req.params.recruitId);
        await saveGameState(req.sessionID, gameState);
        
        res.redirect('/recruiting?result=' + (success ? 'success' : 'failure'));
    } catch (error) {
        console.error('Error:', error);
        res.redirect('/recruiting');
    }
});

app.post('/practice/:type', async (req, res) => {
    try {
        const gameState = await loadGameState(req.sessionID);
        if (!gameState) return res.redirect('/');
        
        const success = gameEngine.practice(gameState, req.params.type);
        await saveGameState(req.sessionID, gameState);
        
        res.redirect('/team?result=' + (success ? 'success' : 'failure'));
    } catch (error) {
        console.error('Error:', error);
        res.redirect('/team');
    }
});

app.post('/advance', async (req, res) => {
    try {
        const gameState = await loadGameState(req.sessionID);
        if (!gameState) return res.redirect('/');
        
        const seasonEnded = gameEngine.advanceWeek(gameState);
        await saveGameState(req.sessionID, gameState);
        
        if (seasonEnded) {
            res.render('season-end', { gameState });
        } else {
            res.redirect('/game');
        }
    } catch (error) {
        console.error('Error:', error);
        res.redirect('/game');
    }
});

// Reset game
app.post('/reset', (req, res) => {
    db.run('DELETE FROM game_sessions WHERE session_id = ?', [req.sessionID]);
    res.redirect('/');
});

// Start server
initializeDatabase();

app.listen(PORT, () => {
    console.log(`🏈 College Football Dynasty Manager running on port ${PORT}`);
    console.log(`🌐 Access your game at: http://localhost:${PORT}`);
    console.log(`🎮 Dynamic multi-screen game ready!`);
});