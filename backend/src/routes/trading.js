import express from 'express';
import { placeOrder } from '../services/hyperliquid.js';

const router = express.Router();

/**
 * POST /api/trading/order
 * Place a new order
 * Body should contain the signed order from MetaMask
 */
router.post('/order', async (req, res) => {
  try {
    const signedOrder = req.body;
    
    // Validate request
    if (!signedOrder.action || !signedOrder.signature || !signedOrder.nonce) {
      return res.status(400).json({ 
        error: 'Invalid order format',
        message: 'Order must include action, signature, and nonce' 
      });
    }

    // Log the order for debugging
    console.log('📦 Received order from frontend:', JSON.stringify(signedOrder, null, 2));
    console.log('📤 Sending to Hyperliquid /exchange endpoint...');

    const result = await placeOrder(signedOrder);
    console.log('✅ Order result:', JSON.stringify(result, null, 2));
    res.json(result);
  } catch (error) {
    console.error('Order placement error:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Failed to place order', 
      message: error.response?.data || error.message 
    });
  }
});

export default router;

