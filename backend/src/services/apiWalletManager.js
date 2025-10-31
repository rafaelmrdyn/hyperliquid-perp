import { Wallet } from 'ethers';
import { Hyperliquid } from 'hyperliquid';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const API_WALLETS_FILE = path.join(__dirname, '..', '..', 'api-wallets.json');

/**
 * Load all API wallets from storage
 */
function loadApiWallets() {
  try {
    if (fs.existsSync(API_WALLETS_FILE)) {
      const data = fs.readFileSync(API_WALLETS_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading API wallets:', error);
  }
  return {};
}

/**
 * Save API wallets to storage
 */
function saveApiWallets(wallets) {
  try {
    fs.writeFileSync(API_WALLETS_FILE, JSON.stringify(wallets, null, 2));
    console.log('✅ API wallets saved');
  } catch (error) {
    console.error('Error saving API wallets:', error);
    throw error;
  }
}

/**
 * Get API wallet for a user
 */
export function getApiWallet(userAddress) {
  const allWallets = loadApiWallets();
  return allWallets[userAddress.toLowerCase()];
}

/**
 * Check if user has an API wallet
 */
export function hasApiWallet(userAddress) {
  return !!getApiWallet(userAddress);
}

/**
 * Create an API wallet for a user
 * Frontend will sign the authorization and send it back
 */
export async function createAndAuthorizeApiWallet(userAddress) {
  try {
    console.log(`🔑 Creating API wallet for ${userAddress}...`);
    
    // Generate new random wallet for API trading
    const apiWallet = Wallet.createRandom();
    
    console.log(`✅ Generated API wallet: ${apiWallet.address}`);
    
    const walletData = {
      userAddress: userAddress.toLowerCase(),
      apiWalletAddress: apiWallet.address,
      apiWalletPrivateKey: apiWallet.privateKey,
      createdAt: new Date().toISOString(),
      authorized: false
    };
    
    // Save to storage
    const allWallets = loadApiWallets();
    allWallets[userAddress.toLowerCase()] = walletData;
    saveApiWallets(allWallets);
    
    console.log(`💾 API wallet saved for ${userAddress}`);
    
    return {
      success: true,
      apiWalletAddress: apiWallet.address,
      needsAuthorization: true
    };
  } catch (error) {
    console.error('Error creating API wallet:', error);
    throw error;
  }
}

/**
 * Authorize API wallet using signed approval from frontend (MetaMask)
 * User signs with MetaMask, we forward to Hyperliquid
 */
export async function authorizeApiWalletOnHyperliquid(userAddress, apiWalletAddress, signedAuthData) {
  try {
    console.log(`✅ Authorizing API wallet on Hyperliquid...`);
    console.log(`   User (Vault): ${userAddress}`);
    console.log(`   API Wallet (Agent): ${apiWalletAddress}`);
    
    const wallet = getApiWallet(userAddress);
    if (!wallet) {
      throw new Error(`API wallet not found for ${userAddress}`);
    }
    
    // Verify signature locally to debug
    console.log('🔍 Verifying signature locally...');
    try {
      const { verifyTypedData } = await import('ethers');
      
      // EIP-712 domain matching what we signed (from Hyperliquid SDK)
      const domain = {
        name: 'HyperliquidSignTransaction',
        version: '1',
        chainId: 42161,
        verifyingContract: '0x0000000000000000000000000000000000000000'
      };
      
      const types = {
        EIP712Domain: [
          { name: 'name', type: 'string' },
          { name: 'version', type: 'string' },
          { name: 'chainId', type: 'uint256' },
          { name: 'verifyingContract', type: 'address' }
        ],
        'HyperliquidTransaction:ApproveAgent': [
          { name: 'hyperliquidChain', type: 'string' },
          { name: 'agentAddress', type: 'address' },
          { name: 'agentName', type: 'string' },
          { name: 'nonce', type: 'uint64' }
        ]
      };
      
      // Only sign the 4 EIP-712 fields (type and signatureChainId are NOT part of signature)
      const message = {
        hyperliquidChain: signedAuthData.action.hyperliquidChain,
        agentAddress: signedAuthData.action.agentAddress,
        agentName: signedAuthData.action.agentName,
        nonce: signedAuthData.action.nonce
      };
      
      // Reconstruct signature (r and s already have 0x prefix from frontend)
      const r = signedAuthData.signature.r.startsWith('0x') ? signedAuthData.signature.r : `0x${signedAuthData.signature.r}`;
      const s = signedAuthData.signature.s.startsWith('0x') ? signedAuthData.signature.s : `0x${signedAuthData.signature.s}`;
      const sig = `${r}${s.slice(2)}${signedAuthData.signature.v.toString(16).padStart(2, '0')}`;
      
      const recoveredAddress = verifyTypedData(domain, types, message, sig);
      console.log('   Expected address:', userAddress);
      console.log('   Recovered address:', recoveredAddress);
      
      if (recoveredAddress.toLowerCase() !== userAddress.toLowerCase()) {
        console.error('❌ SIGNATURE VERIFICATION FAILED - ADDRESS MISMATCH!');
      } else {
        console.log('✅ Local signature verification passed');
      }
    } catch (verifyError) {
      console.error('   Verification error:', verifyError.message);
    }
    
    // Send the signed approval from MetaMask to Hyperliquid
    console.log('📤 Sending agent approval to Hyperliquid:');
    console.log(JSON.stringify(signedAuthData, null, 2));
    
    try {
      const response = await axios.post('https://api.hyperliquid.xyz/exchange', signedAuthData, {
        headers: { 'Content-Type': 'application/json' }
      });
      
      console.log('📥 Hyperliquid agent approval response:', JSON.stringify(response.data, null, 2));
      
      // Check if Hyperliquid actually approved it
      if (response.data && response.data.status === 'err') {
        console.error('❌ Hyperliquid rejected agent approval:', response.data.response);
        throw new Error(`Hyperliquid rejected agent approval: ${response.data.response}`);
      }
      
      // Mark as authorized in our storage ONLY if Hyperliquid approved
      const allWallets = loadApiWallets();
      const walletData = allWallets[userAddress.toLowerCase()];
      if (walletData) {
        walletData.authorized = true;
        walletData.authorizedAt = new Date().toISOString();
        saveApiWallets(allWallets);
      }
      
      console.log('✅ Agent approval successful!');
      
      return {
        success: true,
        status: 'ok',
        message: 'API wallet authorized successfully',
        response: response.data
      };
    } catch (error) {
      console.error('❌ Error sending agent approval to Hyperliquid:');
      console.error('   Status:', error.response?.status);
      console.error('   Data:', JSON.stringify(error.response?.data, null, 2));
      console.error('   Message:', error.message);
      
      throw new Error(`Hyperliquid agent approval failed: ${error.response?.data || error.message}`);
    }
  } catch (error) {
    console.error('❌ Error authorizing API wallet:', error.message);
    throw error;
  }
}

/**
 * Get authorization message for user to sign
 */
export function getAuthorizationMessage(userAddress, apiWalletAddress) {
  return {
    agentAddress: apiWalletAddress,
    agentName: `Trading Bot ${new Date().getTime()}`,
    nonce: Date.now()
  };
}

