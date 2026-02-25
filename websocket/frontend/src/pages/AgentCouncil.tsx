import React, { useState, useEffect, useRef, useCallback } from 'react'

interface Agent {
  id: string
  name: string
  model: string
  status: string
  nameColor: string
  dotColor: string  // hex color string, used inline
  icon: string
}

interface ChatMessage {
  id: string
  type: 'user' | 'agent-thinking' | 'agent-challenge' | 'final-answer'
  agentName?: string
  agentColor?: string
  content: string
  confidence?: number
}

interface DeliberationCard {
  id: string
  agentName: string
  model: string
  content: string
  round: number
  time: string
  icon: string
  nameColor: string
}

// Agent colors per spec: Analyst=#e84c3d, Researcher=#3d7ee8, Reasoner=#38b06f, Critic=#c9a84c, Synthesizer=#9b59b6
const agents: Agent[] = [
  {
    id: '1',
    name: 'Analyst',
    model: 'GPT-4o',
    status: '↳ parsing query intent...',
    nameColor: 'text-[#e84c3d]',
    dotColor: '#e84c3d',
    icon: '⚡',
  },
  {
    id: '2',
    name: 'Researcher',
    model: 'Claude Opus',
    status: '↳ retrieving context...',
    nameColor: 'text-[#3d7ee8]',
    dotColor: '#3d7ee8',
    icon: '🔬',
  },
  {
    id: '3',
    name: 'Reasoner',
    model: 'Gemini 1.5 Pro',
    status: '↳ logic validation...',
    nameColor: 'text-[#38b06f]',
    dotColor: '#38b06f',
    icon: '🧠',
  },
  {
    id: '4',
    name: 'Critic',
    model: 'Llama 3 70B',
    status: '↳ awaiting draft...',
    nameColor: 'text-[#c9a84c]',
    dotColor: '#c9a84c',
    icon: '⚖️',
  },
  {
    id: '5',
    name: 'Synthesizer',
    model: 'Claude Sonnet',
    status: '↳ standby',
    nameColor: 'text-[#9b59b6]',
    dotColor: '#9b59b6',
    icon: '✦',
  },
]

const initialMessages: ChatMessage[] = [
  {
    id: '1',
    type: 'user',
    content: "What's the best investment strategy for a 30-year-old with $10k?",
  },
  {
    id: '2',
    type: 'agent-thinking',
    agentName: '⚡ Analyst thinking...',
    agentColor: 'text-[#e84c3d]',
    content:
      'Index funds dominate risk-adjusted returns. Evidence from Vanguard 2023 data supports low-cost passive ETFs for this profile.',
  },
  {
    id: '3',
    type: 'agent-challenge',
    agentName: '⚖️ Critic challenges Analyst...',
    agentColor: 'text-[#c9a84c]',
    content:
      "Disagrees with ignoring emergency fund priority. $10k shouldn't be entirely invested without 3-6mo liquid runway established first.",
  },
  {
    id: '4',
    type: 'final-answer',
    confidence: 91,
    content:
      'After deliberation, the Council recommends: First, ensure 3-month emergency fund (~$3k liquid). Invest remaining $7k in a split of 70% broad market ETFs (VTI/VXUS), 20% bonds for stability, 10% speculative growth. At 30, your time horizon favors equities...',
  },
]

