# DeskMate — Architecture & Design Notes

## 1. System Overview

DeskMate is an AI-powered IT helpdesk assistant designed as a production-inspired Proof of Concept (POC) for the Black Box Network Services AI Engineer Intern assessment.

The primary engineering goals of the system are:

* AI agent workflow orchestration
* tool-based reasoning
* conditional decision making
* observability and execution tracing
* graceful failure handling
* modular architecture without overengineering

The system intentionally prioritizes explainability, reliability, and interview-defensible engineering decisions over unnecessary infrastructure complexity.

---

# 2. High-Level Architecture

```text
React Frontend (Vite)
        ↓
Express API Layer
        ↓
Agent Orchestrator (Gemini Function Calling)
        ↓
Tool Execution Layer
        ↓
Mock Enterprise IT Systems
```

---

## Frontend (React + Vite)

The frontend provides:

* a conversational chat interface
* real-time execution trace visualization
* conversational memory persistence
* dynamic observability toggling

### Key Responsibilities

* Maintain chat history
* Send conversational context to backend
* Render natural-language responses
* Display execution traces for reviewer visibility

### Design Choice

A split-screen UI was intentionally chosen to satisfy the assignment’s “observable execution” requirement while preserving a clean end-user experience.

The trace panel can be toggled on/off to simulate:

* reviewer/debug mode
* standard employee mode

---

## Backend (Node.js + Express)

The backend acts as:

* a lightweight orchestration API
* the bridge between the frontend and the AI agent loop

### Responsibilities

* receive user requests
* initialize the agent workflow
* execute tools
* manage execution traces
* return structured responses

### Design Philosophy

The backend intentionally remains thin and stateless to:

* simplify deployment
* improve explainability
* reduce operational complexity
* align with the POC scope

---

## Agent Service (`agentService.js`)

The Agent Service is the core reasoning engine of DeskMate.

It implements a dynamic agent loop powered by Google Gemini Function Calling.

### Responsibilities

* interpret user intent
* determine required tools
* execute sequential or parallel tool workflows
* feed tool outputs back into the LLM
* synthesize final natural-language responses

---

# 3. Agent Workflow Design

Unlike a traditional chatbot architecture, DeskMate uses a tool-oriented reasoning workflow.

The interaction lifecycle is:

```text
User Query
    ↓
Gemini analyzes intent
    ↓
Gemini requests tool calls
    ↓
Backend executes tools
    ↓
Results returned to Gemini
    ↓
Gemini reasons over results
    ↓
Final response generated
```

---

## Sequential + Parallel Tool Execution

The agent supports:

* sequential workflows
* conditional branching
* parallel tool orchestration

### Example

User:

> “Check Adobe, Jira, and Slack access. Create tickets only for missing software.”

Workflow:

1. Execute entitlement checks concurrently
2. Aggregate results
3. Identify missing software
4. Create tickets only where necessary
5. Generate final response

### Why This Matters

This demonstrates:

* enterprise workflow thinking
* scalable orchestration patterns
* AI-agent reasoning beyond simple chat completion

---

# 4. Observability Strategy

Observability was treated as a first-class architectural requirement.

A dedicated `traces` array captures:

* timestamps
* tool names
* tool arguments
* tool results
* reasoning milestones
* final synthesis events

### Why This Matters

LLM systems are inherently probabilistic and difficult to debug.

Explicit tracing:

* improves trust
* simplifies debugging
* makes agent decisions explainable
* allows reviewers to inspect reasoning paths

This directly satisfies the assignment requirement:

> “We should be able to trace any request end-to-end and understand what the system did and why.”

---

# 5. Mock Enterprise Systems

The project simulates realistic internal IT systems using an in-memory singleton database.

### Systems Simulated

* employee entitlement management
* ticketing workflows
* password reset operations
* software access checks

### Design Choice

Adobe Creative Suite entitlement is intentionally absent from the default user profile.

This forces the AI agent into a conditional workflow:

* check entitlement
* detect missing access
* create support ticket

This was deliberately engineered to demonstrate reasoning capability during evaluation.

---

# 6. Key Engineering Decisions & Trade-offs

---

## In-Memory Database vs MongoDB

### Decision

Used an in-memory singleton mock database instead of MongoDB.

### Trade-off

Application state resets when the server restarts.

### Why

For a POC, reducing reviewer setup friction was more important than persistence durability.

Avoiding:

* Docker setup
* connection strings
* migrations
* cloud provisioning

keeps the project:

* cloneable
* runnable immediately
* aligned with the assignment’s “avoid overengineering” constraint.

---

