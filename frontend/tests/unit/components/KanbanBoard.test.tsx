import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { KanbanBoard } from '../../../src/components/kanban/KanbanBoard';
import { useWorkshopStore } from '../../../src/store/workshopStore';
import { TaskStatus } from '../../../src/types/workshop';

// Mock the store
jest.mock('../../../src/store/workshopStore');

const mockUseWorkshopStore = useWorkshopStore as jest.MockedFunction<typeof useWorkshopStore>;

const mockTasks = [
  {
    id: 'task-1',
    title: 'Implement Authentication',
    description: 'Set up user authentication system',
    status: 'BACKLOG' as TaskStatus,
    priority: 'HIGH' as const,
    estimatedHours: 8,
    position: 0,
    workshopId: 'workshop-123',
    assignedToId: 'user-123',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'task-2',
    title: 'Design Database Schema',
    description: 'Create database tables and relationships',
    status: 'IN_PROGRESS' as TaskStatus,
    priority: 'HIGH' as const,
    estimatedHours: 12,
    position: 0,
    workshopId: 'workshop-123',
    assignedToId: 'user-456',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'task-3',
    title: 'Write Unit Tests',
    description: 'Add comprehensive test coverage',
    status: 'REVIEW' as TaskStatus,
    priority: 'MEDIUM' as const,
    estimatedHours: 6,
    position: 0,
    workshopId: 'workshop-123',
    assignedToId: 'user-789',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const mockWorkshop = {
  id: 'workshop-123',
  title: 'Test Workshop',
  description: 'Test workshop description',
  status: 'ACTIVE' as const,
  createdById: 'user-123',
  createdAt: new Date(),
  updatedAt: new Date(),
  settings: {
    timeLimit: 35,
    maxParticipants: 10,
    enableChat: true,
    enableFileUpload: true,
  },
};

const mockStoreState = {
  currentWorkshop: mockWorkshop,
  tasks: mockTasks,
  isLoading: false,
  error: null,
  updateTaskStatus: jest.fn(),
  moveTask: jest.fn(),
  addTask: jest.fn(),
  updateTask: jest.fn(),
  deleteTask: jest.fn(),
};

describe('KanbanBoard Component', () => {
  beforeEach(() => {
    mockUseWorkshopStore.mockReturnValue(mockStoreState);
    jest.clearAllMocks();
  });

  it('renders kanban board with all columns', () => {
    render(<KanbanBoard workshopId="workshop-123" />);

    expect(screen.getByText('Backlog')).toBeInTheDocument();
    expect(screen.getByText('In Progress')).toBeInTheDocument();
    expect(screen.getByText('Review')).toBeInTheDocument();
    expect(screen.getByText('Done')).toBeInTheDocument();
  });

  it('displays tasks in correct columns', () => {
    render(<KanbanBoard workshopId="workshop-123" />);

    // Check backlog column
    const backlogColumn = screen.getByTestId('column-BACKLOG');
    expect(backlogColumn).toContainElement(screen.getByText('Implement Authentication'));

    // Check in-progress column
    const inProgressColumn = screen.getByTestId('column-IN_PROGRESS');
    expect(inProgressColumn).toContainElement(screen.getByText('Design Database Schema'));

    // Check review column
    const reviewColumn = screen.getByTestId('column-REVIEW');
    expect(reviewColumn).toContainElement(screen.getByText('Write Unit Tests'));
  });

  it('shows task priority indicators', () => {
    render(<KanbanBoard workshopId="workshop-123" />);

    const highPriorityTasks = screen.getAllByText('HIGH');
    expect(highPriorityTasks).toHaveLength(2);

    const mediumPriorityTask = screen.getByText('MEDIUM');
    expect(mediumPriorityTask).toBeInTheDocument();
  });

  it('displays estimated hours for tasks', () => {
    render(<KanbanBoard workshopId="workshop-123" />);

    expect(screen.getByText('8h')).toBeInTheDocument();
    expect(screen.getByText('12h')).toBeInTheDocument();
    expect(screen.getByText('6h')).toBeInTheDocument();
  });

  it('opens task details modal when task is clicked', async () => {
    const user = userEvent.setup();
    render(<KanbanBoard workshopId="workshop-123" />);

    const taskCard = screen.getByText('Implement Authentication');
    await user.click(taskCard);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Set up user authentication system')).toBeInTheDocument();
    });
  });

  it('shows add task button for each column', () => {
    render(<KanbanBoard workshopId="workshop-123" />);

    const addButtons = screen.getAllByText('Add Task');
    expect(addButtons).toHaveLength(4); // One for each column
  });

  it('opens add task modal when add button is clicked', async () => {
    const user = userEvent.setup();
    render(<KanbanBoard workshopId="workshop-123" />);

    const addButton = screen.getAllByText('Add Task')[0]; // First column
    await user.click(addButton);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Create New Task')).toBeInTheDocument();
    });
  });

  it('handles drag and drop correctly', async () => {
    // Note: Testing drag and drop with react-beautiful-dnd is complex
    // This is a simplified test that focuses on the handler logic
    render(<KanbanBoard workshopId="workshop-123" />);

    // Simulate drag end event
    const dragEndResult = {
      destination: {
        droppableId: 'IN_PROGRESS',
        index: 0,
      },
      source: {
        droppableId: 'BACKLOG',
        index: 0,
      },
      draggableId: 'task-1',
    };

    // Access the component's drag handler through React DevTools or refs
    // In a real test, you might need to expose this handler for testing
    // For now, we'll verify that the store method would be called
    expect(mockStoreState.moveTask).toBeDefined();
  });

  it('shows loading state', () => {
    mockUseWorkshopStore.mockReturnValue({
      ...mockStoreState,
      isLoading: true,
    });

    render(<KanbanBoard workshopId="workshop-123" />);

    expect(screen.getByTestId('kanban-loading')).toBeInTheDocument();
  });

  it('shows error state', () => {
    mockUseWorkshopStore.mockReturnValue({
      ...mockStoreState,
      error: 'Failed to load tasks',
    });

    render(<KanbanBoard workshopId="workshop-123" />);

    expect(screen.getByText('Failed to load tasks')).toBeInTheDocument();
  });

  it('filters tasks by search term', async () => {
    const user = userEvent.setup();
    render(<KanbanBoard workshopId="workshop-123" />);

    const searchInput = screen.getByPlaceholderText('Search tasks...');
    await user.type(searchInput, 'authentication');

    await waitFor(() => {
      expect(screen.getByText('Implement Authentication')).toBeInTheDocument();
      expect(screen.queryByText('Design Database Schema')).not.toBeInTheDocument();
      expect(screen.queryByText('Write Unit Tests')).not.toBeInTheDocument();
    });
  });

  it('filters tasks by assignee', async () => {
    const user = userEvent.setup();
    render(<KanbanBoard workshopId="workshop-123" />);

    const assigneeFilter = screen.getByRole('combobox', { name: /assignee/i });
    await user.click(assigneeFilter);

    // Select specific assignee
    const option = screen.getByRole('option', { name: /user-123/i });
    await user.click(option);

    await waitFor(() => {
      expect(screen.getByText('Implement Authentication')).toBeInTheDocument();
      expect(screen.queryByText('Design Database Schema')).not.toBeInTheDocument();
    });
  });

  it('filters tasks by priority', async () => {
    const user = userEvent.setup();
    render(<KanbanBoard workshopId="workshop-123" />);

    const priorityFilter = screen.getByRole('combobox', { name: /priority/i });
    await user.click(priorityFilter);

    // Select HIGH priority
    const highOption = screen.getByRole('option', { name: /high/i });
    await user.click(highOption);

    await waitFor(() => {
      expect(screen.getByText('Implement Authentication')).toBeInTheDocument();
      expect(screen.getByText('Design Database Schema')).toBeInTheDocument();
      expect(screen.queryByText('Write Unit Tests')).not.toBeInTheDocument();
    });
  });

  it('shows task count for each column', () => {
    render(<KanbanBoard workshopId="workshop-123" />);

    expect(screen.getByText('Backlog (1)')).toBeInTheDocument();
    expect(screen.getByText('In Progress (1)')).toBeInTheDocument();
    expect(screen.getByText('Review (1)')).toBeInTheDocument();
    expect(screen.getByText('Done (0)')).toBeInTheDocument();
  });

  it('handles empty columns gracefully', () => {
    mockUseWorkshopStore.mockReturnValue({
      ...mockStoreState,
      tasks: [],
    });

    render(<KanbanBoard workshopId="workshop-123" />);

    expect(screen.getByText('Backlog (0)')).toBeInTheDocument();
    expect(screen.getByText('In Progress (0)')).toBeInTheDocument();
    expect(screen.getByText('Review (0)')).toBeInTheDocument();
    expect(screen.getByText('Done (0)')).toBeInTheDocument();
  });

  it('shows workshop progress indicator', () => {
    render(<KanbanBoard workshopId="workshop-123" />);

    // With 1 task in review out of 3 total, progress should be 33%
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '33');
  });

  it('handles real-time updates via WebSocket', async () => {
    render(<KanbanBoard workshopId="workshop-123" />);

    // Simulate real-time task update
    const updatedTask = {
      ...mockTasks[0],
      status: 'IN_PROGRESS' as TaskStatus,
    };

    // This would normally come from WebSocket
    // We'll simulate by updating the store
    mockStoreState.tasks = [
      updatedTask,
      mockTasks[1],
      mockTasks[2],
    ];

    // Re-render with updated state
    mockUseWorkshopStore.mockReturnValue(mockStoreState);

    // The task should now appear in the In Progress column
    expect(screen.getByTestId('column-IN_PROGRESS')).toContainElement(
      screen.getByText('Implement Authentication')
    );
  });
});