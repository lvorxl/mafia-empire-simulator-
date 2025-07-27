# 🏈 College Football Dynasty Manager

A comprehensive college football management simulation game built with Node.js, Express, and modern web technologies. Build your championship dynasty, recruit top talent, and lead your team to glory!

## 🎮 Game Features

### **Complete Management Experience**
- **Coach Creation**: Choose your coaching philosophy and difficulty level
- **School Selection**: Pick from 12 authentic college programs with real conferences
- **Dynasty Building**: Multi-season progression with prestige system
- **Comprehensive Dashboard**: Professional multi-screen interface

### **Deep Gameplay Mechanics**
- **Team Management**: Roster management, depth charts, and training systems
- **Realistic Recruiting**: 50+ recruits with star ratings, interest levels, and position needs
- **Resource Management**: Practice points, recruiting points, and scholarships
- **Advanced Game Simulation**: Real-time game progression with play-by-play
- **Statistics Tracking**: Detailed performance analytics and season records

### **Authentic College Football**
- **Real Schools**: Alabama, Georgia, Michigan, Ohio State, Texas, Oklahoma, and more
- **Conference System**: SEC, Big Ten, Big 12, ACC, Pac-12, and Independent
- **Prestige Levels**: 5-star rating system affecting recruiting and gameplay
- **Authentic Atmosphere**: School colors, stadiums, and traditions

## 🚀 Quick Start

### **Prerequisites**
- Node.js 16.0.0 or higher
- npm 8.0.0 or higher

### **Local Development**

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd college-football-dynasty-manager
   npm install
   ```

2. **Start the Server**
   ```bash
   npm start
   # or for development with auto-reload
   npm run dev
   ```

3. **Play the Game**
   - Open your browser to `http://localhost:3000`
   - Create your coach and select your school
   - Start building your dynasty!

## 🏗️ Architecture

### **Backend (Node.js + Express)**
- **RESTful API**: Clean API endpoints for all game functionality
- **Session Management**: Server-side game state with Express sessions
- **SQLite Database**: Local database for game saves and statistics
- **Game Engine**: Server-side simulation and logic processing

### **Frontend (Vanilla JavaScript)**
- **Modern UI**: Professional dashboard with multiple screens
- **API Integration**: Async/await patterns for server communication
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Real-time Updates**: Dynamic UI updates based on game state

### **Key Components**
```
├── server.js           # Main Express server
├── public/            # Static frontend files
│   ├── index.html     # Main game interface
│   ├── style.css      # Modern styling
│   └── script.js      # Frontend game logic
├── game.db            # SQLite database (auto-created)
├── package.json       # Dependencies and scripts
└── .env              # Environment configuration
```

## 🌐 Deployment Options

### **Option 1: Render Web Service (Recommended)**

1. **Connect Repository**
   - Link your GitHub repository to Render
   - Select "Web Service" as the service type

2. **Configure Build**
   ```yaml
   Build Command: npm install
   Start Command: npm start
   ```

3. **Environment Variables**
   ```
   NODE_ENV=production
   SESSION_SECRET=your-secure-secret-key
   ```

4. **Deploy**
   - Render will automatically build and deploy
   - Your game will be available at `https://your-app.onrender.com`

### **Option 2: Railway**

1. **Connect Repository**
   ```bash
   railway login
   railway link
   railway up
   ```

2. **Set Environment Variables**
   ```bash
   railway variables set NODE_ENV=production
   railway variables set SESSION_SECRET=your-secure-secret
   ```

### **Option 3: Heroku**

1. **Create Heroku App**
   ```bash
   heroku create your-app-name
   ```

