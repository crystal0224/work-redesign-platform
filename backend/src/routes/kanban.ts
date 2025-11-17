import express, { Request, Response } from 'express';

const router = express.Router();

interface KanbanItem {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'doing' | 'done';
  details?: {
    tools: string[];
    automation: 'high' | 'medium' | 'low';
    priority: number;
  };
}

interface ProcessFlowNode {
  id: string;
  label: string;
  type: 'start' | 'process' | 'decision' | 'end';
  x: number;
  y: number;
  children?: ProcessFlowNode[];
}

let kanbanData: {
  items: KanbanItem[];
  processFlow: ProcessFlowNode[];
} = {
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
router.get('/', (req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      data: kanbanData
    });
  } catch (error) {
    console.error('Error fetching kanban data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch kanban data'
    });
  }
});

// 칸반 아이템 상태 업데이트
router.patch('/items/:itemId', (req: Request, res: Response) => {
  try {
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
  } catch (error) {
    console.error('Error updating kanban item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update kanban item'
    });
  }
});

// 새로운 칸반 아이템 추가
router.post('/items', (req: Request, res: Response) => {
  try {
    const { title, description, status = 'todo', details } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Title and description are required'
      });
    }

    const newItem: KanbanItem = {
      id: Date.now().toString(),
      title,
      description,
      status: status as 'todo' | 'doing' | 'done',
      details
    };

    kanbanData.items.push(newItem);

    res.status(201).json({
      success: true,
      data: newItem
    });
  } catch (error) {
    console.error('Error creating kanban item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create kanban item'
    });
  }
});

// 칸반 아이템 삭제
router.delete('/items/:itemId', (req: Request, res: Response) => {
  try {
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
  } catch (error) {
    console.error('Error deleting kanban item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete kanban item'
    });
  }
});

// 프로세스 플로우 업데이트
router.put('/process-flow', (req: Request, res: Response) => {
  try {
    const { processFlow } = req.body;

    if (!Array.isArray(processFlow)) {
      return res.status(400).json({
        success: false,
        message: 'Process flow must be an array'
      });
    }

    kanbanData.processFlow = processFlow;

    res.json({
      success: true,
      data: kanbanData.processFlow
    });
  } catch (error) {
    console.error('Error updating process flow:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update process flow'
    });
  }
});

// 칸반 데이터 전체 업데이트
router.put('/', (req: Request, res: Response) => {
  try {
    const { items, processFlow } = req.body;

    if (items) {
      kanbanData.items = items;
    }

    if (processFlow) {
      kanbanData.processFlow = processFlow;
    }

    res.json({
      success: true,
      data: kanbanData
    });
  } catch (error) {
    console.error('Error updating kanban data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update kanban data'
    });
  }
});

export default router;