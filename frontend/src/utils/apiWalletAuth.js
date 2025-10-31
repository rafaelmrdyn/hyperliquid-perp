// Agent approval uses standard EIP-712 signing (no msgpack or hashing needed)

/**
 * Sign agent approval with MetaMask using Hyperliquid's format
 */
export async function signAgentApproval(userAddress, apiWalletAddress) {
  try {
    if (!window.ethereum) {
      throw new Error('MetaMask not found');
    }

    console.log('🔐 Signing agent approval...');
    console.log('   User (Vault):', userAddress);
    console.log('   API Wallet (Agent):', apiWalletAddress);

    const nonce = Date.now();

    // EIP-712 domain for agent approval (from Hyperliquid SDK)
    const domain = {
      name: 'HyperliquidSignTransaction',
      version: '1',
      chainId: 42161, // Arbitrum One (mainnet)
      verifyingContract: '0x0000000000000000000000000000000000000000'
    };

    // EIP-712 types for agent approval (ONLY 4 fields as per SDK - type and signatureChainId are NOT signed!)
    // Include EIP712Domain in types as some implementations require it
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

    // Message to sign (ONLY the 4 fields that are part of EIP-712)
    // Agent name must be 1-16 characters
    const message = {
      hyperliquidChain: 'Mainnet',
      agentAddress: apiWalletAddress,
      agentName: `Bot${Date.now().toString().slice(-6)}`, // Max 16 chars: "Bot" + last 6 digits of timestamp
      nonce: nonce
    };

    console.log('📝 Signing message (EIP-712):', message);
    
    // Prepare the full EIP-712 data
    const typedData = {
      domain,
      types,
      primaryType: 'HyperliquidTransaction:ApproveAgent',
      message
    };
    
    console.log('📋 Full EIP-712 data being sent to MetaMask:');
    console.log(JSON.stringify(typedData, null, 2));

    // Sign with MetaMask (primaryType is the full path)
    const signature = await window.ethereum.request({
      method: 'eth_signTypedData_v4',
      params: [userAddress, JSON.stringify(typedData)]
    });

    console.log('✅ Agent approval signed');

    // Parse signature into r, s, v
    const r = signature.slice(0, 66);
    const s = '0x' + signature.slice(66, 130);
    const v = parseInt(signature.slice(130, 132), 16);

    // Create the full action object (includes type and signatureChainId for API payload)
    const action = {
      type: 'approveAgent',
      hyperliquidChain: 'Mainnet',
      signatureChainId: '0xa4b1',
      agentAddress: apiWalletAddress,
      agentName: message.agentName, // Use the same short name from message
      nonce: nonce
    };

    // Return in Hyperliquid format (matching working example from docs)
    return {
      action,
      nonce,
      signature: {
        r: r, // Keep 0x prefix (as per working example)
        s: s, // Keep 0x prefix (as per working example)
        v
      },
      isFrontend: true,
      vaultAddress: null,
      expiresAfter: null
    };
  } catch (error) {
    console.error('Error signing agent approval:', error);
    throw error;
  }
}