2. **Set Environment Variables**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set SESSION_SECRET=your-secure-secret
   ```

3. **Deploy**
   ```bash
   git push heroku main
   ```

### **Option 4: Docker**

```dockerfile
# Dockerfile included in project
docker build -t college-football-manager .
docker run -p 3000:3000 college-football-manager
```

## 🎯 API Endpoints

### **Game Management**
- `GET /api/schools` - Get all available schools
- `POST /api/game/new` - Create new game
- `GET /api/game/state` - Get current game state
- `POST /api/game/save` - Save game
- `POST /api/game/load` - Load saved game

### **Gameplay**
- `POST /api/game/simulate` - Simulate next game
- `POST /api/game/recruit` - Recruit a player
- `POST /api/game/practice` - Conduct team practice
- `POST /api/game/advance-week` - Advance to next week

### **Statistics**
- `GET /api/leaderboard` - Get global leaderboard

## 🎮 How to Play

### **Getting Started**
1. **Create Your Coach**: Choose name, philosophy, and difficulty
2. **Select Your School**: Pick from 12 authentic programs
3. **Build Your Dynasty**: Manage team, recruit players, and win games

### **Core Gameplay Loop**
1. **Prepare**: Use practice points to improve team ratings
2. **Recruit**: Spend recruiting points to attract top talent
3. **Compete**: Simulate games against conference and national opponents
4. **Progress**: Advance through weeks and seasons
5. **Dynasty**: Build prestige and compete for championships

### **Key Strategies**
- **Recruiting**: Higher prestige schools attract better recruits
- **Practice**: Balance offense, defense, and special teams development
- **Resource Management**: Allocate practice points and recruiting budget wisely
- **Long-term Planning**: Build for sustained success across multiple seasons

## 🏆 Game Mechanics

### **Team Ratings**
- **Overall**: Combined team strength (60-99)
- **Offense**: Scoring and yardage ability
- **Defense**: Stopping opponents and creating turnovers
- **Special Teams**: Kicking, punting, and return game
- **Chemistry**: Team cohesion and performance
- **Discipline**: Avoiding penalties and mistakes
- **Morale**: Player motivation and confidence

### **Recruiting System**
- **Star Ratings**: 2-5 star recruits based on talent level
- **Interest Levels**: Recruit interest in your program (0-100%)
- **Position Needs**: QB, RB, WR, TE, OL, DL, LB, DB, K
- **Success Factors**: School prestige, coaching style, recruiting points

### **Season Structure**
- **12 Regular Season Games**: Mix of conference and non-conference
- **Weekly Progression**: Practice, recruit, and compete
- **Season Evaluation**: Win totals determine bowl eligibility and prestige
- **Multi-Season Dynasty**: Build long-term success

## 🔧 Development

### **Project Structure**
```
college-football-dynasty-manager/
├── server.js              # Express server and API routes
├── public/                # Frontend static files
│   ├── index.html        # Main game interface
│   ├── style.css         # Styling and animations
│   └── script.js         # Frontend game logic
├── game.db               # SQLite database (auto-created)
├── package.json          # Node.js dependencies
├── .env                  # Environment variables
└── README.md            # This file
```

### **Key Technologies**
- **Backend**: Node.js, Express, SQLite3, Express-Session
- **Frontend**: Vanilla JavaScript, Modern CSS, Font Awesome
- **Database**: SQLite for development, easily upgradeable to PostgreSQL
- **Security**: Helmet.js, CORS, Session management
- **Deployment**: Docker support, Render/Railway/Heroku ready

### **Adding Features**
1. **New API Endpoints**: Add routes in `server.js`
2. **Frontend Features**: Update `script.js` and `style.css`
3. **Database Changes**: Modify table schemas in `initializeDatabase()`
4. **Game Logic**: Extend the `GameEngine` class

## 📊 Database Schema

### **Tables**
- **users**: User accounts and authentication
- **game_saves**: Saved game states and progress
- **game_stats**: Season and career statistics
- **leaderboard**: Global rankings and achievements

### **Game State Structure**
```javascript
{
  coach: { name, style, difficulty, experience, reputation },
  school: { id, name, nickname, conference, prestige, colors },
  team: { overall, offense, defense, specialTeams, chemistry, discipline, morale },
  record: { wins, losses, confWins, confLosses },
  resources: { practicePoints, recruitingPoints, scholarships },
  schedule: [{ week, opponent, isHome, isConference, played, result }],
  recruits: [{ id, name, position, rating, stars, interest, recruited }],
  roster: [{ id, name, position, year, rating, potential }],
  news: [{ message, week, timestamp }]
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎯 Future Features

- **Multiplayer Leagues**: Compete against other human coaches
- **Advanced Analytics**: Detailed player and team statistics
- **Playoff System**: College Football Playoff simulation
- **Transfer Portal**: Player transfers between seasons
- **Coaching Tree**: Hire coordinators and develop coaching staff
- **Facilities Upgrades**: Improve stadium, practice facilities, and academics
- **NIL System**: Name, Image, Likeness recruiting factors

## 🏈 Credits

Built with passion for college football and modern web development. Special thanks to the college football community for inspiration and feedback.

---

**Start your dynasty today!** 🏆

Visit the game at your deployed URL or run locally at `http://localhost:3000`