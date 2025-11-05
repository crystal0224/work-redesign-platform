import express from 'express';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import { AgentManager } from './agents/AgentManager.js';
import { AutomationEngine } from './automation/AutomationEngine.js';
import { WorkflowOrchestrator } from './orchestration/WorkflowOrchestrator.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

const agentManager = new AgentManager();
const automationEngine = new AutomationEngine();
const orchestrator = new WorkflowOrchestrator(agentManager, automationEngine);

app.use(express.json());
app.use(express.static('public'));

// API Routes
app.get('/api/agents', (req, res) => {
  res.json(agentManager.getAgents());
});

app.post('/api/workflows', async (req, res) => {
  try {
    const workflow = await orchestrator.createWorkflow(req.body);
    res.json(workflow);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/workflows/:id/execute', async (req, res) => {
  try {
    const result = await orchestrator.executeWorkflow(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// WebSocket connection handling
wss.on('connection', (ws) => {
  console.log('Client connected');

  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message);
      const response = await orchestrator.handleMessage(data);
      ws.send(JSON.stringify(response));
    } catch (error) {
      ws.send(JSON.stringify({ error: error.message }));
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Work Redesign Platform running on port ${PORT}`);
  console.log(`Multi-agent system initialized with ${agentManager.getAgents().length} agents`);
});