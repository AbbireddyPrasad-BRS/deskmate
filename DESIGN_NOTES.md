# DESIGN_NOTES.md

# DeskMate — Key Design Decisions & Trade-offs

This document captures the load-bearing engineering decisions made while building DeskMate and the reasoning behind them.

---

# 1. Why a Custom Agent Loop?

Instead of using orchestration frameworks like LangChain, I implemented a custom agent loop using Gemini Function Calling.

### Why

* Keeps reasoning flow explicit and interview-defensible
* Easier to trace/debug tool execution
* Avoids unnecessary abstraction for a POC
* Makes orchestration logic fully transparent

The loop:

1. sends user intent to Gemini
2. intercepts tool calls
3. executes backend functions
4. feeds results back to Gemini
5. synthesizes the final response

This directly demonstrates AI-agent workflow reasoning.

---

# 2. Why an In-Memory Mock Database?

I intentionally used an in-memory singleton database (`db.js`) instead of MongoDB.

### Why

The assignment emphasized:

* clean runnable setup
* avoiding overengineering
* POC-focused engineering judgment

Using a real database would introduce:

* connection setup
* migrations
* infrastructure dependencies
* reviewer friction

The in-memory approach keeps the project:

* lightweight
* fast to run
* easy to review
* architecture-focused

---

# 3. Why Observability Was Treated as First-Class

The assignment explicitly required observable execution.

To satisfy this, I implemented:

* execution traces
* tool invocation logs
* timestamps
* intermediate reasoning visibility

### Why

LLM systems are difficult to debug because reasoning is probabilistic.

Explicit tracing improves:

* transparency
* trust
* debuggability
* reviewer visibility

This became one of the core architectural priorities.

---

# 4. Why Adobe Creative Suite Was Intentionally Missing

The default mock employee is intentionally NOT entitled to Adobe Creative Suite.

### Why

This forces the agent into a conditional workflow:

* check entitlement
* detect missing access
* create support ticket

This demonstrates:

* reasoning
* multi-step orchestration
* conditional AI behavior

instead of simple static responses.

---

# 5. Why Gemini Was Chosen

Google Gemini was selected because:

* reliable function calling
* fast inference
* strong instruction following
* stable conversational behavior
* easy deployment

### Trade-off

Local/open-source models were considered, but reliability and time constraints made Gemini a safer choice for the assessment.

The architecture remains model-agnostic.

---

# 6. Why Conversational Memory Matters

The frontend sends prior chat history to the backend so the agent can support follow-up interactions.

Example:

* “I need Adobe access.”
* “Yes, go ahead and create the ticket.”

### Why

Enterprise helpdesk interactions are naturally conversational.

Without memory:

* workflows feel robotic
* confirmations break
* multi-turn orchestration fails

---

# 7. Why Parallel Tool Execution Was Added

The initial architecture handled tools sequentially.

This failed for requests involving multiple entitlement checks simultaneously.

The orchestration layer was upgraded to support:

* concurrent function execution
* aggregated results
* single-turn reasoning synthesis

### Why

This better reflects real enterprise workflow orchestration patterns.

---

# 8. Why the Backend Remains Thin

The Express backend intentionally acts as:

* orchestration layer
* tool executor
* trace manager

instead of containing business-heavy logic.

### Why

This separation:

* simplifies debugging
* improves modularity
* makes the AI workflow easier to reason about
* aligns with scalable service-oriented patterns

---

# 9. Biggest Production Risks

The major risks in production AI-agent systems are:

* hallucinated actions
* unauthorized tool execution
* prompt injection
* excessive autonomy
* auditability gaps
* latency under scale

### Important Principle

The LLM should NEVER be trusted for authorization decisions.

Tool-level permissions must always be enforced by backend systems.

---

# 10. Overall Engineering Philosophy

DeskMate was intentionally designed as:

* an AI-agent engineering exercise
* not merely a chatbot demo

The focus was:

* reasoning workflows
* tool orchestration
* observability
* explainability
* graceful failure handling

while deliberately avoiding unnecessary infrastructure complexity.
