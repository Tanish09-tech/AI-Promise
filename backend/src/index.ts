import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRouter from './routes/apiRouter';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json({
  verify: (req: any, _res, buf) => {
    req.rawBody = buf;
  }
}));

// API routes
app.use('/api', apiRouter);

// Global 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 COMMIT Backend API Server running at http://localhost:${PORT}`);
  console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`=======================================================`);
});
