const express = require('express');
const cors = require('cors');

const app = express();
const port = 3001;

// 미들웨어
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());

// 요청 로깅 미들웨어
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  console.log('Headers:', req.headers);
  next();
});

// 칸반 데이터 (메모리에 저장)
let kanbanData = {
  items: [
    {
      id: '1',
      title: '문서 검토 및 승인',
      description: '제출된 문서의 형식과 내용을 검토하고 승인 처리',
      status: 'todo',
      details: {
        tools: ['문서관리시스템', '전자결재'],
        automation: 'medium',
        priority: 1
      }
    },
    {
      id: '2',
      title: '데이터 입력 및 검증',
      description: '시스템에 데이터를 입력하고 정확성을 검증',
      status: 'doing',
      details: {
        tools: ['ERP시스템', 'Excel'],
        automation: 'high',
        priority: 2
      }
    },
    {
      id: '3',
      title: '보고서 작성',
      description: '월간 업무 현황 보고서 작성 및 제출',
      status: 'done',
      details: {
        tools: ['PowerPoint', 'Word'],
        automation: 'low',
        priority: 3
      }
    }
  ],
  processFlow: [
    { id: '1', label: '업무 접수', type: 'start', x: 50, y: 50 },
    { id: '2', label: '분류 및 할당', type: 'process', x: 200, y: 50 },
    { id: '3', label: '검토 필요?', type: 'decision', x: 350, y: 50 },
    { id: '4', label: '처리 실행', type: 'process', x: 500, y: 50 },
    { id: '5', label: '완료', type: 'end', x: 650, y: 50 },
  ]
};

// 칸반 데이터 전체 조회
app.get('/api/kanban', (req, res) => {
  res.json({
    success: true,
    data: kanbanData
  });
});

// 칸반 아이템 상태 업데이트
app.patch('/api/kanban/items/:itemId', (req, res) => {
  const { itemId } = req.params;
  const { status } = req.body;

  if (!['todo', 'doing', 'done'].includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid status. Must be todo, doing, or done'
    });
  }

  const itemIndex = kanbanData.items.findIndex(item => item.id === itemId);

  if (itemIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Kanban item not found'
    });
  }

  kanbanData.items[itemIndex].status = status;

  res.json({
    success: true,
    data: kanbanData.items[itemIndex]
  });
});

// 새로운 칸반 아이템 추가
app.post('/api/kanban/items', (req, res) => {
  const { title, description, status = 'todo', details } = req.body;

  if (!title || !description) {
    return res.status(400).json({
      success: false,
      message: 'Title and description are required'
    });
  }

  const newItem = {
    id: Date.now().toString(),
    title,
    description,
    status,
    details
  };

  kanbanData.items.push(newItem);

  res.status(201).json({
    success: true,
    data: newItem
  });
});

// 칸반 아이템 삭제
app.delete('/api/kanban/items/:itemId', (req, res) => {
  const { itemId } = req.params;

  const itemIndex = kanbanData.items.findIndex(item => item.id === itemId);

  if (itemIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Kanban item not found'
    });
  }

  const deletedItem = kanbanData.items.splice(itemIndex, 1)[0];

  res.json({
    success: true,
    data: deletedItem
  });
});

// 헬스체크
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(port, () => {
  console.log(`🚀 Simple Kanban Server running on http://localhost:${port}`);
  console.log(`📊 Kanban API: http://localhost:${port}/api/kanban`);
});