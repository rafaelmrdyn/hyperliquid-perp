import express from 'express';
import { signAndPlaceOrder } from '../services/signer.js';

const router = express.Router();

/**
 * POST /api/trading/order
 * Place a new order using API wallet
 * Body should contain: { userAddress, action, nonce }
 */
router.post('/order', async (req, res) => {
  try {
    const { userAddress, action, nonce } = req.body;
    
    // Validate request
    if (!userAddress || !action) {
      return res.status(400).json({ 
        error: 'Invalid order format',
        message: 'Order must include userAddress and action' 
      });
    }

    // Log the order
    console.log('📦 Received order from frontend');
    console.log('   User:', userAddress);
    console.log('   Action:', JSON.stringify(action).substring(0, 100) + '...');
    
    // Sign and place order using API wallet
    const result = await signAndPlaceOrder(userAddress, action, nonce || Date.now());
    
    console.log('✅ Order placed successfully:', JSON.stringify(result, null, 2));
    res.json({ status: 'ok', response: result });
  } catch (error) {
    console.error('Order placement error:', error.message || error);
    
    // Return 400 for user errors (better for frontend to display)
    res.status(400).json({ 
      status: 'err',
      error: 'Failed to place order', 
      message: error.message || 'Unknown error'
    });
  }
});

export default router;

