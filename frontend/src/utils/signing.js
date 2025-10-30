import { getSigner } from './wallet';
import { Signature, verifyMessage, hexlify, toUtf8Bytes } from 'ethers';

/**
 * Create a signed order for Hyperliquid
 * Uses simple message signing - Hyperliquid will verify the signature on their end
 */
export async function createSignedOrder({ 
  address, 
  assetIndex, 
  isBuy, 
  size, 
  price, 
  reduceOnly = false 
}) {
  try {
    const signer = await getSigner();
    
    // Create the order action payload according to Hyperliquid spec
    const action = {
      type: 'order',
      orders: [
        {
          a: assetIndex,           // asset index
          b: isBuy,                // is buy
          p: price,                // price as string
          s: size,                 // size as string
          r: reduceOnly,           // reduce only
          t: { 
            limit: { 
              tif: 'Gtc'          // time in force: Good til cancelled
            } 
          }
        }
      ],
      grouping: 'na'
    };

    const nonce = Date.now();

    // Construct message for personal_sign: JSON.stringify(action) + nonce
    const actionString = JSON.stringify(action);
    const messageToSign = actionString + nonce.toString();
    console.log('📝 personal_sign message (prefix):', messageToSign.slice(0, 120) + '...');
    
    // Get the signer's address to verify it matches
    const signerAddress = await signer.getAddress();
    console.log('🔍 Signer address from MetaMask:', signerAddress);
    console.log('🔍 Expected address from props:', address);
    console.log('🔍 Addresses match:', signerAddress.toLowerCase() === address.toLowerCase());
    
    // Sign with eth_sign (no EIP-191 prefix) to match Hyperliquid recovery
    const messageHex = hexlify(toUtf8Bytes(messageToSign));
    const signatureHex = await window.ethereum.request({
      method: 'eth_sign',
      params: [signerAddress, messageHex]
    });
    
    console.log('✍️ Signature created (hex):', signatureHex);

    // Parse into r,s,v object (expected by Hyperliquid)
    const sig = Signature.from(signatureHex);
    const signature = { r: sig.r.replace(/^0x/, ''), s: sig.s.replace(/^0x/, ''), v: sig.v };
    console.log('📍 User address:', address);
    console.log('📍 Signer address:', signerAddress);
    
    // Note: verifyMessage uses EIP-191 prefix; skip local verification for eth_sign
    
    // Include vaultAddress = user's main wallet (non-API wallet flow)
    return {
      action,
      nonce,
      signature
    };
  } catch (error) {
    console.error('Error creating signed order:', error);
    throw error;
  }
}

/**
 * Format price to match market specifications
 */
export function formatPrice(price, szDecimals = 8) {
  return Number(price).toFixed(szDecimals);
}

/**
 * Format size to match market specifications
 */
export function formatSize(size, szDecimals = 8) {
  return Number(size).toFixed(szDecimals);
}

