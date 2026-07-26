# Reward Quiz – Backend API

Node.js + Express + MongoDB Atlas backend for the Reward Quiz Telegram Mini App.

---

## Quick Start

### 1. Install Node.js
Download from [nodejs.org](https://nodejs.org) (v18 or later).

### 2. Install dependencies
```bash
cd backend
npm install
```

### 3. Configure environment
Copy `.env.example` to `.env` and fill in your values:

```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/reward-quiz
JWT_SECRET=your_super_secret_64_char_string
TELEGRAM_BOT_TOKEN=your_bot_token_from_botfather
ALLOWED_ORIGINS=http://localhost:5173,https://your-frontend.vercel.app
```

### 4. Seed the database with quiz questions
```bash
npm run seed
```

### 5. Start development server
```bash
npm run dev        # uses nodemon (auto-restart)
npm start          # production
```

---

## Folder Structure

```
src/
├── config/
│   ├── db.js              ← MongoDB connection
│   └── constants.js       ← Centralised config values
├── controllers/
│   ├── userController.js       ← Login, profile
│   ├── rewardController.js     ← Ad rewards, daily bonus
│   ├── quizController.js       ← Questions, submit, history
│   └── leaderboardController.js← All-time + weekly rankings
├── middleware/
│   ├── authMiddleware.js       ← JWT + Telegram initData HMAC verify
│   ├── errorMiddleware.js      ← Global 404 + error handler
│   ├── rateLimitMiddleware.js  ← Per-route rate limiters
│   └── validateMiddleware.js   ← express-validator helper
├── models/
│   ├── User.js            ← Player document
│   ├── Quiz.js            ← Question bank
│   ├── QuizResult.js      ← Per-attempt results
│   └── Reward.js          ← Reward audit log
├── routes/
│   ├── userRoutes.js
│   ├── rewardRoutes.js
│   ├── quizRoutes.js
│   └── leaderboardRoutes.js
├── scripts/
│   └── seedQuestions.js   ← DB seed script
├── utils/
│   └── helpers.js
├── validators/
│   ├── userValidators.js
│   └── quizValidators.js
├── app.js                 ← Express app setup
└── server.js              ← Entry point
```

---

## API Reference

### Auth
All protected routes accept **either**:
- `Authorization: Bearer <JWT>` header
- `X-Telegram-Init-Data: <raw initData>` header (verified via HMAC-SHA256)

In **development**, you can pass `X-Dev-Telegram-Id: <telegram_id>` to bypass auth.

---

### Users

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/users/login` | None | Login / register via Telegram data |
| GET | `/api/users/profile` | ✅ | Full profile + quiz history |
| GET | `/api/users/me` | ✅ | Lightweight current user |

**POST /api/users/login** body:
```json
{
  "telegram_id": "123456789",
  "username": "johndoe",
  "first_name": "John",
  "last_name": "Doe",
  "photo_url": "https://..."
}
```

Response:
```json
{
  "success": true,
  "token": "<JWT>",
  "user": { "telegram_id": "...", "points": 0, ... }
}
```

---

### Rewards

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/rewards/add` | ✅ | Add ad-watch points (enforces daily limit) |
| POST | `/api/rewards/daily` | ✅ | Claim daily bonus (once per day) |
| GET | `/api/rewards/history` | ✅ | Paginated reward log |

---

### Quiz

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/quiz/questions` | ✅ | Get randomised questions (answers excluded) |
| POST | `/api/quiz/submit` | ✅ | Submit answers for server-side grading |
| GET | `/api/quiz/history` | ✅ | Past quiz results |

**POST /api/quiz/submit** body:
```json
{
  "answers": [
    { "questionId": "<mongoId>", "selected": 2 },
    { "questionId": "<mongoId>", "selected": 0 }
  ]
}
```

---

### Leaderboard

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/leaderboard` | Optional | All-time top users |
| GET | `/api/leaderboard/weekly` | Optional | Top users this week |

---

## Security Notes

- Telegram `initData` is validated with HMAC-SHA256 using your bot token
- `auth_date` is checked — tokens older than 24 hours are rejected
- Helmet sets secure HTTP headers
- Rate limiting on login (20/15min) and rewards (30/15min)
- Quiz answers are graded server-side — client cannot fake scores
- Daily ad limits enforced server-side
- `.env` is never committed (gitignored)
