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
