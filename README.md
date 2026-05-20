# DeskMate - AI IT Helpdesk Assistant

DeskMate is an AI-powered IT helpdesk assistant built for the Black Box Network Services AI Center of Excellence assignment. 

This project is a Proof of Concept (POC) demonstrating **AI agent workflow thinking, tool orchestration, conditional reasoning, and observability** without unnecessary overengineering.

## Features
- **Agentic Workflow:** The AI understands intent, decides which tools to use, and executes them (often concurrently) before returning a natural language response.
- **Conditional Decision Making:** Handles complex requests like *"If I'm not entitled to Adobe, create a ticket."*
- **Observability:** A built-in "Trace the agent" panel allows reviewers to see real-time execution logs, tool inputs, and intermediate thought processes.
- **Graceful Error Handling:** Politely rejects out-of-scope requests, handles missing tool data gracefully, and recovers from internal API failures.
- **Conversational Memory:** Remembers context across messages to allow for follow-up confirmations (e.g., *"Yes, please create the ticket."*).

---

## Prerequisites
- Node.js (v18 or higher)
- A Google Gemini API Key

---

## Setup Instructions

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd deskmate
```

### 2. Backend Setup
Open a terminal and navigate to the `backend` directory:
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` directory and add your Gemini API Key:
```env
GEMINI_API_KEY=your_gemini_api_key_here
PORT=3001
```
Start the backend server:
```bash
node server.js
```
*(The server should log: `🔥 DeskMate Backend running on port 3001`)*

### 3. Frontend Setup
Open a *new* terminal and navigate to the `frontend` directory:
```bash
cd frontend
npm install
```
Start the Vite development server:
```bash
npm run dev
```
Open the provided local URL (usually `http://localhost:5173`) in your browser.

---

## Suggested Test Prompts
1. **Simple Tool Execution:** *"Check my entitlements for Slack."*
2. **Parallel Tool Execution:** *"Check my entitlements for Adobe Creative Suite, Jira, and Slack. Create tickets only for the missing software."*
3. **Out of Scope Handling:** *"Write me a poem about IT support."*
4. **Contextual Memory:** *"I need access to Adobe Creative Suite."* -> (Wait for response) -> *"Yes, sure."*