import express from 'express';
import { signAndPlaceOrder } from '../services/signer.js';

const router = express.Router();

/**
 * POST /api/trading/order
 * Place a new order using official Hyperliquid SDK
 * Body should contain: { action, nonce }
 */
router.post('/order', async (req, res) => {
  try {
    const { action, nonce } = req.body;
    
    // Validate request
    if (!action || !nonce) {
      return res.status(400).json({ 
        error: 'Invalid order format',
        message: 'Order must include action and nonce' 
      });
    }

    // Log the order
    console.log('📦 Received order from frontend:', JSON.stringify({ action, nonce }, null, 2));
    
    // Use Hyperliquid SDK to sign and place order
    const result = await signAndPlaceOrder(action, nonce);
    
    console.log('✅ Order placed successfully:', JSON.stringify(result, null, 2));
    res.json({ status: 'ok', response: result });
  } catch (error) {
    console.error('Order placement error:', error.message || error);
    res.status(500).json({ 
      error: 'Failed to place order', 
      message: error.message || 'Unknown error'
    });
  }
});

export default router;

