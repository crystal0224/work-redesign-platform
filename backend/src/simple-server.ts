import express from 'express';
import cors from 'cors';

const app = express();
const port = process.env.API_PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
}));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Work Redesign Backend is running' });
});

// Workshops endpoint
app.post('/api/workshops', (req, res) => {
  res.json({
    success: true,
    id: `workshop_${Date.now()}`,
    message: 'Workshop created successfully'
  });
});

// File upload endpoint
app.post('/api/workshops/:id/files', (req, res) => {
  res.json({
    success: true,
    message: 'Files uploaded successfully'
  });
});

// Start server
app.listen(port, () => {
  console.log(`✅ Simple backend server running on port ${port}`);
  console.log(`🌐 http://localhost:${port}`);
});
