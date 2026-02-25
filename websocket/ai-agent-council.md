# AI Agent Council — System Design Document

> **Multi-LLM deliberation architecture** — internal debate, consensus synthesis, fine-tuned final answer delivery.

**Version:** 1.0  
**Date:** February 2026  
**Type:** Architecture + Frontend Blueprint

---

## Table of Contents

1. [Concept Overview](#1-concept-overview)
2. [Core Loop](#2-core-loop)
3. [Agent Roles](#3-agent-roles)
4. [Frontend Design](#4-frontend-design)
5. [Backend Architecture](#5-backend-architecture)
6. [Session State Machine](#6-session-state-machine)
7. [Agent Message Contract](#7-agent-message-contract)
8. [System Layers](#8-system-layers)
9. [Key Design Decisions](#9-key-design-decisions)
10. [Tech Stack Summary](#10-tech-stack-summary)

---

## 1. Concept Overview

The **AI Agent Council** is a multi-LLM orchestration system where multiple specialized AI agents receive the same user query, analyze it through their own lens, debate each other's reasoning internally, and collectively produce one fine-tuned final answer — the best of all minds combined.

### Why Multi-Agent?

Single LLMs have inherent limitations:

- **Blind spots** in domain knowledge
- **Hallucination risk** without internal validation
- **Single reasoning strategy** applied to all problem types
- **No self-correction** mechanism

The Council model solves this by introducing inter-agent critique, diverse reasoning strategies, and a measurable confidence score before any answer reaches the user.

### Core Principle

> *The Council never delivers an answer until agents have challenged each other. Disagreement is a feature, not a bug.*

---

## 2. Core Loop

```
User Query
    │
    ▼
┌─────────────────────────────────────────────────┐
│                  ORCHESTRATOR                   │
│  Enrich query with RAG context + user memory    │
└──────────────────┬──────────────────────────────┘
                   │ Fan-out (parallel)
       ┌───────────┼───────────┬───────────┬───────────┐
       ▼           ▼           ▼           ▼           ▼
   Analyst     Researcher   Reasoner    Critic    (Reserved)
  [Round 1]   [Round 1]   [Round 1]  [Round 1]
       │           │           │           │
       └───────────┴───────────┴───────────┘
                   │ All Round 1 complete
                   ▼
         ┌─────────────────┐
         │  DEBATE ENGINE  │
         │  Agents read    │
         │  each other +   │
         │  critique/affirm│
         └────────┬────────┘
                  │ Round 2 dispatched
                  ▼
         ┌─────────────────┐
         │   SYNTHESIZER   │
         │  Weighted merge │
         │  Confidence score│
         └────────┬────────┘
                  │
                  ▼
        Final Answer → User
        (streamed via WebSocket)
```

**Total typical latency: 6–14 seconds** depending on agent count and debate rounds.

---

## 3. Agent Roles

Each agent is a containerized worker with a fixed system prompt defining its personality, role, and reasoning style.

| Agent | Icon | Assigned LLM | Primary Role | Debate Weight |
|-------|------|-------------|-------------|--------------|
| **Analyst** | ⚡ | GPT-4o | Fact extraction, data interpretation | 1.0× |
| **Researcher** | 🔬 | Claude Opus | Context retrieval, source grounding, RAG | 1.0× |
| **Reasoner** | 🧠 | Gemini 1.5 Pro | Logic validation, causal reasoning | 1.0× |
| **Critic** | ⚖️ | Llama 3 70B | Error detection, assumption challenging | **1.5×** |
| **Synthesizer** | ✦ | Claude Sonnet | Final answer weaving, confidence scoring | — |

### Agent System Prompt Structure

Each agent receives a system prompt in this format:

```
You are the [ROLE] agent in an AI Council.

Your specialty: [DOMAIN FOCUS]
Your reasoning style: [STYLE DESCRIPTION]

In Round 1: Respond with your independent analysis.
In Round 2: Read all peer responses. Affirm, critique, or revise.
Always return structured JSON: { reasoning, answer, confidence, stance, sources }
```

### Synthesizer Special Role

The Synthesizer does **not** participate in Round 1 or debate. It only activates after all debate rounds complete. It receives:

- All agents' Round 1 and Round 2 outputs
- Each agent's confidence score
- Critic's flags and identified errors
- Session memory and user context

It produces the final answer with a **weighted merge**, giving more weight to high-confidence agents and ensuring Critic-flagged errors are addressed.

---

## 4. Frontend Design

### Layout: Three-Panel Interface

```
┌──────────────────────────────────────────────────────────────────────┐
│ HEADER: Council · Session Active                    [Mode Toggle]    │
├────────────────┬────────────────────────────┬────────────────────────┤
│                │                            │                        │
│  AGENT ROSTER  │      CONVERSATION          │   LIVE DELIBERATION   │
│                │                            │                        │
│ ● Analyst      │  User: What's the best     │ ⚡ Analyst            │
│   GPT-4o       │  investment strategy for   │ "Index funds dominate │
│   thinking...  │  a 30-year-old with $10k?  │ risk-adjusted returns"│
│                │                            │ Round 1 · 2.1s        │
│ ● Researcher   │  [Internal] ⚡ Analyst:    │                        │
│   Claude Opus  │  "Recommending ETF split"  │ 🔬 Researcher         │
│   retrieving.. │                            │ "90/10 equity/bond    │
│                │  [Internal] ⚖️ Critic:     │ optimal. Add intl."   │
│ ● Reasoner     │  "Emergency fund missing!" │ Round 1 · 3.4s        │
│   Gemini 1.5   │                            │                        │
│   validating.. │  ✦ Council Final Answer    │ ⚖️ Critic             │
│                │  Confidence: 91%           │ "Both ignored emerg.  │
│ ⚖️ Critic      │  ─────────────────────     │ fund prereq. Error."  │
│   Llama 3 70B  │  "First ensure 3-month     │ Round 2 · 1.8s        │
│   awaiting...  │  emergency fund (~$3k).    │                        │
│                │  Invest remaining $7k in   │ CONSENSUS VOTE        │
│ ✦ Synthesizer  │  70% VTI/VXUS, 20%         │ ████████████░ 91%     │
│   standby      │  bonds, 10% growth..."     │ 4/5 agents aligned    │
│                │                            │                        │
│ Phase: ●●●○○   │  [Type your question...]   │                        │
│ DEBATE         │                   [Send]   │                        │
└────────────────┴────────────────────────────┴────────────────────────┘
```

### Panel 1 — Agent Roster (Left)

- **Agent cards** with color-coded left border per agent
- **Live status** indicator: thinking / retrieving / debating / standby
- **Current action** text shown beneath each agent name
- **Phase progress bar** at bottom: Received → Dispatched → Deliberating → Synthesizing → Complete

### Panel 2 — Conversation (Center)

Two display modes toggled by user:

**Mode A — Final Only** (default): Only shows the final Council answer with confidence score. Clean, minimal.

**Mode B — Show Deliberation**: Renders internal agent thoughts inline as collapsed/expandable cards, so user can see the reasoning chain that led to the final answer.

### Panel 3 — Live Debate Feed (Right)

- Real-time stream of agent debate cards as they arrive
- Each card color-coded by agent, shows round number and latency
- **Consensus vote bar** at bottom updates dynamically
- Automatically collapses when Synthesizer begins (final answer mode)

### UX States

| State | User Sees |
|-------|-----------|
| Query sent | Agent roster animates to "thinking", phase bar starts |
| Round 1 arriving | Debate cards appear one by one in right panel |
| Debate Round 2 | Cards update with "critiques" badge |
| Synthesizing | Right panel collapses, center shows streaming answer tokens |
| Complete | Full answer rendered, confidence badge shown, debate log archived |

---

## 5. Backend Architecture

### High-Level Architecture

```
                          ┌──────────┐
                          │  Client  │
                          │ (Browser)│
                          └────┬─────┘
                               │ WebSocket / SSE
                          ┌────▼─────┐
                          │   API    │
                          │ Gateway  │
                          │ (Auth +  │
                          │  Rate    │
                          │ Limiting)│
                          └────┬─────┘
                               │
                          ┌────▼──────────┐
                          │ Orchestrator  │◄──── Redis PubSub
                          │   Service     │
                          └──┬────────────┘
              ┌──────────────┼──────────────┬──────────────┐
              ▼              ▼              ▼              ▼
        ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐
        │  Agent    │ │  Agent    │ │  Agent    │ │  Agent    │
        │ Worker 1  │ │ Worker 2  │ │ Worker 3  │ │ Worker 4  │
        │ (Analyst) │ │(Researcher│ │(Reasoner) │ │ (Critic)  │
        └─────┬─────┘ └─────┬─────┘ └─────┬─────┘ └─────┬─────┘
              └──────────────┴──────────────┴─────────────┘
                                    │ All Round 1 done
                               ┌────▼──────┐
                               │  Debate   │
                               │  Engine   │
                               └────┬──────┘
                                    │
                               ┌────▼──────────┐
                               │  Synthesizer  │
                               │    Agent      │
                               └────┬──────────┘
                                    │
                          ┌─────────▼──────────┐
                          │   Memory + RAG      │
                          │   (Pinecone /       │
                          │    PostgreSQL)      │
                          └────────────────────┘
```

### Component Responsibilities

**API Gateway**
- JWT authentication and session creation
- Rate limiting per user (Redis token bucket)
- HTTP → WebSocket upgrade for persistent streaming
- Routes to Orchestrator via internal message bus

**Orchestrator Service**
- Manages the full session lifecycle as a finite state machine
- On query arrival: enriches with RAG context, creates Task objects
- Fans out parallel tasks to all Agent Workers simultaneously
- Monitors completion via Redis pub/sub channels
- Triggers Debate Engine when all Round 1 results arrive
- Triggers Synthesizer after debate completes
- Streams events back to frontend in real-time

**Agent Worker Pool**
- Each agent: Docker container with fixed system prompt and LLM API assignment
- Pulls tasks from work queue (Redis/Celery/ARQ)
- Calls assigned LLM API (OpenAI, Anthropic, Google Vertex, Groq, etc.)
- Returns structured JSON response
- Includes retry logic with exponential backoff on API errors
- Horizontally scalable — spin up more workers under load

**Debate Engine**
- Assembles all Round 1 outputs into a structured "debate context"
- Re-dispatches to each agent with peer responses attached
- Agent instruction: read all peers' reasoning → affirm, critique, or revise
- Critic agent receives elevated weight on all flagged errors
- Maximum 2 debate rounds to control total latency

**Synthesizer Agent**
- Receives all agents' Round 1 + Round 2 outputs
- Applies confidence-weighted aggregation (not simple majority)
- Ensures Critic-flagged errors are addressed in final answer
- Produces final answer + confidence score + attribution notes
- Streams response tokens to Orchestrator → WebSocket → Frontend

**Memory + RAG Layer**
- Vector DB (Pinecone/Qdrant) stores past conversation embeddings
- On each query: retrieves semantically relevant past context
- User-level memory lets the Council "know" the user over time
- Supports document/file upload for grounded responses

**Observability Layer**
- Full distributed tracing on every agent call
- Tracks: token usage, cost per query, latency per agent
- Measures: hallucination catch rate by Critic, confidence calibration
- Dashboard: which agents contribute most per domain type

---

## 6. Session State Machine

```
RECEIVED ──► DISPATCHED ──► DELIBERATING ──► SYNTHESIZING ──► COMPLETE
   │               │               │                │              │
 ~100ms          ~200ms          ~3-8s            ~2-4s          ~100ms
   │               │               │                │              │
 Validate      Fan-out to      Round 1 done     Synthesizer    Stream final
 + RAG fetch   all agents      Debate R2        weaving        answer + log
               parallel        in progress      answer         session
```

### State Transition Events

| From | To | Trigger |
|------|----|---------|
| `RECEIVED` | `DISPATCHED` | RAG fetch complete, all Task objects created |
| `DISPATCHED` | `DELIBERATING` | All N agents return Round 1 response |
| `DELIBERATING` | `DELIBERATING` | Round 2 dispatched, awaiting completion |
| `DELIBERATING` | `SYNTHESIZING` | Debate rounds complete (max 2) |
| `SYNTHESIZING` | `COMPLETE` | Synthesizer returns full answer |
| Any | `FAILED` | Agent timeout (>30s) or critical error |

### Timeout Handling

- Individual agent timeout: **15 seconds** → agent marked as `TIMED_OUT`, excluded from synthesis
- If Critic agent times out: synthesis proceeds with a warning flag
- If >50% of agents time out: query returns graceful degradation response
- All timeouts are logged and trigger alerting

---

## 7. Agent Message Contract

Every agent returns a structured JSON object for every round. This is the core data contract that the Debate Engine and Synthesizer operate on.

```json
{
  "agent_id": "analyst_gpt4o",
  "session_id": "sess_abc123",
  "round": 1,
  "reasoning": "Based on Vanguard 2023 research, index funds consistently outperform actively managed funds over 10+ year horizons. For a 30-year-old with a 30+ year time horizon...",
  "answer": "Invest 90% in broad market ETFs (VTI + VXUS split), 10% bonds for stability. Low-cost passive approach maximizes long-term returns.",
  "confidence": 0.87,
  "stance": "initial",
  "critique_of": [],
  "revised_answer": null,
  "sources": ["Vanguard 2023 ETF Performance Report", "Bogle on Passive Investing"],
  "tokens_used": 842,
  "latency_ms": 2140,
  "timestamp": "2026-02-24T10:32:15Z"
}
```

### Round 2 Extension Fields

In Round 2, agents add:

```json
{
  "round": 2,
  "stance": "critique",
  "critique_of": ["researcher_claude"],
  "critique_text": "Researcher's answer ignores emergency fund prerequisite. Investing $10k without liquid runway is financially irresponsible for most users.",
  "revised_answer": "Before any investment, establish 3-month emergency fund (~$3k). Then invest remaining $7k per Round 1 strategy.",
  "confidence": 0.91
}
```

### Stance Values

| Stance | Meaning |
|--------|---------|
| `initial` | Round 1 response, no peers seen yet |
| `affirm` | Agrees with at least one peer, no revision needed |
| `critique` | Challenges a specific peer's reasoning |
| `revise` | Updates own Round 1 answer based on peer input |
| `abstain` | Agent lacks sufficient confidence to take a position |

---

## 8. System Layers

### Layer 1 — Frontend (Client)

**Purpose:** Chat interface with live deliberation visibility.

**Tech:** React + Next.js, Zustand state management, WebSocket client, Tailwind CSS

**Key components:**
- `CouncilChat` — main conversation thread with streaming token renderer
- `AgentRoster` — left panel with live agent status
- `DebateFeed` — right panel real-time debate card stream
- `ConsensusBar` — animated voting/confidence visualizer
- `ModeToggle` — switch between Final Only / Show Deliberation views

---

### Layer 2 — API Gateway

**Purpose:** Single entry point for all client requests.

**Tech:** Nginx + FastAPI (Python) or Node.js/Express

**Responsibilities:**
- JWT/OAuth authentication
- Per-user rate limiting via Redis token bucket
- WebSocket upgrade and session binding
- Request validation and sanitization
- Routes to Orchestrator microservice

---

### Layer 3 — Orchestrator Service

**Purpose:** Core lifecycle controller for every Council session.

**Tech:** Python AsyncIO, Redis PubSub, Celery or ARQ task queue

**Responsibilities:**
- Session state machine management
- Prompt enrichment with RAG context and user memory
- Parallel task dispatch to Agent Worker Pool
- Monitoring round completion via pub/sub
- Debate Engine and Synthesizer trigger coordination
- Real-time event emission back to frontend via WebSocket

---

### Layer 4 — Agent Worker Pool

**Purpose:** Execute LLM calls per agent per round.

**Tech:** Docker containers, Python async LLM SDKs (OpenAI, Anthropic, Google Vertex, Groq)

**Responsibilities:**
- Pull tasks from work queue
- Call assigned LLM with structured prompt
- Return structured JSON response
- Handle retries with exponential backoff
- Report token usage and latency metadata

**Scaling:** Workers are stateless and horizontally scalable. Auto-scale based on queue depth.

---

### Layer 5 — Debate Engine

**Purpose:** Orchestrate the inter-agent critique rounds.

**Tech:** Python service, prompt templating, Jinja2

**Responsibilities:**
- Assemble all Round 1 outputs into a debate context prompt
- Inject peer responses into each agent's Round 2 prompt
- Apply elevated Critic weight on error-flagged content
- Manage maximum 2-round cap
- Detect early consensus (all agents affirm → skip Round 2)

**Early Consensus Optimization:** If all agents return `stance: affirm` in Round 2, debate is declared complete without waiting for the full round — saving 2–4 seconds.

---

### Layer 6 — Memory + RAG Layer

**Purpose:** Give the Council long-term memory and domain knowledge.

**Tech:** Pinecone or Qdrant (vector store), PostgreSQL (structured user data), OpenAI/Cohere embeddings, S3 (document storage)

**Responsibilities:**
- Embed and store all past conversations per user
- Retrieve semantically relevant context on each new query
- Maintain user preference profiles (domain expertise, communication style)
- Support document/file upload for grounded Q&A
- Inject retrieved context into agent prompts before Round 1

---

### Layer 7 — Observability + Analytics

**Purpose:** Monitor system health, cost, and quality over time.

**Tech:** LangSmith or Arize Phoenix (LLM tracing), Prometheus + Grafana (metrics), OpenTelemetry (distributed tracing)

**Tracked metrics:**
- Token usage and cost per agent per query
- Latency per agent, per round, end-to-end
- Hallucination catch rate (how often Critic flags errors that change final answer)
- Confidence calibration accuracy over time
- Agent contribution distribution by domain type
- Query volume, error rates, timeout frequency

---

## 9. Key Design Decisions

### Decision 1 — Parallel Fan-Out, Not Sequential

All agents run **simultaneously in Round 1**, not one after another. This means:

- Total Round 1 latency ≈ **slowest single agent** (not sum of all)
- With 4 agents averaging 3s each, parallel = 3s, sequential = 12s
- Only the debate round introduces sequential dependency (by design)

### Decision 2 — Weighted Voting, Not Majority

The Synthesizer uses **confidence-weighted aggregation**:

```
final_weight(agent) = agent.confidence × agent.role_weight

Example:
  Analyst:    0.87 × 1.0 = 0.87
  Researcher: 0.91 × 1.0 = 0.91
  Reasoner:   0.75 × 1.0 = 0.75
  Critic:     0.95 × 1.5 = 1.43  ← Critic gets 1.5× on flagged items
```

A single high-confidence agent outweighs several uncertain ones. This prevents lowest-common-denominator averaging.

### Decision 3 — Real-Time Streaming, Not Wait-Then-Display

The frontend receives **server-sent events** as they happen:

- Agent status changes stream instantly
- Debate cards appear as each agent returns
- Final answer tokens stream word-by-word
- Users see the Council working — not a spinner

This dramatically improves perceived speed and builds trust in the reasoning process.

### Decision 4 — Maximum 2 Debate Rounds

Debate is capped at 2 rounds to balance quality vs. latency:

- Round 1: Independent responses (~3–5s)
- Round 2: Critique and revision (~3–5s)
- Round 3+: Diminishing returns, exponential cost growth

In practice, most queries resolve in Round 2. Critical errors caught by Critic are incorporated by Synthesizer regardless.

### Decision 5 — Critic Agent Gets 1.5× Weight

The Critic's job is to find what everyone else missed. If the group overrules a valid critique by sheer majority, the system fails its core purpose. The elevated weight ensures Critic-flagged errors are taken seriously in synthesis.

---

## 10. Tech Stack Summary

| Layer | Technology Options |
|-------|-------------------|
| **Frontend** | React, Next.js, Tailwind CSS, Zustand |
| **API Gateway** | FastAPI (Python) or Express (Node.js) + Nginx |
| **Orchestrator** | Python AsyncIO + Celery/ARQ + Redis |
| **Agent Workers** | Docker + OpenAI SDK, Anthropic SDK, Google Vertex SDK, Groq SDK |
| **LLMs** | GPT-4o, Claude Opus/Sonnet, Gemini 1.5 Pro, Llama 3 70B |
| **Debate Engine** | Python + Jinja2 prompt templates |
| **Vector Store** | Pinecone or Qdrant |
| **Relational DB** | PostgreSQL (sessions, users, logs) |
| **Cache / Queue** | Redis (pub/sub, task queue, rate limiting) |
| **Object Storage** | AWS S3 (documents, file uploads) |
| **Observability** | LangSmith / Arize Phoenix + Prometheus + Grafana |
| **Tracing** | OpenTelemetry |
| **Container Orchestration** | Docker Compose (dev) → Kubernetes (prod) |
| **Auth** | JWT + OAuth 2.0 |
| **Streaming** | WebSocket (frontend ↔ backend) + Redis pub/sub (internal) |

---

## Appendix A — Example Prompt Templates

### Agent Round 1 Prompt

```
SYSTEM: You are the Analyst agent in an AI Council.
Your specialty: data interpretation, fact extraction, quantitative reasoning.
You are rigorous, evidence-based, and cite sources when possible.

USER QUERY: {{ query }}
CONTEXT: {{ rag_context }}
USER PROFILE: {{ user_memory }}

Respond in valid JSON only:
{
  "reasoning": "<your chain of thought>",
  "answer": "<your proposed answer>",
  "confidence": <0.0 to 1.0>,
  "sources": ["<source 1>", "..."]
}
```

### Agent Round 2 Debate Prompt

```
SYSTEM: You are the Analyst agent. Round 1 is complete.
Read all peer responses below and take a stance.

PEER RESPONSES:
{{ all_round1_outputs_json }}

YOUR Round 1 answer was:
{{ your_round1_answer }}

Now respond in valid JSON:
{
  "stance": "affirm | critique | revise",
  "critique_of": ["<agent_id>"],
  "critique_text": "<your critique if applicable>",
  "revised_answer": "<revised answer or null if affirming>",
  "confidence": <updated 0.0 to 1.0>
}
```

---

## Appendix B — Scaling Considerations

| Concern | Approach |
|---------|----------|
| High concurrency (many users) | Horizontal scaling of Agent Workers via Kubernetes HPA |
| LLM API cost | Cache responses for repeated/similar queries via semantic deduplication |
| Latency optimization | Early consensus detection skips Round 2 when all agents agree |
| LLM provider outage | Fallback routing: if GPT-4o down, route Analyst task to Claude Sonnet |
| Long context queries | Summarize RAG context to fit token limits; prioritize most relevant chunks |
| Debate infinite loop | Hard cap at 2 rounds; Synthesizer instructed to resolve disagreements |

---

*AI Agent Council — System Design v1.0 · February 2026*
