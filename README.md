# 🎮 DevOps Party

> **Level up your DevOps knowledge. One question at a time.**  
> A gamified quiz & interview-prep app for Linux, Bash, Git, Docker, Kubernetes, Terraform, CI/CD, Ansible, AWS, and more.

[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?logo=vite)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Docker](https://img.shields.io/badge/Docker-ready-2496ED?logo=docker)](./Dockerfile)

---

## ✨ What is this?

**DevOps Party** turns interview prep and learning into a game: XP, levels, bosses, power-ups, streaks, and badges. Practice real DevOps/SRE topics in quiz mode or in a **discussion-style** flow (hint → reveal answer), then take on level bosses for bonus XP.

---

## 🚀 Features

### Core game

- **11 learning levels** — Linux → Bash → Git → Docker → Ansible → Kubernetes → Terraform → AWS → CI/CD → OpenShift → DevOps Legend  
- **Unlock by XP** — Earn XP by answering questions; new levels unlock at thresholds  
- **Shuffled answers** — Correct option is randomized so you can’t memorize position  
- **Per-topic quizzes** — 10 questions per level; 70%+ accuracy to “complete” and unlock the next  
- **Fresh session per topic** — Switching level or leaving quiz clears state so you always start clean  

### Boss Battle Arena

- **Boss per level** — Challenge the boss of any unlocked level  
- **HP battle** — Correct = damage boss (+ combo bonus); wrong or timeout = you take damage  
- **Intro + countdown** — “BOSS APPROACHES!” then **3… 2… 1… GO!**  
- **Combo & taunts** — Consecutive correct answers increase damage; boss taunts on hit/miss  
- **Time Freeze power-up** — Pause the timer for 30 seconds during battle  

### Power-ups (used in quiz & boss)

- **50/50** — Remove two wrong answers (quiz)  
- **Skip** — Skip current question without penalty (quiz)  
- **Time Freeze** — Freeze boss timer 30s (boss only)  
- **Hint** — Reveal a short hint from the explanation (quiz)  

Earn more from the **Power-Up Shop** (Profile/Dashboard) with XP.

### Interview prep

- **Junior Interview (MCQ)** — Same topics, quiz format with shuffled options  
- **Discussion style** — No MCQ: read question → optional hint → reveal full answer  
- **Categories** — Linux, Bash, Docker, Kubernetes, Terraform, CI/CD, Ansible, **AWS**, **General DevOps**  
- **Senior** — “Coming soon” section for future content  

### Progression & polish

- **Streaks** — Daily practice streak tracking  
- **Badges** — Unlock by completing levels, bosses, accuracy, streaks  
- **Leaderboard** — Compare XP and progress  
- **Profile** — Avatar, stats, badges, power-up shop  
- **Daily challenge** — Extra goals and bonus XP  
- **Sound & confetti** — Correct/wrong, Level-Up, badge unlock  

---

## 🛠 Tech stack

| Layer        | Tech |
|-------------|------|
| Build       | Vite 5, TypeScript 5 |
| UI          | React 18, Tailwind CSS, shadcn/ui, Radix |
| State       | React Context + useReducer (game state), TanStack Query (optional) |
| Routing     | React Router 6 |
| Persistence | localStorage (user, progress, power-ups) |

---

## 📦 Run locally

### Prerequisites

- **Node.js** 18+ (or 20+) and npm (or bun)

### Install & dev

```bash
git clone <repo-url>
cd "DevOps Party"
npm install
npm run dev
```

Open **http://localhost:8080** (or the URL Vite prints).

### Build for production

```bash
npm run build
npm run preview   # serve dist locally
```

---

## 🐳 Docker

### Build image

```bash
docker build -t devops-party .
```

### Run container

```bash
docker run -p 8080:80 devops-party
```

Open **http://localhost:8080**. The app is served by nginx (SPA fallback to `index.html`).

### Docker Compose (optional)

```yaml
services:
  app:
    build: .
    ports:
      - "8080:80"
```

```bash
docker compose up -d
```

---

## 📁 Project structure (high level)

```
src/
├── components/   # UI + game (Dashboard, PowerUps, BadgeNotification, …)
├── contexts/     # GameContext (user, quiz, power-ups, clearQuiz, …)
├── data/         # questions, junior-interview, discussion Q&A, levels
├── hooks/        # useConfetti, useSoundEffects, useBadges
├── pages/        # Index, Quiz, LevelMap, BossBattle, Interview, …
├── types/        # game types (Question, Level, PowerUp, …)
└── main.tsx
```

---

## 🎯 Design choices

- **Clear quiz on topic change / leave** — Entering a different level or leaving the quiz clears `currentQuiz` so the next run is always a new session.  
- **Boss state reset on leave** — Leaving Boss Battle resets phase and selection so re-entry is clean.  
- **Boss levels** — Only “real” levels have bosses; Interview Prep is excluded from the boss list.  
- **Power-ups in context** — 50/50, Skip, Hint in Quiz; Time Freeze in Boss; all consume from the same inventory (Profile/Power-Up Shop).  

---

## 📄 License

Use and modify as you like. No warranty.

---

**Have fun, and may your deployments be green.** 🚀
