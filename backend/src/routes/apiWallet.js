import express from 'express';
import { 
  hasApiWallet, 
  getApiWallet,
  createAndAuthorizeApiWallet,
  authorizeApiWalletOnHyperliquid,
  getAuthorizationMessage
} from '../services/apiWalletManager.js';

const router = express.Router();

/**
 * Check if user has an API wallet
 */
router.get('/check/:address', (req, res) => {
  try {
    const { address } = req.params;
    const exists = hasApiWallet(address);
    const wallet = exists ? getApiWallet(address) : null;
    
    res.json({
      exists,
      apiWalletAddress: wallet?.apiWalletAddress,
      authorized: wallet?.authorized || false
    });
  } catch (error) {
    console.error('Error checking API wallet:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Create a new API wallet for user
 */
router.post('/create', async (req, res) => {
  try {
    const { userAddress } = req.body;
    
    if (!userAddress) {
      return res.status(400).json({ error: 'userAddress is required' });
    }
    
    // Check if wallet already exists
    if (hasApiWallet(userAddress)) {
      const existing = getApiWallet(userAddress);
      return res.json({
        exists: true,
        apiWalletAddress: existing.apiWalletAddress,
        authorized: existing.authorized,
        message: 'API wallet already exists'
      });
    }
    
    // Generate new API wallet
    const result = await createAndAuthorizeApiWallet(userAddress);
    
    // Get authorization data for frontend to sign
    const authMessage = getAuthorizationMessage(userAddress, result.apiWalletAddress);
    
    res.json({
      success: true,
      apiWalletAddress: result.apiWalletAddress,
      needsAuthorization: true,
      authMessage: authMessage,
      message: 'API wallet created. Please authorize it.'
    });
  } catch (error) {
    console.error('Error creating API wallet:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Authorize API wallet with signed data from user
 */
router.post('/authorize', async (req, res) => {
  try {
    const { userAddress, apiWalletAddress, signedAction } = req.body;
    
    if (!userAddress || !apiWalletAddress || !signedAction) {
      return res.status(400).json({ 
        error: 'userAddress, apiWalletAddress, and signedAction are required' 
      });
    }
    
    // Send authorization to Hyperliquid
    const result = await authorizeApiWalletOnHyperliquid(
      userAddress,
      apiWalletAddress,
      signedAction
    );
    
    res.json({
      success: true,
      result: result,
      message: 'API wallet authorized successfully'
    });
  } catch (error) {
    console.error('Error authorizing API wallet:', error);
    res.status(500).json({ 
      error: error.message,
      details: error.response?.data 
    });
  }
});

export default router;

