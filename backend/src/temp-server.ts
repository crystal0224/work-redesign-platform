import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 4000;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));
app.use(express.json());

// Mock data store
const workshops = new Map();
let workshopIdCounter = 1;

// Workshop routes
app.post('/api/workshops', (req, res) => {
  const { title, description, mission } = req.body;

  const workshop = {
    id: `ws_${workshopIdCounter++}`,
    title: title || '새 워크샵',
    description: description || '',
    mission: mission || '',
    domains: [],
    tasks: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  workshops.set(workshop.id, workshop);

  res.status(201).json({
    success: true,
    id: workshop.id,
    data: workshop
  });
});

app.get('/api/workshops/:id', (req, res) => {
  const workshop = workshops.get(req.params.id);

  if (!workshop) {
    return res.status(404).json({
      success: false,
      error: 'Workshop not found'
    });
  }

  res.json({
    success: true,
    data: workshop
  });
});

app.put('/api/workshops/:id', (req, res) => {
  const workshop = workshops.get(req.params.id);

  if (!workshop) {
    return res.status(404).json({
      success: false,
      error: 'Workshop not found'
    });
  }

  const updated = {
    ...workshop,
    ...req.body,
    updatedAt: new Date().toISOString()
  };

  workshops.set(req.params.id, updated);

  res.json({
    success: true,
    data: updated
  });
});

// Task extraction mock endpoint
app.post('/api/workshops/:id/extract-tasks', (req, res) => {
  const workshop = workshops.get(req.params.id);

  if (!workshop) {
    return res.status(404).json({
      success: false,
      error: 'Workshop not found'
    });
  }

  // Mock task extraction - matching ExtractedTask interface
  const mockTasks = [
    {
      id: `task_1`,
      title: '고객 문의 처리',
      description: '이메일 확인 및 답변 작업',
      domain: workshop.domains[0] || '기타',
      estimatedStatus: 'Progress',
      frequency: 'Daily',
      automationPotential: 'High',
      source: 'manual'
    },
    {
      id: `task_2`,
      title: '데이터 분석',
      description: '주간 리포트 작성 및 검토',
      domain: workshop.domains[1] || '기타',
      estimatedStatus: 'Planned',
      frequency: 'Weekly',
      automationPotential: 'Medium',
      source: 'manual'
    },
    {
      id: `task_3`,
      title: '회의 참석',
      description: '팀 미팅 및 보고',
      domain: workshop.domains[2] || '기타',
      estimatedStatus: 'Progress',
      frequency: 'Weekly',
      automationPotential: 'Low',
      source: 'manual'
    }
  ];

  res.json({
    success: true,
    data: {
      tasks: mockTasks
    }
  });
});

// AI Consulting Chat endpoint
app.post('/api/consulting/chat', (req, res) => {
  const { workshopId, taskTitle, taskDescription, message, conversationHistory } = req.body;

  console.log('💬 AI Consulting Chat Request:', {
    workshopId,
    taskTitle,
    message,
    historyLength: conversationHistory?.length || 0
  });

  // Simulate AI response based on conversation context
  const messageCount = conversationHistory?.length || 0;

  let aiResponse = '';

  if (messageCount === 0) {
    // Initial greeting
    aiResponse = `안녕하세요! AI 자동화 컨설턴트입니다. "${taskTitle}" 업무의 자동화 방안을 함께 설계해보겠습니다.\n\n먼저, 이 업무의 주요 목적과 현재 어떤 방식으로 수행되고 있는지 설명해주시겠어요?`;
  } else if (messageCount === 2) {
    // Second response
    aiResponse = `감사합니다. 말씀하신 내용을 잘 이해했습니다.\n\n다음으로, 이 업무를 수행할 때 가장 시간이 많이 걸리거나 반복적인 부분은 무엇인가요? 구체적으로 알려주시면 자동화 포인트를 찾는 데 도움이 됩니다.`;
  } else if (messageCount === 4) {
    // Third response
    aiResponse = `좋습니다. 그 부분은 충분히 자동화할 수 있을 것 같습니다.\n\n이 업무를 자동화했을 때 기대하는 효과는 무엇인가요?\n• 시간 절감\n• 정확도 향상\n• 업무 효율성 개선\n• 기타`;
  } else if (messageCount === 6) {
    // Fourth response
    aiResponse = `훌륭합니다! 그렇다면 이 업무 프로세스를 단계별로 나누어 볼까요?\n\n1단계부터 마지막 단계까지 어떤 순서로 진행되는지 설명해주세요. 각 단계에서 사람이 판단해야 하는 부분과 규칙적으로 반복되는 부분을 구분해주시면 더욱 좋습니다.`;
  } else if (messageCount >= 8) {
    // Final responses
    aiResponse = `완벽합니다! 지금까지 말씀해주신 내용을 바탕으로 자동화 워크플로우를 설계할 준비가 되었습니다.\n\n최종적으로, 이 자동화 솔루션에서 반드시 사람의 검토나 승인이 필요한 단계가 있나요? 있다면 어떤 부분인지 알려주세요.\n\n준비가 되셨다면 '대화 완료' 버튼을 눌러 워크플로우 설계 단계로 넘어가시면 됩니다.`;
  } else {
    // Generic response
    aiResponse = `잘 이해했습니다. 더 자세히 알려주세요. 구체적인 내용이 있으면 더 정확한 자동화 방안을 제시할 수 있습니다.`;
  }

  res.json({
    success: true,
    message: aiResponse,
    timestamp: new Date().toISOString()
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`✅ Temporary backend server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});
