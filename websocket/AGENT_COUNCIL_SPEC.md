# AI Agent Council — System Design Spec
> Version 1.0 · February 2026 · Architecture + Frontend Blueprint

---

## 01 · Concept

### What is the Council?
Multiple specialized LLM agents receive the same user query, each analyzing it through their own lens. They internally debate, critique each other's reasoning, vote on confidence, then a **Synthesizer agent** produces one fine-tuned final answer — the best of all minds combined.

### Why Multi-Agent?
Single LLMs have blind spots, biases, and hallucination risks. The Council model:
- Catches errors through inter-agent critique
- Brings diverse reasoning strategies to a problem
- Produces answers with measurable internal confidence before responding to the user

### Core Loop
**Dispatch → Deliberate → Synthesize**

User query enters the Orchestrator → fans out to N agents in parallel → agents respond → enter a debate round where they read each other's reasoning and revise → Synthesizer reads all revised outputs and produces final answer with citations.

---

## 02 · The Five Agents

| # | Agent | Model | Role | Color |
|---|-------|-------|------|-------|
| 1 | ⚡ **Analyst** | GPT-4o | Fact Extraction | `#e84c3d` (red) |
| 2 | 🔬 **Researcher** | Claude Opus | Context + RAG | `#3d7ee8` (blue) |
| 3 | 🧠 **Reasoner** | Gemini 1.5 Pro | Logic + Causality | `#38b06f` (green) |
| 4 | ⚖️ **Critic** | Llama 3 70B | Error Detection | `#c9a84c` (gold) |
| 5 | ✦ **Synthesizer** | Claude Sonnet | Final Weaving | `#9b59b6` (purple) |

**Design tokens:**
```
--accent:  #e84c3d   (primary accent / SEND button / final answer border)
--agent-1: #e84c3d   Analyst
--agent-2: #3d7ee8   Researcher
--agent-3: #38b06f   Reasoner
--agent-4: #c9a84c   Critic
--agent-5: #9b59b6   Synthesizer
--ink:     #0a0a0f   Dark background
--paper:   #f4f1eb   Light surfaces (doc only)
--muted:   #6b6860   Body text
--gold:    #c9a84c   Accent gold
```

---

## 03 · Frontend — Three-Panel Layout

```
┌─────────────────────┬──────────────────────────────┬──────────────────┐
│  LEFT SIDEBAR       │  CENTER — COUNCIL CHAT        │  RIGHT — DEBATE  │
│  280px              │  flex-1                       │  300px           │
├─────────────────────┼──────────────────────────────┼──────────────────┤
│ ● Council · Active  │ Council Chat   [toggle]       │ Live Deliberation│
│                     │                               │                  │
│ ⚡ Analyst          │  [user bubble right-aligned]  │ [debate card a1] │
│   GPT-4o            │                               │ [debate card a2] │
│   ↳ parsing...      │  ● Agent thinking...          │ [debate card a4] │
│                     │    (italic body)              │ [debate card a3] │
│ 🔬 Researcher       │                               │                  │
│   Claude Opus       │  ✦ COUNCIL FINAL ANSWER       │ ─────────────── │
│   ↳ retrieving...   │    (red-bordered block)       │ Consensus Vote   │
│                     │                               │ [████████░] 91%  │
│ 🧠 Reasoner         │ ─────────────────────────── │ 4/5 aligned      │
│ ⚖️ Critic           │ [input]          [SEND btn]   │                  │
│ ✦ Synthesizer       │                               │                  │
│ ─────────────────  │                               │                  │
│ [phase bar]  DEBATE │                               │                  │
└─────────────────────┴──────────────────────────────┴──────────────────┘
```

### Left Sidebar
- Header: `● Council · Active` (green pulse dot, white text)
- Each agent item has a **3px left colored border** matching its agent color
- Active agent: `background: rgba(255,255,255,0.05)`, brighter border
- Agent item shows: name (white), model (dim uppercase), status italic (dimmer)
- Footer: phase indicator dots (done=green, active=gold pulsing) + `DEBATE` label

### Center — Council Chat
- Header: title left, `INTERNAL DEBATE VISIBLE` toggle right
- **Toggle** hides/shows the right deliberation panel
- Message types:
  - **User bubble** — right-aligned, `bg: rgba(255,255,255,0.08)`, border `rgba(255,255,255,0.1)`, radius `2px 2px 0 2px`
  - **Internal / thinking** — left-aligned, dim tag with colored dot + agent name, italic body with subtle border, dim text `rgba(255,255,255,0.45)`
  - **Council Final Answer** — left-aligned block, `bg: rgba(232,76,61,0.1)`, `border: rgba(232,76,61,0.3)`, header shows confidence %, readable body text