## Custom Agent Loop vs External Frameworks

### Decision

Implemented a custom orchestration loop instead of using LangChain or similar frameworks.

### Why

This keeps:

* execution logic explicit
* reasoning transparent
* debugging easier
* interview explanations simpler

The evaluator can clearly inspect:

* how tool routing works
* how reasoning loops are controlled
* how failures are handled

---

## Gemini API vs Local Models

### Decision

Used Google Gemini Function Calling.

### Why

Gemini provided:

* reliable tool calling
* fast inference
* stable reasoning
* better instruction following
* easier deployment

This reduced development risk within the 24-hour assessment window.

The architecture remains model-agnostic and can support local models in the future.

---

## Custom CSS vs UI Frameworks

### Decision

Used lightweight custom CSS instead of heavy component libraries.

### Why

This reduced:

* dependency complexity
* bundle size
* unnecessary abstraction

while still delivering:

* polished UI
* responsive layout
* premium enterprise feel

---

# 7. Conversational Memory Strategy

The frontend maintains conversational history and sends it with each request.

The backend maps this history into Gemini’s expected conversational format using:

* `role`
* `parts`

This enables:

* contextual follow-up questions
* confirmation workflows
* stateful interaction patterns

### Example

User:

> “I need Adobe access.”

Assistant:

> “You are not entitled. Would you like me to create a ticket?”

User:

> “Yes, sure.”

The agent correctly infers the referenced software from prior context without repeating entitlement checks unnecessarily.

---

# 8. Failure Handling Strategy

The system gracefully handles:

* out-of-scope requests
* malformed inputs
* missing records
* tool execution failures
* unavailable systems

### Example Behaviors

| Scenario          | System Response       |
| ----------------- | --------------------- |
| Unknown ticket ID | Informative fallback  |
| Non-IT request    | Graceful refusal      |
| Tool failure      | Controlled recovery   |
| Missing data      | Clarification request |

---

# 9. Production Scaling Strategy (Azure)

This POC was intentionally designed so the architecture could evolve cleanly into a production system.

---

## Compute — Azure Container Apps

### Why

Container Apps provide:

* serverless scaling
* rapid horizontal elasticity
* lower operational overhead

This is ideal for bursty helpdesk workloads.

---

## Database — Azure Cosmos DB

### Why

Cosmos DB aligns naturally with:

* JSON-oriented tool outputs
* entitlement documents
* ticket records
* conversational metadata

It also provides:

* low latency
* global scalability
* flexible schema evolution

---

## Session Memory — Azure Cache for Redis

### Why

Currently, chat history is passed directly from the frontend.

At scale:

* payload sizes become inefficient
* context windows grow expensive

Redis enables:

* centralized session memory
* stateless backend scaling
* reduced payload overhead

---

## Identity & Security — Microsoft Entra ID

### Why

The POC uses a mock employee ID.

Production systems must integrate:

* OAuth2
* OpenID Connect
* enterprise RBAC

The backend — not the LLM — must enforce authorization boundaries.

### Critical Security Principle

The LLM should NEVER be trusted for access control decisions.

Tool-level authorization must validate:

* JWT identity
* role permissions
* tenant isolation
* entitlement scopes

before executing any sensitive operation.

---

# 10. Production Risks & Concerns

The primary risks in production AI-agent systems are:

* hallucinated actions
* prompt injection
* unauthorized tool execution
* excessive autonomous behavior
* auditability gaps
* cost escalation
* latency under concurrent workloads

### Mitigation Strategies

* strict tool schemas
* backend authorization enforcement
* execution logging
* bounded tool permissions
* human approval layers for critical operations

---

# 11. Example End-to-End Workflow

## User Request

> “Check Adobe, Jira, and Slack access. Create tickets for missing software.”

---

## Internal Agent Flow

```text
[INFO] Intent detected
[INFO] Running parallel entitlement checks
[INFO] Adobe entitlement: false
[INFO] Jira entitlement: false
[INFO] Slack entitlement: true
[INFO] Creating ticket for Adobe
[INFO] Creating ticket for Jira
[INFO] Ticket creation successful
[INFO] Generating final response
```

---

## Final User Response

> You already have Slack access.
> I created support tickets for Adobe Creative Suite and Jira.
> Ticket IDs: INC-4832, INC-9102.

---

# 12. Final Notes

DeskMate was intentionally designed as:

* a focused AI-agent engineering exercise
* not a generic chatbot demo

The system prioritizes:

* orchestration clarity
* reasoning transparency
* explainable workflows
* production-inspired architecture
* interview-defensible engineering decisions

over unnecessary technical complexity.

