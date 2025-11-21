'use client';

import React, { useState, useRef, useEffect } from 'react';

interface ExtractedTask {
  id: string;
  title: string;
  description: string;
  domain: string;
  estimatedStatus: string;
  frequency: string;
  automationPotential: 'High' | 'Medium' | 'Low';
  source: string;
}

interface Message {
  id: string;
  role: 'consultant' | 'user';
  content: string;
  timestamp: Date;
}

interface Step5AIConsultantProps {
  tasks: ExtractedTask[];
  workshopId: string;
  onComplete: (selectedTask: ExtractedTask, insights: any) => void;
  onPrevious?: () => void;
}

export default function Step5AIConsultant({ tasks, workshopId, onComplete, onPrevious }: Step5AIConsultantProps) {
  const [selectedTask, setSelectedTask] = useState<ExtractedTask | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // AI 자동화 추천 업무 (High/Medium)
  const recommendedTasks = tasks.filter(
    task => task.automationPotential === 'High' || task.automationPotential === 'Medium'
  );

  // 초기 컨설턴트 메시지 - API 호출
  useEffect(() => {
    if (showChat && messages.length === 0) {
      const fetchInitialMessage = async () => {
        try {
          console.log('🔄 초기 메시지 로딩 시작, WorkshopId:', workshopId);

          // 초기 메시지 API 호출
          const response = await fetch('http://localhost:3001/api/consulting/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              workshopId: workshopId,
              message: `${selectedTask?.title} 업무를 자동화하고 싶습니다`,
              conversationHistory: []
            })
          });

          const data = await response.json();

          if (data.success) {
            const initialMessage: Message = {
              id: Date.now().toString(),
              role: 'consultant',
              content: data.message,
              timestamp: new Date(),
            };
            setMessages([initialMessage]);
          } else {
            throw new Error('API call failed');
          }
        } catch (error) {
          console.error('❌ 초기 메시지 로드 실패, Fallback 사용:', error);
          // Fallback: 기존 하드코딩된 메시지
          const initialMessage: Message = {
            id: Date.now().toString(),
            role: 'consultant',
            content: `안녕하세요! AI 자동화 컨설턴트입니다. "${selectedTask?.title}" 업무의 자동화 방안을 함께 설계해보겠습니다.\n\n먼저, 이 업무의 주요 목적과 현재 어떤 방식으로 수행되고 있는지 설명해주시겠어요?`,
            timestamp: new Date(),
          };
          setMessages([initialMessage]);
        }
      };

      fetchInitialMessage();
    }
  }, [showChat, selectedTask]);

  // 자동 스크롤
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleTaskSelect = (task: ExtractedTask) => {
    setSelectedTask(task);
    setShowChat(true);
    setMessages([]);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      console.log('💬 메시지 전송, WorkshopId:', workshopId);

      // 대화 히스토리 구성
      const conversationHistory = messages.map(msg => ({
        role: msg.role === 'consultant' ? 'assistant' : 'user',
        content: msg.content
      }));

      const response = await fetch('http://localhost:3001/api/consulting/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workshopId: workshopId,
          message: inputMessage,
          conversationHistory: conversationHistory
        })
      });

      const data = await response.json();

      if (data.success) {
        const consultantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'consultant',
          content: data.message,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, consultantMessage]);
      } else {
        // API 실패 시 Fallback
        throw new Error('API call failed');
      }
    } catch (error) {
      console.error('❌ API 호출 실패, Fallback 사용:', error);
      // Fallback: 기존 시뮬레이션 사용
      const consultantResponse = generateConsultantResponse(messages.length, inputMessage);
      const consultantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'consultant',
        content: consultantResponse,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, consultantMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const generateConsultantResponse = (messageCount: number, userInput: string): string => {
    const responses = [
      `감사합니다. ${userInput}에 대해 잘 이해했습니다.\n\n다음으로, 이 업무를 수행할 때 가장 시간이 많이 걸리거나 반복적인 부분은 무엇인가요? 구체적으로 알려주시면 자동화 포인트를 찾는 데 도움이 됩니다.`,
      `좋습니다. 그 부분은 충분히 자동화할 수 있을 것 같습니다.\n\n이 업무를 자동화했을 때 기대하는 효과는 무엇인가요?\n- 시간 절감\n- 정확도 향상\n- 업무 효율성\n- 기타`,
      `훌륭합니다! 그렇다면 이 업무 프로세스를 단계별로 나누어 볼까요?\n\n1단계부터 마지막 단계까지 어떤 순서로 진행되는지 설명해주세요. 각 단계에서 사람이 판단해야 하는 부분과 규칙적으로 반복되는 부분을 구분해주시면 더욱 좋습니다.`,
      `완벽합니다! 지금까지 말씀해주신 내용을 바탕으로 자동화 워크플로우를 설계할 준비가 되었습니다.\n\n최종적으로, 이 자동화 솔루션에서 반드시 사람의 검토나 승인이 필요한 단계가 있나요? 있다면 어떤 부분인지 알려주세요.`,
    ];

    return responses[Math.min(messageCount, responses.length - 1)] ||
      `잘 이해했습니다. 추가로 궁금한 점이 있으시면 언제든 말씀해주세요!`;
  };

  const getAutomationPotentialBadge = (potential: string) => {
    const configs = {
      High: { bg: 'bg-gradient-to-r from-emerald-500 to-green-500', text: 'text-white', icon: '🚀', label: '높음' },
      Medium: { bg: 'bg-gradient-to-r from-amber-500 to-orange-500', text: 'text-white', icon: '⚡', label: '보통' },
      Low: { bg: 'bg-gradient-to-r from-slate-400 to-gray-400', text: 'text-white', icon: '📋', label: '낮음' },
    };
    return configs[potential as keyof typeof configs] || configs.Low;
  };

  return (
    <div className="relative min-h-screen -m-6 flex flex-col items-center animate-fadeIn overflow-x-hidden">
      {/* Modern Gradient Mesh Background - Matching Step 1 */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50/30 fixed">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.08)_0%,transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(99,102,241,0.08)_0%,transparent_50%)]"></div>
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 py-20">
        {/* Hero Section - Matching Step 1 Style */}
        <div className="text-center mb-16">
          {/* Badge */}
          <div className="inline-flex items-center gap-2.5 px-6 py-2.5 bg-white/80 backdrop-blur-xl border border-blue-100 rounded-full shadow-lg shadow-blue-100/50 mb-10">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500 rounded-full blur opacity-60 animate-pulse"></div>
              <div className="relative w-2 h-2 bg-blue-600 rounded-full"></div>
            </div>
            <span className="text-sm font-bold tracking-wider text-slate-700 uppercase">Step 5: AI Consultant</span>
          </div>

          {/* Main Title */}
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-8 tracking-tighter leading-tight">
            <span className="inline-block bg-gradient-to-br from-slate-900 via-blue-800 to-indigo-900 bg-clip-text text-transparent">
              AI 업무 재설계 컨설팅
            </span>
          </h1>

          {/* Subtitle */}
          <div className="space-y-4">
            <p className="text-2xl font-light text-slate-800 tracking-tight">
              AI가 제안하는 <span className="font-semibold text-blue-700">최적의 업무 방식</span>을 확인하세요
            </p>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              업무별 자동화 가능성과 구체적인 실행 방안을 제시합니다
            </p>
          </div>
        </div>

        {!showChat ? (
          // 업무 선택 화면
          <>
            {/* AI 추천 섹션 */}
            <div className="backdrop-blur-2xl bg-white/50 border border-white/60 rounded-3xl p-8 mb-8 shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 backdrop-blur-md bg-gradient-to-br from-indigo-500/30 to-purple-500/30 border border-indigo-300/50 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-indigo-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-semibold text-slate-900">AI 추천 업무</h3>
                  <p className="text-slate-600">자동화 효과가 클 것으로 예상되는 업무입니다</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recommendedTasks.map(task => {
                  const badge = getAutomationPotentialBadge(task.automationPotential);
                  return (
                    <div
                      key={task.id}
                      onClick={() => handleTaskSelect(task)}
                      className="backdrop-blur-lg bg-white/60 border-2 border-white/80 rounded-2xl p-6 shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 cursor-pointer group"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="text-lg font-semibold text-slate-900 group-hover:text-indigo-700 transition-colors flex-1">
                          {task.title}
                        </h4>
                        <span className={`${badge.bg} ${badge.text} px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 shadow-md`}>
                          <span>{badge.icon}</span>
                          {badge.label}
                        </span>
                      </div>
                      <p className="text-slate-600 text-sm mb-4 line-clamp-2">{task.description}</p>
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                          </svg>
                          {task.domain}
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {task.frequency}
                        </span>
                      </div>
                      <div className="mt-4 pt-4 border-t border-slate-200 flex items-center justify-end">
                        <span className="text-indigo-600 font-medium text-sm group-hover:translate-x-1 transition-transform flex items-center gap-1">
                          선택하고 대화 시작하기
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 전체 업무에서 선택 */}
            <div className="backdrop-blur-xl bg-white/40 border border-white/60 rounded-3xl p-8 shadow-xl">
              <h3 className="text-xl font-semibold text-slate-900 mb-4">또는 전체 업무 목록에서 선택</h3>
              <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto pr-2">
                {tasks.filter(t => !recommendedTasks.includes(t)).map(task => (
                  <div
                    key={task.id}
                    onClick={() => handleTaskSelect(task)}
                    className="backdrop-blur-md bg-white/50 border border-white/70 rounded-xl p-4 hover:bg-white/70 hover:shadow-lg transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-slate-900">{task.title}</h4>
                        <p className="text-sm text-slate-600 line-clamp-1">{task.description}</p>
                      </div>
                      <span className={`${getAutomationPotentialBadge(task.automationPotential).bg} text-white px-2 py-1 rounded-lg text-xs ml-3`}>
                        {getAutomationPotentialBadge(task.automationPotential).label}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          // AI 컨설턴트 대화 화면
          <div className="backdrop-blur-2xl bg-white/50 border border-white/60 rounded-3xl shadow-2xl overflow-hidden">
            {/* 선택된 업무 헤더 */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
              <button
                onClick={() => setShowChat(false)}
                className="mb-4 flex items-center gap-2 text-white/80 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                뒤로 가기
              </button>
              <h3 className="text-2xl font-bold mb-2">{selectedTask?.title}</h3>
              <p className="text-indigo-100">{selectedTask?.description}</p>
            </div>

            {/* 챗 영역 */}
            <div
              ref={chatContainerRef}
              className="h-[500px] overflow-y-auto p-6 space-y-4 bg-white/20"
            >
              {messages.map(message => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[70%] ${message.role === 'user'
                      ? 'backdrop-blur-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                      : 'backdrop-blur-xl bg-white/80 text-slate-800 border border-white/60'
                    } rounded-2xl px-5 py-3 shadow-lg`}>
                    {message.role === 'consultant' && (
                      <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-200">
                        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                          AI
                        </div>
                        <span className="font-semibold text-sm">AI 컨설턴트</span>
                      </div>
                    )}
                    <p className="whitespace-pre-line leading-relaxed">{message.content}</p>
                    <p className={`text-xs mt-2 ${message.role === 'user' ? 'text-indigo-100' : 'text-slate-500'}`}>
                      {message.timestamp.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="backdrop-blur-xl bg-white/80 border border-white/60 rounded-2xl px-5 py-3 shadow-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce animation-delay-200"></div>
                      <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce animation-delay-400"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 입력 영역 */}
            <div className="p-6 bg-white/40 backdrop-blur-lg border-t border-white/60">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="메시지를 입력하세요..."
                  className="flex-1 px-5 py-3 backdrop-blur-sm bg-white/90 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400/50 focus:border-indigo-400 transition-all text-slate-800"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isTyping}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>

              {messages.length >= 2 && (
                <div className="mt-4 flex justify-between gap-4">
                  <button
                    onClick={onPrevious}
                    className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-xl transition-all flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    이전 단계
                  </button>
                  <button
                    onClick={() => onComplete(selectedTask!, { messages })}
                    className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl font-semibold hover:shadow-xl hover:scale-[1.02] transition-all"
                  >
                    대화 완료 - 워크플로우 설계로 이동
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
