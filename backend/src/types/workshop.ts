export interface Workshop {
  id: string;
  name: string;
  domains: string[];
  participantCount: number;
  status: WorkshopStatus;
  createdAt: Date;
  updatedAt?: Date;
  analyzedAt?: Date;
  tasks: Task[];
  files: WorkshopFile[];
  fileIds: string[];
}

export interface Task {
  id: string;
  title: string;
  description: string;
  timeSpent: number;
  frequency: TaskFrequency;
  automation: AutomationLevel;
  automationMethod: string;
  category: string;
  sourceFileId: string;
  sourceFilename: string;
  workshopId: string;
  createdAt: Date;
}

export interface WorkshopFile {
  id: string;
  originalName: string;
  filename: string;
  mimetype: string;
  size: number;
  path: string;
  workshopId: string;
  uploadedAt: Date;
  status: FileStatus;
  content?: string;
}

export interface GeneratedTemplate {
  id: string;
  type: TemplateType;
  name: string;
  content: string;
  taskId: string;
}

export type WorkshopStatus =
  | 'domain_defined'
  | 'files_uploaded'
  | 'analyzing'
  | 'analyzed'
  | 'tools_generated'
  | 'completed'
  | 'error';

export type TaskFrequency = 'daily' | 'weekly' | 'monthly';

export type AutomationLevel = 'high' | 'medium' | 'low';

export type FileStatus = 'uploaded' | 'analyzing' | 'parsed' | 'analyzed' | 'error';

export type TemplateType =
  | 'ai_prompt'
  | 'n8n_workflow'
  | 'python_script'
  | 'javascript_code';

// Socket.IO Event Types
export interface AnalysisProgressEvent {
  percent: number;
  message: string;
}

export interface FileAnalysisStartEvent {
  fileId: string;
  filename: string;
}

export interface FileAnalysisCompleteEvent {
  fileId: string;
  filename: string;
  taskCount: number;
}

export interface AnalysisCompleteEvent {
  workshopId: string;
  totalTasks: number;
  totalFiles: number;
}

export interface AnalysisErrorEvent {
  message: string;
  error?: any;
}

export interface StartAnalysisPayload {
  workshopId: string;
  fileIds: string[];
  domains: string[];
}

// API Request/Response Types
export interface CreateWorkshopRequest {
  name: string;
  domains: string[];
  participantCount?: number;
}

export interface CreateWorkshopResponse {
  success: boolean;
  id: string;
  message: string;
}

export interface UploadFilesResponse {
  success: boolean;
  fileIds: string[];
  count: number;
  message: string;
}

export interface GenerateTemplatesRequest {
  workshopId: string;
  tasks: Task[];
}

export interface GenerateTemplatesResponse {
  success: boolean;
  templates: Omit<GeneratedTemplate, 'content'>[];
  downloadUrl: string;
  message: string;
}