const deliberationCards: DeliberationCard[] = [
  {
    id: '1',
    agentName: '⚡ Analyst',
    model: 'GPT-4o',
    content: 'Recommending 100% ETF allocation, VOO/VTI split. Minimal bonds at 30.',
    round: 1,
    time: '2.1s',
    icon: '⚡',
    nameColor: 'text-[#e84c3d]',
  },
  {
    id: '2',
    agentName: '🔬 Researcher',
    model: 'Claude Opus',
    content: 'Found Vanguard research: 90/10 equity/bond optimal at this age. Agrees with Analyst but adds international exposure.',
    round: 1,
    time: '3.4s',
    icon: '🔬',
    nameColor: 'text-[#3d7ee8]',
  },
  {
    id: '3',
    agentName: '⚖️ Critic',
    model: 'Llama 3 70B',
    content: 'Flagging: both ignored emergency fund prerequisite. Critical error in advice ordering.',
    round: 2,
    time: '1.8s',
    icon: '⚖️',
    nameColor: 'text-[#c9a84c]',
  },
  {
    id: '4',
    agentName: '🧠 Reasoner',
    model: 'Gemini 1.5 Pro',
    content: 'Critic is correct. Revising vote. Emergency fund first is logically prior.',
    round: 2,
    time: '2.2s',
    icon: '🧠',
    nameColor: 'text-[#38b06f]',
  },
]

