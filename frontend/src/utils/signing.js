import { encode } from '@msgpack/msgpack';
import { keccak256 } from 'ethers';

/**
 * Create and sign an order with MetaMask using Hyperliquid's exact format
 */
export async function createSignedOrder({ 
  userAddress,
  assetIndex, 
  isBuy, 
  size, 
  price, 
  reduceOnly = false 
}) {
  try {
    if (!window.ethereum) {
      throw new Error('MetaMask not found');
    }

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

    console.log('📦 Creating and signing order with Hyperliquid format...');
    console.log('   User:', userAddress);
    console.log('   Action:', JSON.stringify(action).substring(0, 100) + '...');
    console.log('   Nonce:', nonce);

    // Create action hash using Hyperliquid's method
    const msgPackBytes = encode(action);
    const additionalBytesLength = 9; // no vault address
    const data = new Uint8Array(msgPackBytes.length + additionalBytesLength);
    data.set(msgPackBytes);
    const view = new DataView(data.buffer);
    // eslint-disable-next-line no-undef
    view.setBigUint64(msgPackBytes.length, BigInt(nonce), false);
    view.setUint8(msgPackBytes.length + 8, 0); // no vault
    const hash = keccak256(data);

    // Construct phantom agent
    const phantomAgent = {
      source: 'a', // mainnet
      connectionId: hash
    };

    // Try Arbitrum One chainId (42161)
    const domain = {
      name: 'Exchange',
      version: '1',
      chainId: 42161,
      verifyingContract: '0x0000000000000000000000000000000000000000'
    };

    const types = {
      Agent: [
        { name: 'source', type: 'string' },
        { name: 'connectionId', type: 'bytes32' }
      ]
    };

    console.log('📝 Phantom Agent:', phantomAgent);

    // Sign with MetaMask (will ask user to accept chainId mismatch)
    const signature = await window.ethereum.request({
      method: 'eth_signTypedData_v4',
      params: [userAddress, JSON.stringify({ 
        domain, 
        types, 
        primaryType: 'Agent', 
        message: phantomAgent 
      })]
    });

    console.log('✅ Order signed with MetaMask');

    // Parse signature into r, s, v
    const r = signature.slice(0, 66);
    const s = '0x' + signature.slice(66, 130);
    const v = parseInt(signature.slice(130, 132), 16);

    // Return signed order in Hyperliquid format
    return {
      action,
      nonce,
      signature: {
        r: r.slice(2), // Remove 0x prefix
        s: s.slice(2), // Remove 0x prefix
        v
      }
    };
  } catch (error) {
    console.error('Error creating/signing order:', error);
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

