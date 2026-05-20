# DeskMate - Architecture & Design Notes

## 1. High-Level Architecture
DeskMate utilizes a clean Client-Server architecture designed to emphasize **Separation of Concerns** and **Agentic Workflow Evaluation**.

- **Frontend (React + Vite):** A split-screen UI featuring a natural language chat interface and an optional execution trace panel. It maintains conversational history and sends context to the backend.
- **Backend (Node.js + Express):** A stateless API layer that handles requests and initializes the Agent Service.
- **Agent Service (`agentService.js`):** The "Brain" of the application. It maps internal IT system capabilities to LLM tools, handles the while-loop for sequential/parallel tool execution, and synthesizes final text responses.
- **Mock Internal Systems (`db.js`):** An in-memory singleton class simulating enterprise databases (Users, Entitlements, Tickets).

---

## 2. The Agent Workflow (Tool Orchestration)
Instead of relying on a standard chat completion prompt, DeskMate utilizes **Function Calling**. 

1. **Intent Detection:** The user prompt and history are sent to Gemini.
2. **Tool Routing:** If the LLM determines a tool is needed (e.g., `check_entitlement`), it halts text generation and returns a JSON payload of the requested tool and parameters.
3. **Execution & Feedback Loop:** The Agent Service intercepts this, executes the real backend function (`db.js`), and feeds the result *back* to the LLM. 
4. **Conditional Looping:** The LLM evaluates the result. If a conditional logic threshold is met (e.g., *User is NOT entitled, and requested a ticket*), the LLM generates a *second* tool call (`create_ticket`) before ever replying to the user.

---

## 3. Design Decisions & Trade-offs

- **In-Memory Mock Database vs. Real Database (MongoDB)**
  - *Decision:* Used an in-memory JS class (`mocks/db.js`).
  - *Trade-off:* State resets on server restart. 
  - *Why:* Optimized for POC review speed. A real DB requires the reviewer to configure connection strings, run migrations, or spin up Docker containers. This violates the "clean, runnable without overengineering" constraint.

- **Custom CSS vs. Component Libraries**
  - *Decision:* Wrote standard, high-quality CSS with variables.
  - *Why:* Keeps the project dependency tree incredibly lightweight while delivering a premium, enterprise-feeling UI.

- **Observability Strategy**
  - *Decision:* Implemented a `traces` array populated inside the agent loop and passed back to the UI.
  - *Why:* AI models are inherently "black boxes." By explicitly tracing tool names, arguments, and return values, we build trust with the end user (or the interviewer) by proving *why* the AI made a decision.

---

## 4. Production Design Note for Azure Scaling
To transition this POC into a highly available, enterprise-scale application on Microsoft Azure, the following architecture is recommended:

### Compute: Azure Container Apps
- **Why:** Serverless container orchestration. Chat loads can be highly bursty (e.g., 9:00 AM password resets). Container Apps scale to zero to save costs and scale up rapidly to handle concurrent Agent Loops without managing underlying AKS infrastructure.

### Database: Azure Cosmos DB
- **Why:** Transitioning the JSON mock database to Cosmos DB (NoSQL API) allows for millisecond latency on entitlement lookups globally. It perfectly aligns with the JSON schema data we are passing back and forth to the LLM.

### State Management: Azure Cache for Redis
- **Why:** Currently, the React frontend passes the entire chat history back to the server. In production, this increases payload sizes heavily. We would offload session memory to Azure Cache for Redis, allowing the backend to remain entirely stateless while keeping context secure on the server side.

### Security & Access (Load-Bearing): Microsoft Entra ID (Azure AD)
- **Why:** In this POC, `EMP-001` is hardcoded. In production, DeskMate must be integrated with Entra ID via OAuth2/OIDC. 
- **Tool-Level RBAC:** The Agent Service must extract the user's JWT token and validate it before executing a tool. The LLM cannot be trusted to verify identity. If User A asks to check User B's entitlements, the backend tool must enforce Entra ID security scopes to reject the action.

---

## 5. Sample Conversation Transcript
**User:** Check my entitlements for Adobe Creative Suite, Jira, and Slack. Create tickets only for the missing software.

**DeskMate (Internal Trace):**
`[INFO] Received user intent.`
`[INFO] Evaluating required tools vs natural language response...`
`[INFO] Invoking tool: check_entitlement with args: {"software":"Adobe Creative Suite","userId":"EMP-001"}`
`[INFO] Tool result: Entitlement is false`
`[INFO] Invoking tool: check_entitlement with args: {"software":"Jira","userId":"EMP-001"}`
`[INFO] Tool result: Entitlement is false`
`[INFO] Invoking tool: check_entitlement with args: {"software":"Slack","userId":"EMP-001"}`
`[INFO] Tool result: Entitlement is true`
`[INFO] Invoking tool: create_ticket with args: {"issue":"Requesting access to Adobe Creative Suite","userId":"EMP-001","priority":"medium"}`
`[INFO] Tool result: Ticket created successfully (INC-4832)`
`[INFO] Invoking tool: create_ticket with args: {"issue":"Requesting access to Jira","userId":"EMP-001","priority":"medium"}`
`[INFO] Tool result: Ticket created successfully (INC-9102)`
`[INFO] Generated final natural language response.`

**DeskMate (User Facing):**
I have checked your entitlements. You are already authorized for Slack. You are not entitled to Adobe Creative Suite or Jira, so I have created support tickets for you. Your ticket for Adobe Creative Suite is INC-4832, and your ticket for Jira is INC-9102.