<div align="center">

# DevOps Party

**Learn DevOps. Fight bosses. Get hired.**

A gamified quiz game that turns DevOps interview prep into an actual good time.

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Docker](https://img.shields.io/badge/Docker-ready-2496ED?logo=docker&logoColor=white)](./Dockerfile)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)

<br/>

<img src="leve-up.png" alt="DevOps Party Dashboard" width="720" />

<br/>

*250+ questions &bull; 11 worlds &bull; Boss battles &bull; Terminal challenges &bull; Interview prep*

</div>

---

## Why this exists

Studying for DevOps interviews is boring. Flashcards are boring. Reading docs at 2 AM is boring.

So I built a game instead.

Pick a topic, answer questions, earn XP, unlock levels, fight bosses, and learn real skills along the way. Wrong answers get tracked so you can review them later. Right answers get celebrated with confetti.

---

## Features

### Game Modes

| Mode | What it does |
|------|-------------|
| **Quiz** | 10 questions per level, 70%+ to pass, shuffled answers |
| **Boss Battle** | HP-based fight per level -- combos, taunts, time pressure |
| **Survival** | Endless questions, 3 lives, ticking clock, no mercy |
| **Terminal Challenge** | Type real commands in a simulated terminal |
| **Scenario Lab** | Multi-step troubleshooting (CrashLoopBackOff, disk full, bad deploy) |
| **Challenge a Friend** | Shareable link with your score to beat |

### Learn

| Feature | What it does |
|---------|-------------|
| **Study Cards** | Concept flashcards per level -- pro tips, code examples, common mistakes |
| **Review Mistakes** | Every wrong answer is tracked for spaced repetition |
| **Learn Why** | Deep explanations + bookmark on wrong answers |
| **Cheat Sheet** | Searchable reference for 85+ commands, copy to clipboard |
| **Daily Tips** | Actionable tip of the day with code snippets |
| **Interview Prep** | MCQ mode + discussion mode (question, hint, answer) |

### Polish

| Feature | What it does |
|---------|-------------|
| **11 Worlds** | Linux, Bash, Git, Docker, Ansible, K8s, Terraform, AWS, CI/CD, OpenShift, DevOps Legend |
| **Progression** | XP, levels, streaks, daily challenges |
| **Badges** | 20+ achievements for milestones and secret discoveries |
| **Power-ups** | 50/50, skip, hint, time freeze |
| **Achievement Toasts** | Speed Demon, Comeback Kid, Night Deployer, and more |
| **Fun** | Confetti, sound effects, roasts, easter eggs |

---

## Run it

```bash
git clone https://github.com/a7md12/DevOps-Party.git
cd "DevOps Party"
npm install
npm run dev
```

Or with Docker:

```bash
docker run -p 8080:80 a7md12/level-up-party:v5.0
```

Open **http://localhost:8080**

---

## Contributing

This is open source and built for the community.

**Add questions** -- Fork the repo, add questions to the files in `src/data/`, open a PR. The more real interview questions, the better this gets for everyone.

**Add scenarios** -- Got a real debugging war story? Add it in `src/data/terminal-scenarios.ts`.

**Add study cards** -- Know a topic well? Add cards in `src/data/study-cards.ts`.

**Fix things** -- Found a bug or wrong answer? PRs welcome.

<details>
<summary>Question format</summary>

```typescript
{
  id: 'topic-number',
  levelId: 'docker',          // linux | bash | git | docker | ansible | kubernetes | terraform | aws | cicd | openshift | devops
  difficulty: 'medium',       // easy | medium | hard | evil
  question: 'Your question?',
  code: 'optional code block',
  options: ['A', 'B', 'C', 'D'],  // keep similar lengths
  correctAnswer: 0,           // index of correct option
  explanation: 'Why this is correct.',
  wrongFeedback: ['Roast 1', 'Roast 2', 'Roast 3'],
  xpReward: 20,
  tags: ['containers', 'networking'],
}
```

</details>

---

## Tech

React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui. State in React Context + useReducer. All data in localStorage. No backend needed.

---

## License

Use it, fork it, learn from it. No warranty. No servers were harmed in the making of this game.

**May your deployments be green and your on-call shifts be quiet.**
