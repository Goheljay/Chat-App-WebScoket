import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { getAuthToken } from '../utils/cookies'
import { useLocation, useNavigate } from 'react-router-dom'
import { getMessagesByConversationId, getUserDetails, sendMessage } from '../services/user.api'
import { SendMessageReqDto, UserDetailsDto } from '../dto/UserDto'

const WS_BASE_URL = 'ws://localhost:9002'

interface ChatMessage {
  id?: string
  type: string
  conversationId: string
  senderId: string
  receiverId: string
  message: string
}

type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error'

const ChatWindow = () => {
  const [messages, setMessages] = useState<any[]>([])
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connecting')
  const wsRef = useRef<WebSocket | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [currentUserId, setCurrentUserId] = useState<string>();
  const [userDetails, setUserDetails] = useState<any>();
  const [messageInput, setMessageInput] = useState<string>('');

  const navigate = useNavigate();
  const location = useLocation();
  
  const searchParams = useMemo(() => {
    return new URLSearchParams(location.search);
  }, [location.search]);

  useEffect(() => {
    const conversationId = searchParams.get('conversationId');
    if(conversationId) {
      setCurrentUserId(conversationId);
    }
  }, [location.search]);

  useEffect(() => {
    const token = getAuthToken('accessToken')
    if (!token) {
      setConnectionStatus('error')
      return
    }

    const wsUrl = `${WS_BASE_URL}?token=${encodeURIComponent(token)}`
    const ws = new WebSocket(wsUrl)
    wsRef.current = ws

    ws.onopen = () => {
      setConnectionStatus('connected')
    }

    const conversationId = searchParams.get('conversationId');
    if(conversationId) {
      setCurrentUserId(conversationId);
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data as string)
        console.log('data', data);
        
        if (data.type === 'message') {
          setMessages((prev) => [...prev, { ...data, id: data._id || crypto.randomUUID() }])
        }
      } catch (err) {
        console.error('Failed to parse WebSocket message', err)
      }
    }

    ws.onclose = () => {
      setConnectionStatus('disconnected')
      wsRef.current = null
    }

    ws.onerror = () => {
      setConnectionStatus('error')
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close()
        wsRef.current = null
      }
    }
  }, []);

  useEffect(() => {
    fetchUserDetails();
  }, [currentUserId]);

  const fetchUserDetails = useCallback(() => {
    if (!currentUserId) return
    getUserDetails(currentUserId)
      .then((response) => {
        setUserDetails(response.data as UserDetailsDto);
        fetchMessages();
      })
      .catch((error) => {
        console.log(error)
      })
  }, [currentUserId])

  const fetchMessages = useCallback(() => {
    if (!currentUserId) return
    getMessagesByConversationId(currentUserId)
      .then((response) => {
        setMessages(response.data as ChatMessage[]);
      })
  }, [currentUserId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = useCallback(() => {
    if (!messageInput) return
    sendMessage({ conversationId: userDetails?.conversationId, message: messageInput, type: 'text', isBroadcast: false } as SendMessageReqDto)
      .then((response) => {
        setMessages((prev) => [...prev, { ...response.data, id: response.data._id || crypto.randomUUID() }])
        setMessageInput('');
      })
  }, [messageInput, setMessageInput])

  return (
    <>{currentUserId && (
        <div className="flex flex-col h-full w-full">
            {/* Header */}
            <div className="bg-[#36393f] px-6 py-4 shadow-sm">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="text-[#dcddde] text-lg font-semibold">{userDetails?.name}</div>
                        <span
                          className={`inline-block w-2 h-2 rounded-full ${
                            connectionStatus === 'connected'
                              ? 'bg-green-500'
                              : connectionStatus === 'connecting'
                              ? 'bg-yellow-500 animate-pulse'
                              : 'bg-red-500'
                          }`}
                          title={connectionStatus}
                        />
                        <svg className="w-4 h-4 text-[#b9bbbe]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                        </svg>
                    </div>
                    <div className="flex items-center gap-4">
                        {/* <svg className="w-5 h-5 text-[#b9bbbe] hover:text-[#dcddde] cursor-pointer" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg> */}
                        <svg className="w-5 h-5 text-[#b9bbbe] hover:text-[#dcddde] cursor-pointer" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                        <svg className="w-5 h-5 text-[#b9bbbe] hover:text-[#dcddde] cursor-pointer" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-4 py-4">
              {messages.length === 0 ? (
                <div className="text-[#72767d] text-sm text-center py-8">No messages yet</div>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className="mb-4 group hover:bg-[#f7f7f7] rounded px-2 py-1 -mx-2">
                    <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#5865f2] flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                        {msg.senderId?.name?.slice(0, 2).toUpperCase() ?? '??'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2 mb-1">
                          <span className="font-semibold text-sm text-[#4d4d4d]">{msg.senderId?.name}</span>
                        </div>
                        <div className="text-sm leading-relaxed text-[#4d4d4d]">{msg.message}</div>
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="bg-[#40444b] px-4 py-3">
                <div className="flex items-center gap-2">
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            placeholder="Message #general"
                            value={messageInput}
                            className="w-full bg-[#40444b] text-[#dcddde] placeholder-[#72767d] px-4 py-2 rounded-lg border-none outline-none focus:ring-0"
                            onChange={(e) => setMessageInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleSendMessage()
                              }
                            }}
                        />
                    </div>
                    <button className="p-2 text-[#b9bbbe] hover:text-[#dcddde] hover:bg-[#36393f] rounded transition-colors">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    )}</>
    )
}

export default ChatWindow