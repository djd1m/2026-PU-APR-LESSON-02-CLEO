import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { authRouter } from './routes/auth.js';
import { uploadRouter } from './routes/upload.js';
import { analysisRouter } from './routes/analysis.js';
import { roastRouter } from './routes/roast.js';
import { shareRouter } from './routes/share.js';
import { subscriptionRouter } from './routes/subscription.js';
import { goalsRouter } from './routes/goals.js';
import { errorHandler } from './middleware/error-handler.js';

const app = express();
const PORT = parseInt(process.env.PORT || '4000', 10);

app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '0.1.0',
  });
});

app.use('/api/auth', authRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/analysis', analysisRouter);
app.use('/api/roast', roastRouter);
app.use('/api/share', shareRouter);
app.use('/api/subscription', subscriptionRouter);
app.use('/api/goals', goalsRouter);

app.use(errorHandler);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[cleo-rf/api] Server running on port ${PORT}`);
});

export default app;
