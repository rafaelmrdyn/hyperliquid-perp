import express from 'express';
import { getMarketInfo } from '../services/hyperliquid.js';

const router = express.Router();

/**
 * GET /api/market/info
 * Get all market information
 */
router.get('/info', async (req, res) => {
  try {
    const data = await getMarketInfo();
    res.json(data);
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to fetch market info', 
      message: error.message 
    });
  }
});

export default router;

