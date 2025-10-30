import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
// import rateLimit from 'express-rate-limit';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import marketRoutes from './routes/market.js';
import tradingRoutes from './routes/trading.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from backend directory
dotenv.config({ path: join(__dirname, '..', '.env') });

const app = express();
const PORT = process.env.PORT || 3001;

// Path to frontend build directory
const frontendBuildPath = join(__dirname, '..', '..', 'frontend', 'build');

// // Rate limiting
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100 // limit each IP to 100 requests per windowMs
// });

// Middleware
app.use(cors());
app.use(express.json());
// app.use(limiter);

// Routes
app.use('/api/market', marketRoutes);
app.use('/api/trading', tradingRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve React frontend static files
app.use(express.static(frontendBuildPath));

// Catch-all route to serve React app for any non-API routes
app.get('*', (req, res) => {
  res.sendFile(join(frontendBuildPath, 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal server error', 
    message: err.message 
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
  console.log(`📡 Hyperliquid API: ${process.env.HYPERLIQUID_API_URL}`);
  console.log(`🎨 Frontend served from: ${frontendBuildPath}`);
  console.log(`🌐 Open http://localhost:${PORT} in your browser`);
});

