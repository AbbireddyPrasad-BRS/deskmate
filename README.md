# DeskMate — AI-Powered IT Helpdesk Assistant

DeskMate is an AI-powered IT helpdesk assistant built as a Proof of Concept (POC) for the Black Box Network Services — AI Engineer Intern assessment.

The project demonstrates:

* AI agent workflow orchestration
* LLM-driven reasoning
* conditional decision making
* parallel tool execution
* conversational memory
* observability and execution tracing
* graceful failure handling

This is intentionally designed as a clean, explainable, production-inspired POC without unnecessary overengineering.

---

# Live Demo

Frontend (Netlify):
https://deskmate-ai.netlify.app/

GitHub Repository:
https://github.com/AbbireddyPrasad-BRS/deskmate

---

# Problem Statement

Traditional IT helpdesk systems require employees to manually create tickets and wait for human triage.

DeskMate acts as an AI helpdesk agent that:

1. Understands natural-language IT requests
2. Decides which internal tools/systems to use
3. Executes tool workflows
4. Applies conditional reasoning
5. Responds conversationally with actionable outcomes

Example:

> “I need access to Adobe Creative Suite — if I’m not already entitled, create a high-priority ticket.”

---

# Core Features

## AI Agent Workflow

DeskMate uses a dynamic agent loop powered by Google Gemini function calling.

The assistant:

* interprets user intent
* selects tools dynamically
* executes mock IT operations
* reasons over tool outputs
* generates natural-language responses

---

## Conditional Decision Making

Supports enterprise-style workflows such as:

* Check entitlement
* IF access exists → inform user
* ELSE → create support ticket

---

## Parallel Tool Orchestration

Multiple tool calls can execute concurrently.

Example:

> “Check Adobe, Jira, and Slack access. Create tickets only for missing software.”

---

## Conversational Memory

The assistant remembers prior context and supports follow-up confirmations such as:

User:

> “I need Adobe access.”

Assistant:

> “You are not entitled. Would you like me to create a ticket?”

User:

> “Yes, sure.”

---

## Observability & Execution Tracing

A dedicated real-time trace panel exposes:

* agent reasoning flow
* tool invocations
* tool outputs
* timestamps
* execution decisions

This satisfies the assignment’s strict observability requirement.

---

## Graceful Failure Handling

DeskMate gracefully handles:

* out-of-scope requests
* malformed inputs
* missing ticket IDs
* mock system failures
* unavailable data

---

# Tech Stack

## Frontend

* React
* Vite
* Custom CSS

## Backend

* Node.js
* Express.js

## AI / LLM

* Google Gemini API
* Gemini Function Calling

## Deployment

* Netlify (Frontend)
* Render (Backend)

---

# System Architecture

```text
React Frontend
    ↓
Express API Server
    ↓
Agent Orchestrator (Gemini)
    ↓
Tool Layer
    ↓
Mock IT Systems
```

---

# Project Structure

```text
deskmate/
│
├── frontend/
│   ├── src/
│   └── public/
│
├── backend/
│   ├── mocks/
│   ├── tools/
│   ├── services/
│   ├── prompts/
│   └── server.js
│
├── README.md
├── ARCHITECTURE.md
└── .gitignore
```

---

# Mock IT Systems

The project includes realistic mock enterprise systems:

* employee entitlement system
* ticketing system
* password reset system
* software access management

Adobe Creative Suite entitlement is intentionally missing from the mock user profile to force conditional AI reasoning.

---

# Setup Instructions

## 1. Clone Repository

```bash
git clone https://github.com/AbbireddyPrasad-BRS/deskmate.git
cd deskmate
```

---

# Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file:

```env
GEMINI_API_KEY=your_api_key_here
PORT=3001
```

Start backend server:

```bash
node server.js
```

Expected output:

```bash
🔥 DeskMate Backend running on port 3001
```

---

# Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open:

```text
http://localhost:5173
```

---

# Example Test Prompts

## Simple Tool Execution

```text
Do I have VPN access?
```

---

## Conditional Workflow

```text
I need access to Adobe Creative Suite — if I’m not already entitled, create a high-priority ticket.
```

---

## Parallel Tool Execution

```text
Check Adobe, Jira, and Slack access. Create tickets only for missing software.
```

---

## Password Reset

```text
Reset my password.
```

---

## Ticket Status

```text
Check ticket INC-1001.
```

---

## Out-of-Scope Query

```text
Write me a poem.
```

---

# Key Design Decisions

* Used an in-memory singleton mock database instead of MongoDB to avoid unnecessary infrastructure complexity for a POC.
* Built a custom dynamic agent loop instead of relying on external orchestration frameworks to keep reasoning explicit and explainable.
* Prioritized observability as a first-class feature because the assignment explicitly required traceable execution.
* Added conversational memory to support real-world follow-up workflows.
* Added parallel function orchestration to support multi-tool enterprise workflows efficiently.

---

# Production Scaling Considerations

Production-grade scaling strategy and architectural trade-offs are documented in:

```text
ARCHITECTURE.md
```

Topics include:

* Azure Container Apps
* Cosmos DB
* Redis caching
* Entra ID authentication
* monitoring & observability
* agent reliability risks
* prompt injection concerns

---

# Assignment Objectives Covered

✅ Real LLM Integration
✅ AI Agent Workflow
✅ Tool Orchestration
✅ Conditional Reasoning
✅ Parallel Function Execution
✅ Conversational Memory
✅ Observability / Tracing
✅ Graceful Failure Handling
✅ Runnable End-to-End
✅ Deployment
✅ Production Design Documentation

---

# Author

VEERA VENKATA SATYA SAI PRASAD ABBIREDDY

AI Engineer Intern Assessment Submission
Black Box Network Services — AI Center of Excellence