const AgentCouncil = () => {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [inputValue, setInputValue] = useState('')
  const [showDebate, setShowDebate] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [consensusProgress] = useState(100)
  const [activeAgentIndex, setActiveAgentIndex] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveAgentIndex(prev => (prev + 1) % agents.length)
    }, 1800)
    return () => clearInterval(interval)
  }, [])

  const handleSend = useCallback(() => {
    if (!inputValue.trim() || processing) return

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      type: 'user',
      content: inputValue,
    }
    setMessages(prev => [...prev, userMsg])
    setInputValue('')
    setProcessing(true)

    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          id: crypto.randomUUID(),
          type: 'agent-thinking',
          agentName: '⚡ Analyst thinking...',
          agentColor: 'text-[#e84c3d]',
          content: 'Analyzing query parameters. Cross-referencing available data sources...',
        },
      ])
    }, 900)

    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          id: crypto.randomUUID(),
          type: 'agent-challenge',
          agentName: '⚖️ Critic challenges Analyst...',
          agentColor: 'text-[#c9a84c]',
          content: 'Insufficient data to make high-confidence claims. Requesting additional context from Researcher.',
        },
      ])
    }, 2000)

    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          id: crypto.randomUUID(),
          type: 'final-answer',
          confidence: Math.floor(Math.random() * 20) + 70,
          content:
            'Council deliberation complete. The synthesized response accounts for all agent perspectives and challenge rounds. Confidence threshold reached.',
        },
      ])
      setProcessing(false)
    }, 3500)
  }, [inputValue, processing])

  return (
    <div className="flex h-screen bg-[#0a0a0a] font-mono text-xs overflow-hidden">
      {/* Topbar */}
      <div className="absolute top-0 left-0 right-0 h-7 bg-[#0a0a0a] border-b border-[#1e1e1e] flex items-center px-4 z-10">
        <span className="text-[#2e2e2e] tracking-[0.3em] text-[9px] uppercase">
          Frontend Interface #Wireframe
        </span>
      </div>

      {/* ── Left Sidebar ── */}
      <div className="w-52 border-r border-[#1a1a1a] flex flex-col mt-7 bg-[#0a0a0a] shrink-0">
        {/* Header */}
        <div className="px-3 py-3 border-b border-[#1a1a1a]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shrink-0" />
            <span className="text-[#d1d5db] font-bold tracking-wide text-[11px]">Council - Active</span>
          </div>
        </div>

        {/* Agent list — 3px left border per agent color per spec */}
        <div className="flex-1 overflow-y-auto">
          {agents.map((agent, i) => (
            <div
              key={agent.id}
              className={`relative pl-4 pr-3 py-2.5 border-b border-[#141414] cursor-pointer transition-colors overflow-hidden ${
                i === activeAgentIndex
                  ? 'bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.2)]'
                  : 'hover:bg-[#111]'
              }`}
            >
              {/* 3px left color strip */}
              <span
                className="absolute left-0 top-0 bottom-0 w-[3px]"
                style={{ background: agent.dotColor }}
              />
              <div className="min-w-0">
                <div className="text-[rgba(255,255,255,0.9)] font-medium text-[11px] leading-tight">
                  {agent.icon} {agent.name}
                </div>
                <div className="text-[rgba(255,255,255,0.4)] text-[9px] mt-0.5 tracking-[1px] uppercase">{agent.model}</div>
                <div className="text-[rgba(255,255,255,0.3)] text-[9px] mt-1 italic">{agent.status}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Phase indicator footer per spec */}
        <div className="px-3 py-3 border-t border-[#1a1a1a]">
          <div className="flex items-center gap-1">
            <div className="w-5 h-1 rounded-sm bg-[#38b06f]" />
            <div className="w-5 h-1 rounded-sm bg-[#38b06f]" />
            <div className="w-5 h-1 rounded-sm bg-[#c9a84c] animate-pulse" />
            <div className="w-5 h-1 rounded-sm bg-[rgba(255,255,255,0.15)]" />
            <div className="w-5 h-1 rounded-sm bg-[rgba(255,255,255,0.15)]" />
            <span className="text-[rgba(255,255,255,0.4)] text-[9px] ml-1 tracking-[1px] uppercase">Debate</span>
          </div>
        </div>
      </div>

      {/* ── Main Chat ── */}
      <div className="flex-1 flex flex-col mt-7 min-w-0">
        {/* Header */}
        <div className="px-5 py-3 border-b border-[#1a1a1a] flex items-center justify-between bg-[#0a0a0a] shrink-0">
          <span className="text-[#d1d5db] font-bold tracking-wide text-[11px]">Council Chat</span>
          <div className="flex items-center gap-2">
            <span className="text-[#3a3a3a] text-[9px] tracking-[0.15em] uppercase">Internal Debate Visible</span>
            <button
              onClick={() => setShowDebate(!showDebate)}
              className={`w-7 h-3.5 rounded-full transition-colors relative shrink-0 ${
                showDebate ? 'bg-[#444]' : 'bg-[#222]'
              }`}
            >
              <span
                className={`absolute top-[1px] w-[11px] h-[11px] rounded-full bg-[#888] shadow transition-all duration-200 ${
                  showDebate ? 'left-[14px]' : 'left-[1px]'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
          {messages.map(msg => {
            if (msg.type === 'user') {
              return (
                <div key={msg.id} className="flex justify-end">
                  <div className="bg-[#1a1a1a] border border-[#2a2a2a] text-[#d1d5db] px-4 py-2.5 max-w-[62%] text-[11px] leading-relaxed rounded-sm">
                    {msg.content}
                  </div>
                </div>
              )
            }

            if (msg.type === 'agent-thinking') {
              return (
                <div key={msg.id} className="space-y-1.5">
                  <div className={`${msg.agentColor ?? 'text-[#555]'} text-[10px] tracking-[0.15em] uppercase`}>
                    • {msg.agentName} (Thinking...)
                  </div>
                  <div className="text-[#4a4a4a] text-[11px] leading-relaxed pl-3 border-l border-[#222]">
                    {msg.content}
                  </div>
                </div>
              )
            }

            if (msg.type === 'agent-challenge') {
              return (
                <div key={msg.id} className="space-y-1.5">
                  <div className={`${msg.agentColor ?? 'text-[#555]'} text-[10px] tracking-[0.15em] uppercase`}>
                    • {msg.agentName}:
                  </div>
                  <div className="text-[#4a4a4a] text-[11px] leading-relaxed pl-3 border-l border-[#222]">
                    {msg.content}
                  </div>
                </div>
              )
            }

            if (msg.type === 'final-answer') {
              return (
                <div
                  key={msg.id}
                  className="border border-[#3a1010] rounded-sm p-3.5"
                  style={{ background: '#150505' }}
                >
                  <div className="text-[#8b5252] text-[10px] tracking-[0.15em] uppercase mb-2">
                    • Council Final Answer — Confidence {msg.confidence}%
                  </div>
                  <div className="text-[#b8a8a8] text-[11px] leading-relaxed">
                    {msg.content}
                  </div>
                </div>
              )
            }

            return null
          })}

          {processing && (
            <div className="flex items-center gap-2 text-[#3a3a3a] text-[10px] animate-pulse tracking-widest">
              <span>• COUNCIL DELIBERATING</span>
              <span className="flex gap-0.5">
                <span className="w-1 h-1 rounded-full bg-[#3a3a3a] animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1 h-1 rounded-full bg-[#3a3a3a] animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1 h-1 rounded-full bg-[#3a3a3a] animate-bounce" style={{ animationDelay: '300ms' }} />
              </span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="px-4 py-3 border-t border-[#1a1a1a] bg-[#0a0a0a] shrink-0">
          <div className="flex items-center gap-2 border border-[#1e1e1e] rounded-sm bg-[#0f0f0f] px-3 py-2">
            <input
              type="text"
              placeholder="Ask the Council..."
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              className="flex-1 bg-transparent text-[#9ca3af] placeholder-[#2a2a2a] outline-none text-[11px] tracking-wide"
            />
            <button
              onClick={handleSend}
              disabled={processing || !inputValue.trim()}
              className="disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-[10px] px-4 py-1.5 tracking-[1px] transition-colors shrink-0 rounded-sm uppercase"
              style={{ background: '#e84c3d' }}
            >
              Send
            </button>
          </div>
        </div>
      </div>

      {/* ── Right Sidebar — Live Deliberation ── */}
      {showDebate && (
        <div className="w-64 border-l border-[#1a1a1a] flex flex-col mt-7 bg-[#0a0a0a] shrink-0">
          <div className="px-3 py-3 border-b border-[#1a1a1a] shrink-0">
            <span className="text-[#9ca3af] font-bold tracking-[0.2em] text-[10px] uppercase">
              Live Deliberation
            </span>
          </div>

          {/* Debate cards — 2px left border per agent color per spec */}
          <div className="flex-1 overflow-y-auto py-2 px-2 space-y-2">
            {deliberationCards.map((card, i) => {
              const borderColors = ['#e84c3d', '#3d7ee8', '#c9a84c', '#38b06f']
              const borderColor = borderColors[i] ?? '#555'
              return (
                <div
                  key={card.id}
                  className="relative pl-3 pr-2.5 py-2 rounded-sm overflow-hidden"
                  style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.06)' }}
                >
                  {/* 2px left color strip */}
                  <span className="absolute left-0 top-0 bottom-0 w-[2px]" style={{ background: borderColor }} />
                  <div className={`${card.nameColor} text-[9px] uppercase tracking-[1px] mb-1`}>
                    {card.agentName}
                  </div>
                  <div className="text-[rgba(255,255,255,0.6)] text-[10px] leading-relaxed mb-1.5">
                    {card.content}
                  </div>
                  <div className="text-[rgba(255,255,255,0.25)] text-[9px]">
                    Round {card.round} · {card.time}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Consensus vote — split bar per spec: green% + dim remainder */}
          <div className="border-t border-[#1a1a1a] px-3 py-3 shrink-0">
            <div className="text-[rgba(255,255,255,0.3)] text-[9px] tracking-[1px] uppercase mb-2">
              Consensus Vote
            </div>
            <div className="flex gap-1 mb-2">
              <div
                className="h-5 rounded-sm flex items-center px-1.5 text-[9px] text-white font-medium"
                style={{ flex: 0.91, background: '#38b06f' }}
              >
                91%
              </div>
              <div
                className="h-5 rounded-sm flex items-center px-1.5 text-[9px]"
                style={{ flex: 0.09, background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.3)' }}
              >
                9%
              </div>
            </div>
            <div className="text-[rgba(255,255,255,0.3)] text-[9px] tracking-[1px] text-center uppercase">
              4/5 agents aligned · Proceeding
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AgentCouncil
