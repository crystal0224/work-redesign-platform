/**
 * API Configuration
 *
 * 환경별로 API URL을 자동으로 설정합니다.
 * - Development: localhost:4000
 * - Production: Railway 배포 URL (환경 변수에서 가져옴)
 */

export const API_CONFIG = {
  // REST API Base URL
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',

  // WebSocket URL
  wsURL: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:4000',

  // API Endpoints
  endpoints: {
    // Workshop
    workshops: '/api/workshops',
    workshop: (id: string) => `/api/workshops/${id}`,

    // File Upload
    upload: '/api/upload',

    // AI Analysis
    analyzeText: '/api/analyze-text',
    extractTasks: (workshopId: string) => `/api/workshops/${workshopId}/extract-tasks`,
    aiAnalyze: '/api/ai/analyze',
    aiAnalysisStatus: (analysisId: string) => `/api/ai/analysis/${analysisId}`,

    // AI Consulting
    consulting: '/api/consulting/chat',
  },
};

/**
 * Helper function to build full URL
 */
export function buildURL(endpoint: string): string {
  return `${API_CONFIG.baseURL}${endpoint}`;
}

/**
 * Helper function for fetch with base URL
 */
export async function apiFetch(endpoint: string, options?: RequestInit) {
  const url = buildURL(endpoint);
  return fetch(url, options);
}
