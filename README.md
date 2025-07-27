# 🏈 College Football Dynasty Simulator

Build your championship program! Lead your college football team to glory through game simulation, player recruitment, and strategic team management.

## 🎮 Features

- **Team Selection**: Choose from 12 major college football programs
- **Game Simulation**: Realistic game outcomes with detailed statistics
- **Player Recruitment**: Scout and recruit talented high school players
- **Team Practice**: Focus training on offense, defense, or special teams
- **Dynasty Mode**: Multi-season gameplay with prestige system
- **Beautiful UI**: Modern, responsive design with smooth animations

## 🚀 Deployment on Render

This project is configured for easy deployment on Render. You have multiple deployment options:

### Option 1: Static Site (Recommended)
1. Connect your GitHub repository to Render
2. Choose "Static Site" as the service type
3. Set build command: `echo "No build required"`
4. Set publish directory: `.` (current directory)

### Option 2: Web Service with Node.js
1. Connect your GitHub repository to Render
2. Choose "Web Service" as the service type
3. Set build command: `npm install`
4. Set start command: `npm start`
5. Render will automatically detect the `package.json` and use Node.js

### Option 3: Docker Deployment
1. Connect your GitHub repository to Render
2. Choose "Web Service" as the service type
3. Render will automatically detect and use the `Dockerfile`

## 🎯 How to Play

1. **Start New Dynasty** - Choose your favorite college team
2. **Simulate Games** - Play through your 12-game schedule
3. **Recruit Players** - Find and recruit talented prospects
4. **Practice** - Improve your team's ratings through focused training
5. **Build Prestige** - Win games to attract better recruits

## 🛠️ Local Development

To run locally:
```bash
npm install
npm start
```

Or simply open `index.html` in your web browser.

## 📁 Project Structure

```
college-football-simulator/
├── index.html          # Main game interface
├── style.css           # Modern styling and animations
├── script.js           # Game logic and simulation
├── server.js           # Node.js server for deployment
├── package.json        # Node.js dependencies
├── Dockerfile          # Docker configuration
├── render.yaml         # Render deployment config
└── README.md           # This file
```

## 🏆 Game Mechanics

- **Team Ratings**: Offense, Defense, Special Teams (0-99 scale)
- **Prestige System**: 1-5 star rating affecting recruitment success
- **Home Field Advantage**: +3 rating boost for home games
- **Random Events**: Weekly events that can affect your program
- **Season Progression**: 12-game regular seasons with bowl opportunities

## 🎨 Technologies Used

- **HTML5**: Modern semantic markup
- **CSS3**: Advanced styling with gradients, animations, and responsive design
- **JavaScript**: Game logic, simulation, and interactive features
- **Node.js/Express**: Server deployment option
- **Docker**: Containerized deployment option

## 📄 License

MIT License - Feel free to modify and distribute!

---

**Go build your dynasty! 🏆**