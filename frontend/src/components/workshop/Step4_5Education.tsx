'use client';

import React, { useState, useEffect } from 'react';

interface Step4_5EducationProps {
  workshopId: string;
  onNext: () => void;
  onPrevious?: () => void;
}

interface LeaderTask {
  task1: string;
  task2: string;
  task3: string;
}

interface WorkflowStep {
  id: number;
  name: string;
  role: 'human' | 'copilot' | 'llm';
}

export default function Step4_5Education({ workshopId, onNext, onPrevious }: Step4_5EducationProps) {
  const [leaderTasks, setLeaderTasks] = useState<LeaderTask>({
    task1: '',
    task2: '',
    task3: ''
  });

  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([
    { id: 1, name: '팀원 5명에게 이메일로 실적 요청하고, 답변 오면 이메일 본문을 복사해서 엑셀에 하나씩 붙여넣기', role: 'human' },
    { id: 2, name: '취합된 엑셀 데이터를 날짜별로 정렬하고, 피벗 테이블 돌려 부서별 합계 낸 뒤 그래프 그리기', role: 'human' },
    { id: 3, name: '그래프를 보며 이번 주 특이사항 고민하고, 보고서에 들어갈 3줄 요약 멘트 직접 타이핑하기', role: 'human' },
    { id: 4, name: '작성된 내용을 회사 PPT 템플릿에 옮겨 담고, 폰트/줄간격 맞춘 뒤 인쇄해서 팀장님 책상에 제출', role: 'human' }
  ]);

  const stepScenarios: Record<number, Record<string, { situation: string; risk: string }>> = {
    1: {
      human: {
        situation: "이메일로 실적 요청을 보내고, 답변이 오면 이메일 본문을 드래그해서 복사합니다. 엑셀 시트를 열고 해당 셀에 붙여넣은 뒤, 숫자만 남기고 불필요한 인사말은 지웁니다. 5명분을 반복합니다.",
        risk: "⏳ 이메일 확인 → 복사 → 붙여넣기 → 정리 작업의 반복으로 인한 피로도 증가"
      },
      copilot: {
        situation: "이메일로 받은 데이터를 복사해서 AI에게 '이 내용을 표로 정리해줘'라고 시킵니다. AI가 만든 표를 엑셀에 붙여넣기만 하면 됩니다.",
        risk: "💡 원본 데이터 복사 과정에서의 누락 주의 필요"
      },
      llm: {
        situation: "공유 폴더에 팀원들이 업로드한 파일을 자동으로 읽어와 엑셀 시트에 채워 넣습니다. 클릭 한 번도 필요 없습니다.",
        risk: "⚠️ 파일 형식 불일치 시 전체 프로세스 중단 가능성"
      }
    },
    2: {
      human: {
        situation: "엑셀에서 날짜 컬럼을 선택하고 정렬 버튼을 누릅니다. 피벗 테이블 메뉴를 열어 부서별로 그룹화하고, 합계 함수를 설정합니다. 차트 삽입 메뉴에서 막대 그래프를 선택하고 데이터 범위를 지정합니다.",
        risk: "⏳ 엑셀 기능 숙지 필요, 실수 시 처음부터 다시"
      },
      copilot: {
        situation: "엑셀 데이터를 AI에게 보여주고 '이 데이터를 날짜별로 정렬하고, 부서별 합계를 피벗 테이블로 만들어줘. 그리고 막대 그래프도 그려줘'라고 요청합니다. AI가 제안한 수식과 차트를 검토 후 적용합니다.",
        risk: "💡 AI가 제안한 수식이 의도와 다를 수 있으니 검토 필요"
      },
      llm: {
        situation: "스크립트가 자동으로 데이터를 정렬하고, 피벗 테이블을 생성하며, 차트를 그립니다. 결과물이 이메일로 전송됩니다.",
        risk: "⚠️ 예외 상황(결측치, 이상치) 처리 로직 사전 구현 필요"
      }
    },
    3: {
      human: {
        situation: "그래프를 보며 이번 주 특이사항을 고민합니다. 작년 동기 대비 증감률, 부서별 편차, 특정 이벤트 영향 등을 분석하고, 3줄 요약 멘트를 직접 작성합니다.",
        risk: "💭 깊은 사고와 맥락 이해 필요, 시간 소요"
      },
      copilot: {
        situation: "AI에게 '이 그래프를 보고 3가지 인사이트를 뽑아줘'라고 요청합니다. AI가 제안한 인사이트를 검토하고, 회사 상황에 맞게 수정하거나 추가 멘트를 작성합니다.",
        risk: "💡 AI 인사이트가 피상적일 수 있으니 깊이 있는 검토 필요"
      },
      llm: {
        situation: "AI가 자동으로 그래프를 분석하고 3줄 요약을 생성합니다. 하지만 회사 내부 맥락이나 정치적 뉘앙스는 반영되지 않습니다.",
        risk: "⚠️ 맥락 없는 인사이트로 인한 오해 가능성, 최종 검토 필수"
      }
    },
    4: {
      human: {
        situation: "회사 PPT 템플릿을 열고, 텍스트와 차트를 복사해서 붙여넣습니다. 폰트 크기, 줄간격, 색상을 회사 가이드에 맞춰 조정합니다. 인쇄 설정을 확인하고 출력합니다.",
        risk: "⏳ 포맷팅 작업 시간 소요, 실수로 인한 재작업 가능성"
      },
      copilot: {
        situation: "AI에게 '이 내용을 회사 PPT 템플릿에 맞춰 정리해줘'라고 요청합니다. AI가 생성한 슬라이드를 검토하고, 필요한 부분만 수정합니다.",
        risk: "💡 템플릿 준수 여부 확인 필요"
      },
      llm: {
        situation: "스크립트가 자동으로 PPT를 생성하고, 회사 템플릿에 맞춰 포맷팅합니다. 완성된 파일이 자동으로 공유 폴더에 저장됩니다.",
        risk: "⚠️ 템플릿 변경 시 스크립트 수정 필요, 유지보수 부담"
      }
    }
  };

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('workshop_leader_reflection');
    if (saved) {
      setLeaderTasks(JSON.parse(saved));
    }
  }, []);

  const handleTaskChange = (field: keyof LeaderTask, value: string) => {
    setLeaderTasks(prev => ({ ...prev, [field]: value }));
  };

  const saveTasks = () => {
    const data = { ...leaderTasks, timestamp: new Date().toISOString() };
    localStorage.setItem('workshop_leader_reflection', JSON.stringify(data));
    alert('✅ 저장되었습니다!');
  };

  const updateRole = (stepId: number, newRole: 'human' | 'copilot' | 'llm') => {
    setWorkflowSteps(prev =>
      prev.map(step => (step.id === stepId ? { ...step, role: newRole } : step))
    );
  };

  const resetWorkflow = () => {
    setWorkflowSteps([
      { id: 1, name: '팀원 5명에게 이메일로 실적 요청하고, 답변 오면 이메일 본문을 복사해서 엑셀에 하나씩 붙여넣기', role: 'human' },
      { id: 2, name: '취합된 엑셀 데이터를 날짜별로 정렬하고, 피벗 테이블 돌려 부서별 합계 낸 뒤 그래프 그리기', role: 'human' },
      { id: 3, name: '그래프를 보며 이번 주 특이사항 고민하고, 보고서에 들어갈 3줄 요약 멘트 직접 타이핑하기', role: 'human' },
      { id: 4, name: '작성된 내용을 회사 PPT 템플릿에 옮겨 담고, 폰트/줄간격 맞춘 뒤 인쇄해서 팀장님 책상에 제출', role: 'human' }
    ]);
  };

  const getRoleIcon = (role: string) => {
    const icons = { human: '👤', copilot: '✨', llm: '🤖' };
    return icons[role as keyof typeof icons];
  };

  const getRoleColor = (role: string) => {
    const colors = {
      human: 'border-slate-500',
      copilot: 'border-blue-500',
      llm: 'border-purple-500'
    };
    return colors[role as keyof typeof colors];
  };

  const getRoleBg = (role: string) => {
    const bgs = {
      human: 'bg-slate-500',
      copilot: 'bg-blue-500',
      llm: 'bg-purple-500'
    };
    return bgs[role as keyof typeof bgs];
  };

  const counts = {
    llm: workflowSteps.filter(s => s.role === 'llm').length,
    copilot: workflowSteps.filter(s => s.role === 'copilot').length,
    human: workflowSteps.filter(s => s.role === 'human').length
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
            <span className="text-sm font-bold tracking-wider text-slate-700 uppercase">Step 4.5: Workflow Education</span>
          </div>

          {/* Main Title */}
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-8 tracking-tighter leading-tight">
            <span className="inline-block bg-gradient-to-br from-slate-900 via-blue-800 to-indigo-900 bg-clip-text text-transparent">
              2030년, 우리 팀의 성과는<br />&apos;누가&apos; 만드는가?
            </span>
          </h1>

          {/* Subtitle */}
          <div className="space-y-4">
            <p className="text-2xl font-light text-slate-800 tracking-tight">
              기술은 인간을 대체하는 것이 아니라, <span className="font-semibold text-blue-700">인간의 잠재력을 증폭(Augment)</span>시키는 도구입니다
            </p>
          </div>
        </div>

        {/* LLM Concept Section */}
        <section className="animate-fadeIn mb-20">
          <div className="backdrop-blur-xl bg-white/40 border border-white/60 rounded-3xl p-8 shadow-2xl max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-slate-900 mb-6">The Shift: 2030년 업무의 뉴노멀</h3>

            <div className="flex gap-2 h-16 rounded-full overflow-hidden mb-8">
              <div className="flex-1 bg-gradient-to-r from-slate-500 to-slate-600 flex items-center justify-center text-white font-bold">
                <span>👤 Human 33%</span>
              </div>
              <div className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center text-white font-bold">
                <span>🤖 Auto 34%</span>
              </div>
              <div className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                <span>🤝 Hybrid 33%</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-3xl mb-2">👤</div>
                <div className="font-bold text-slate-900 mb-1">Human</div>
                <p className="text-sm text-slate-600">단순 업무 감소, 고부가가치 업무 집중</p>
              </div>
              <div>
                <div className="text-3xl mb-2">🤖</div>
                <div className="font-bold text-slate-900 mb-1">Machine</div>
                <p className="text-sm text-slate-600">데이터 처리 및 반복 업무 자동화</p>
              </div>
              <div>
                <div className="text-3xl mb-2">🤝</div>
                <div className="font-bold text-slate-900 mb-1">Hybrid</div>
                <p className="text-sm text-slate-600">AI가 초안을 잡고, 사람이 완성</p>
              </div>
            </div>
          </div>
        </section>

        {/* Understanding LLMs */}
        <section className="animate-fadeIn mb-20">
          <h2 className="text-4xl font-bold text-center text-slate-900 mb-4">Understanding LLMs: The &apos;Language Engine&apos;</h2>
          <p className="text-center text-slate-600 mb-12 text-lg max-w-3xl mx-auto">
            LLM(거대언어모델)은 만능이 아닙니다. &quot;언어적 패턴&quot; 처리는 탁월하지만, &quot;사실적 판단&quot;은 인간의 몫입니다.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="backdrop-blur-xl bg-white/40 border-t-4 border-green-500 border border-white/60 rounded-3xl p-8 shadow-xl">
              <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <span className="text-2xl">🟢</span> Good At
              </h3>

              <div className="space-y-4">
                {[
                  { num: '01', title: 'Summarization', desc: '방대한 문서를 핵심만 요약' },
                  { num: '02', title: 'Transformation', desc: '번역, 톤앤매너 변경, 포맷 변환' },
                  { num: '03', title: 'Ideation', desc: '브레인스토밍, 초기 아이디어 확장' },
                  { num: '04', title: 'Multimodal', desc: '이미지, 오디오, 비디오 복합 이해' }
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-4 p-4 rounded-xl bg-white/50 hover:bg-white/70 transition-all">
                    <span className="text-2xl font-bold text-blue-600">{item.num}</span>
                    <div>
                      <div className="font-bold text-slate-900">{item.title}</div>
                      <p className="text-sm text-slate-600">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="backdrop-blur-xl bg-white/40 border-t-4 border-red-500 border border-white/60 rounded-3xl p-8 shadow-xl">
              <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <span className="text-2xl">🔴</span> Bad At
              </h3>

              <div className="space-y-4">
                {[
                  { num: '01', title: 'Fact Checking', desc: '최신 정보나 사실 관계 확인 취약' },
                  { num: '02', title: 'Deep Context', desc: '회사 내부의 암묵적인 맥락 이해 불가' },
                  { num: '03', title: 'Ethical Judgment', desc: '가치 판단이나 책임지는 결정 불가' }
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-4 p-4 rounded-xl bg-white/50 hover:bg-white/70 transition-all">
                    <span className="text-2xl font-bold text-red-600">{item.num}</span>
                    <div>
                      <div className="font-bold text-slate-900">{item.title}</div>
                      <p className="text-sm text-slate-600">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Role Strategy */}
        <section className="animate-fadeIn mb-20">
          <h2 className="text-4xl font-bold text-center text-slate-900 mb-12">Role Strategy Guide</h2>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: '🤖',
                title: 'Auto (LLM)',
                question: '규칙이 있고 반복적인가?',
                features: ['정답이 정해진 단순 변환', '방대한 데이터 요약', '초안 작성 (0 to 1)'],
                action: '과감하게 위임 (Delegation)',
                color: 'purple'
              },
              {
                icon: '✨',
                title: 'Augment (Co-pilot)',
                question: '초안은 AI가, 판단은 사람이?',
                features: ['아이디어 확장/브레인스토밍', '비판적 피드백 요청', '복잡한 데이터 분석'],
                action: '생산성 2배 증폭 (Augmentation)',
                color: 'blue'
              },
              {
                icon: '👤',
                title: 'Human Only',
                question: '공감, 윤리, 맥락이 필요한가?',
                features: ['최종 의사결정 및 책임', '정치적/윤리적 판단', '관계 형성 및 소통'],
                action: '깊이 더하기 (Human Touch)',
                color: 'slate'
              }
            ].map((role, idx) => (
              <div key={idx} className={`backdrop-blur-xl bg-white/40 border-t-4 border-${role.color}-500 border border-white/60 rounded-3xl p-6 shadow-xl hover:shadow-2xl hover:scale-105 transition-all`}>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-4xl">{role.icon}</span>
                  <h3 className="text-xl font-bold text-slate-900">{role.title}</h3>
                </div>

                <p className="font-semibold text-blue-600 mb-4">{role.question}</p>

                <ul className="space-y-2 mb-6">
                  {role.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                      <span className="text-blue-600 font-bold">•</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className={`bg-gradient-to-r from-${role.color}-500/10 to-${role.color}-600/10 border border-${role.color}-300 rounded-xl p-3 text-center font-bold text-${role.color}-700`}>
                  {role.action}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Leader Reflection */}
        <section className="animate-fadeIn mb-20">
          <h2 className="text-4xl font-bold text-center text-slate-900 mb-4">Leader&apos;s Reflection</h2>
          <p className="text-center text-slate-600 mb-12 text-lg">
            팀 리더로서 가장 많은 시간을 쓰는 3가지 핵심 업무를 적어보세요
          </p>

          <div className="backdrop-blur-xl bg-white/40 border border-white/60 rounded-3xl p-8 shadow-xl max-w-3xl mx-auto">
            {(['task1', 'task2', 'task3'] as const).map((task, idx) => (
              <div key={task} className="mb-6">
                <label className="block font-bold text-slate-900 mb-2">Task {idx + 1}:</label>
                <textarea
                  value={leaderTasks[task]}
                  onChange={(e) => handleTaskChange(task, e.target.value)}
                  rows={3}
                  placeholder={`예: ${idx === 0 ? '주간 성과 보고서 작성 및 경영진 보고' : idx === 1 ? '팀원 1:1 미팅 및 성과 관리' : '신규 프로젝트 기획 및 예산 수립'}`}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/50 backdrop-blur-sm"
                />
              </div>
            ))}

            <button
              onClick={saveTasks}
              className="w-full mt-4 px-8 py-4 bg-slate-900 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all"
            >
              💾 저장하기
            </button>
          </div>
        </section>

        {/* Workflow Unbundling */}
        <section className="animate-fadeIn">
          <h2 className="text-4xl font-bold text-center text-slate-900 mb-4">Workflow Unbundling Practice</h2>
          <p className="text-center text-slate-600 mb-12 text-lg">
            &quot;자동화는 업무를 쪼개는 것에서 시작합니다&quot;
          </p>

          <div className="backdrop-blur-xl bg-white/40 border border-white/60 rounded-3xl p-8 shadow-xl">
            <div className="flex justify-between items-start mb-8 flex-wrap gap-4">
              <div>
                <div className="inline-block px-4 py-2 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-300/40 rounded-full text-indigo-700 font-semibold text-sm mb-3">
                  EXAMPLE SCENARIO
                </div>
                <h3 className="text-2xl font-bold text-slate-900">주간 팀 성과 보고 (Weekly Report)</h3>
              </div>
              <button
                onClick={resetWorkflow}
                className="px-6 py-3 bg-indigo-100 border border-indigo-300 text-indigo-700 font-semibold rounded-xl hover:bg-indigo-200 transition-all"
              >
                🔄 Reset
              </button>
            </div>

            {/* Workflow Steps */}
            <div className="relative pl-12 mb-8">
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-transparent via-blue-300 to-transparent"></div>

              {workflowSteps.map((step) => (
                <div key={step.id} className="relative mb-6">
                  <div className={`absolute left-[-1.75rem] w-12 h-12 rounded-full border-4 ${getRoleColor(step.role)} bg-white flex items-center justify-center text-2xl z-10`}>
                    {getRoleIcon(step.role)}
                  </div>

                  <div className="backdrop-blur-sm bg-white/50 rounded-2xl p-6 ml-4 hover:bg-white/70 transition-all">
                    <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
                      <span className="font-bold text-blue-600">Step {step.id}</span>
                      <select
                        value={step.role}
                        onChange={(e) => updateRole(step.id, e.target.value as any)}
                        className={`px-4 py-2 ${getRoleBg(step.role)} text-white font-semibold rounded-lg cursor-pointer`}
                      >
                        <option value="human">👤 Human</option>
                        <option value="copilot">✨ Co-pilot</option>
                        <option value="llm">🤖 Auto (LLM)</option>
                      </select>
                    </div>
                    <textarea
                      value={step.name}
                      readOnly
                      rows={2}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-white/30 text-slate-700 text-sm"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="backdrop-blur-sm bg-white/50 rounded-2xl p-6 text-center">
                <div className="text-4xl mb-2">🤖</div>
                <div className="text-sm text-slate-600 mb-1">Auto Steps</div>
                <div className="text-3xl font-bold text-purple-600">{counts.llm}</div>
              </div>
              <div className="backdrop-blur-sm bg-white/50 rounded-2xl p-6 text-center">
                <div className="text-4xl mb-2">✨</div>
                <div className="text-sm text-slate-600 mb-1">Augmented Steps</div>
                <div className="text-3xl font-bold text-blue-600">{counts.copilot}</div>
              </div>
              <div className="backdrop-blur-sm bg-white/50 rounded-2xl p-6 text-center">
                <div className="text-4xl mb-2">👤</div>
                <div className="text-sm text-slate-600 mb-1">Human Steps</div>
                <div className="text-3xl font-bold text-slate-600">{counts.human}</div>
              </div>
            </div>

            {/* Simulation Analysis */}
            <div className="bg-gradient-to-r from-indigo-50/80 to-purple-50/80 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-slate-900 mb-2">📊 Simulation Analysis</h3>
              <p className="text-slate-600 mb-6">
                정답은 없습니다. 위 단계의 역할을 이리저리 바꿔보며 어떤 리스크와 관리 포인트가 발생하는지 시뮬레이션 해보세요.
              </p>

              <div className="space-y-4">
                {workflowSteps.map((step) => {
                  const scenario = stepScenarios[step.id]?.[step.role];
                  if (!scenario) return null;

                  return (
                    <div key={step.id} className={`bg-white/70 rounded-xl p-5 border-l-4 ${getRoleColor(step.role).replace('border-', 'border-l-')}`}>
                      <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
                        <span className="font-bold text-blue-600">Step {step.id}</span>
                        <span className="text-sm font-semibold px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
                          {getRoleIcon(step.role)} {step.role.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-sm text-slate-700 mb-3 font-medium">
                        {step.name.substring(0, 60)}...
                      </div>
                      <div className="space-y-2">
                        <div>
                          <strong className="text-slate-900">상황:</strong>
                          <p className="text-slate-600 text-sm mt-1">{scenario.situation}</p>
                        </div>
                        <div>
                          <strong className="text-slate-900">리스크:</strong>
                          <p className="text-slate-600 text-sm mt-1">{scenario.risk}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between gap-4 relative mt-16">
          {onPrevious && (
            <button
              onClick={onPrevious}
              className="relative group inline-flex items-center px-8 py-4 backdrop-blur-md bg-white/60 border-2 border-slate-300 text-slate-700 text-lg font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:-translate-y-0.5"
            >
              <svg className="mr-3 w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
              </svg>
              <span className="relative">이전</span>
            </button>
          )}

          <button
            onClick={onNext}
            className="group relative z-50 cursor-pointer inline-flex items-center justify-center gap-4 px-12 py-6 bg-slate-900 text-white text-xl font-bold rounded-2xl overflow-hidden shadow-2xl shadow-slate-900/30 hover:shadow-2xl hover:shadow-blue-900/30 transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 ml-auto"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <span className="relative">다음: AI 컨설팅</span>
            <svg className="relative w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