- Input bar: dark bg input + `SEND` button using `--accent` (#e84c3d) color

### Right Sidebar — Live Deliberation
- Debate cards: each has a **2px left border** in agent color
- Card shows: agent name (dim uppercase), reasoning text, `Round N · Xs` meta
- Footer: `Consensus Vote` label, split vote bar (green % + dim remainder %), `N/5 agents aligned · Proceeding`

---

## 04 · Backend Architecture — 7 Layers

### Request Flow
```
User UI  →  API Gateway  →  Orchestrator
                                  ↓
WebSocket Push  ←  Synthesizer  ←  Debate Engine
```

### L1 — Frontend Chat Interface
React/Next.js SPA, three-panel layout, WebSocket client streams events incrementally.
Tech: `React`, `WebSocket`, `Zustand`, `Tailwind`

### L2 — API Gateway + Auth
JWT auth, rate limiting, request validation. Upgrades HTTP → WebSocket for persistent session.
Tech: `FastAPI / Node`, `JWT`, `Nginx`, `Redis Rate Limit`

### L3 — Orchestrator Service
Core controller: (1) enriches prompt with context/memory, (2) fans out parallel Tasks to each Agent Worker, (3) monitors completion via Redis pub/sub, (4) triggers Debate Engine once Round 1 done, (5) triggers Synthesizer, (6) streams final answer.
Tech: `Python AsyncIO`, `Redis PubSub`, `Celery / ARQ`, `State Machine`

### L4 — Agent Worker Pool
Each agent is a containerized worker with its own system prompt. Workers pull tasks from queue, call their LLM API, return structured JSON: `{ reasoning, answer, confidence, sources }`.
Tech: `Docker`, `LLM SDKs`, `Structured Output`, `Retry Logic`

### L5 — Debate Engine
Assembles Round 1 outputs into a structured "debate context" prompt. Re-dispatches to each agent: affirm / critique / revise. Critic agent has **1.5× elevated weight**. Max 2 debate rounds.
Tech: `Prompt Templates`, `Agent Re-dispatch`, `Voting Weights`

### L6 — Memory + RAG Layer
Vector DB stores past conversations + domain knowledge. Retrieves semantically relevant context per query. Supports file/document upload for grounding.
Tech: `Pinecone / Qdrant`, `Embeddings`, `PostgreSQL`, `S3 Docs`

### L7 — Observability + Analytics
Traces every agent call, debate round, token usage, latency, cost. Tracks hallucination catch rate.
Tech: `LangSmith / Phoenix`, `Prometheus`, `Grafana`, `OpenTelemetry`

---

## 05 · Session State Machine

| State | Description | Timing |
|-------|-------------|--------|
| 📥 **RECEIVED** | Query validated, session created, RAG context fetched | ~100ms |
| 🔀 **DISPATCHED** | All agents receive enriched task simultaneously in parallel | ~200ms |
| 💬 **DELIBERATING** | Round 1 complete, debate context assembled, Round 2 in progress | ~3–8s |
| ✦ **SYNTHESIZING** | Synthesizer weaving final answer from all debate outputs | ~2–4s |
| ✅ **COMPLETE** | Final answer streamed, session logged, memory updated | ~100ms |

---

## 06 · Agent Message Contract (JSON Schema)

```json
{
  "agent_id": "analyst_gpt4o",
  "round": 1,
  "reasoning": "Based on Vanguard data, index funds outperform...",
  "answer": "Invest 90% VTI, 10% bonds...",
  "confidence": 0.87,
  "critique_of": ["researcher_claude"],
  "stance": "critique",
  "sources": ["Vanguard 2023 ETF Report"],
  "tokens_used": 842,
  "latency_ms": 2140
}
```

| Field | Type | Description |
|-------|------|-------------|
| `agent_id` | string | Unique agent identifier |
| `round` | integer | Debate round number (1 or 2) |
| `reasoning` | string | Chain-of-thought shown in debate feed |
| `answer` | string | Agent's proposed answer for this round |
| `confidence` | float 0–1 | Agent's self-assessed confidence |
| `critique_of` | string[] | IDs of agents being critiqued (Round 2 only) |
| `stance` | enum | `affirm` \| `critique` \| `revise` |
| `sources` | string[] | Referenced sources/documents |
| `tokens_used` | integer | Token count for billing/monitoring |
| `latency_ms` | integer | Time to complete this round's response |

---

## 07 · Key Design Decisions

### ⚡ Parallel Fan-Out, Not Sequential
All agents run **simultaneously in Round 1**, not one-by-one. Total latency ≈ slowest single agent rather than sum-of-all. Only the Debate round introduces sequential dependency, capped at 2 iterations.

### ⚖️ Weighted Voting, Not Majority
The Synthesizer uses **confidence-weighted aggregation**. An agent with 0.95 confidence outweighs 3 agents at 0.5. The Critic agent gets a **1.5× multiplier** on flagged errors to prevent group override of valid criticism.

### 📡 Real-Time Streaming, Not Polling
The frontend receives **server-sent events** as they happen: agent thinking, debate posts, confidence scores, and final answer tokens stream in. Users see the council working — not a spinner. Dramatically improves perceived speed and trust.

---

## 08 · WebSocket Event Types (Frontend)

| Event | Payload | Renders as |
|-------|---------|------------|
| `agent:thinking` | `{ agentId, round, reasoning }` | Internal message bubble (italic, dim) |
| `agent:debate` | `{ agentId, stance, critique }` | Debate card in right panel |
| `council:confidence` | `{ score, agentsAligned }` | Consensus vote bar update |
| `council:answer` | `{ text, confidence, contributingAgents }` | Final answer block (red border) |
| `session:state` | `{ state }` | Phase indicator dots in sidebar |
