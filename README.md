# 🌍 GSS-CFS — Global Strategic Stability & Conflict Forecasting System
## MERN Stack Edition (HTML + CSS + JS + Node.js + MongoDB)

---

## 📁 Project Structure

```
gss-cfs-mern/
├── client/                    # Pure HTML/CSS/JS Frontend
│   ├── index.html             # Login page
│   ├── dashboard.html         # Global heatmap / home
│   ├── country.html           # Per-country intelligence dashboard
│   ├── compare.html           # Country comparison engine
│   ├── trends.html            # Historical trend analysis
│   ├── insights.html          # AI scenario simulator
│   ├── alerts.html            # Alert monitoring center
│   ├── css/
│   │   └── style.css          # Full defense dark theme
│   └── js/
│       ├── api.js             # Axios API service layer
│       ├── auth.js            # JWT auth helpers
│       ├── utils.js           # Shared utilities
│       ├── components/
│       │   ├── sidebar.js     # Sidebar navigation
│       │   ├── gauge.js       # Risk gauge meter (Canvas)
│       │   └── charts.js      # Chart.js wrappers
│       └── pages/
│           ├── login.js
│           ├── dashboard.js
│           ├── country.js
│           ├── compare.js
│           ├── trends.js
│           ├── insights.js
│           └── alerts.js
│
└── server/                    # Node.js + Express + MongoDB Backend
    ├── server.js              # Main entry point
    ├── package.json
    ├── .env.example
    ├── config/
    │   └── db.js              # MongoDB connection
    ├── models/
    │   ├── User.js
    │   ├── Country.js
    │   ├── MilitaryData.js
    │   ├── EconomicData.js
    │   ├── PoliticalData.js
    │   ├── AllianceData.js
    │   ├── CyberData.js
    │   ├── HistoricalConflict.js
    │   └── RiskScore.js
    ├── routes/
    │   ├── auth.routes.js
    │   ├── country.routes.js
    │   ├── risk.routes.js
    │   ├── compare.routes.js
    │   └── alert.routes.js
    ├── controllers/
    │   ├── auth.controller.js
    │   ├── country.controller.js
    │   ├── risk.controller.js
    │   └── compare.controller.js
    ├── middleware/
    │   ├── auth.middleware.js
    │   ├── error.middleware.js
    │   └── cache.middleware.js
    └── utils/
        ├── logger.js
        ├── riskEngine.js      # Rule-based risk scoring
        └── seed.js            # Sample data seeder
```

## 🚀 Quick Start

```bash
# 1. Start MongoDB
mongod --dbpath /data/db

# 2. Backend
cd server
npm install
cp .env.example .env
npm run seed      # seed sample countries
npm run dev       # runs on http://localhost:4000

# 3. Frontend (serve statically)
cd client
npx serve .       # or open index.html directly in browser
# OR use VS Code Live Server
```

## 🛠 Tech Stack

| Layer     | Technology |
|-----------|-----------|
| Frontend  | HTML5, CSS3, Vanilla JS (ES6+) |
| Charts    | Chart.js, D3.js |
| HTTP      | Axios |
| Backend   | Node.js + Express.js |
| Database  | MongoDB + Mongoose |
| Auth      | JWT + bcryptjs |
| Caching   | node-cache (in-memory) |

## 🔵 4-Phase Plan

| Phase | Done |
|-------|------|
| Phase 1 – Data Models + MongoDB Schema | ✅ |
| Phase 2 – Risk Engine + Scoring Logic | ✅ |
| Phase 3 – REST API (10+ endpoints) | ✅ |
| Phase 4 – HTML/CSS/JS Dashboard | ✅ |
