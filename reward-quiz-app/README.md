# Reward Quiz – Telegram Mini App

A complete Telegram Mini App built with **React + Vite + Tailwind CSS**.  
Users play quizzes, watch Monetag rewarded ads, earn points, and compete on the leaderboard.

---

## Quick Start

### Prerequisites
- Node.js ≥ 18 → [nodejs.org](https://nodejs.org)
- A Telegram Bot (via @BotFather) with Mini App enabled

### 1. Install dependencies
```bash
cd reward-quiz-app
npm install
```

### 2. Configure environment
Edit `.env`:
```
VITE_API_URL=https://your-backend-api.com
VITE_MONETAG_ZONE_ID=your_zone_id
```

### 3. Run in development
```bash
npm run dev
```

### 4. Build for production
```bash
npm run build
```
Upload the `dist/` folder to any static host (Vercel, Netlify, GitHub Pages, etc.).

---

## Project Structure

```
src/
├── components/
│   ├── Navbar.jsx        ← Bottom tab navigation
│   ├── UserCard.jsx      ← Telegram user avatar + name
│   ├── PointsCard.jsx    ← Current balance display
│   ├── QuizCard.jsx      ← Question + multiple choice options
│   ├── RewardButton.jsx  ← Animated "Watch Ad" CTA
│   ├── Leaderboard.jsx   ← Ranked user list
│   └── Loading.jsx       ← Full-screen spinner
├── pages/
│   ├── Home.jsx          ← Dashboard (greeting, daily bonus, CTAs)
│   ├── Quiz.jsx          ← Interactive quiz with timer
│   ├── Reward.jsx        ← Monetag rewarded ad integration
│   ├── Profile.jsx       ← User profile + quiz history
│   └── LeaderboardPage.jsx ← Top players
├── hooks/
│   └── useTelegram.js    ← Telegram WebApp SDK hook
├── context/
│   └── UserContext.jsx   ← Global user + points state
├── services/
│   ├── api.js            ← Axios backend API calls
│   └── monetag.js        ← Monetag rewarded ad service
├── utils/
│   ├── helpers.js        ← Shared utility functions
│   └── quizData.js       ← Fallback offline quiz questions
├── App.jsx
├── main.jsx
└── index.css
```

---

## Backend API Contract

Your backend should implement these endpoints:

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/users/login` | Login/register via Telegram data |
| GET | `/api/users/profile` | Get user profile by telegram_id |
| POST | `/api/rewards/add` | Add reward points after ad |
| POST | `/api/rewards/daily` | Claim daily bonus |
| GET | `/api/quiz/questions` | Get quiz questions |
| POST | `/api/quiz/submit` | Submit quiz score |
| GET | `/api/leaderboard` | Get top users |

All requests include `X-Telegram-Init-Data` header for authentication.

---

## Monetag Integration

1. Sign up at [monetag.com](https://monetag.com)
2. Create a **Rewarded Interstitial** zone
3. Copy the Zone ID into `.env` as `VITE_MONETAG_ZONE_ID`

In development mode, the ad is simulated automatically — no real ad is shown.

---

## Telegram Bot Setup

1. Create a bot with [@BotFather](https://t.me/BotFather)
2. Use `/newapp` to create a Mini App
3. Set the Mini App URL to your deployed `dist/` host
4. The app auto-detects Telegram user data on launch
