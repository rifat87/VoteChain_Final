import { ethers } from 'ethers';
import { LOCAL_CONTRACT_ADDRESS, LOCAL_CONTRACT_ABI } from '../config/contract.js';

const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');
const contract = new ethers.Contract(LOCAL_CONTRACT_ADDRESS, LOCAL_CONTRACT_ABI, provider);

export async function registerCandidate(name, nationalId, location) {
  try {
    // Get the signer (election commission account)
    const signer = await provider.getSigner();
    console.log('Using signer address:', await signer.getAddress());
    
    // Check if the signer is the election commission
    const electionCommission = await contract.electionCommission();
    console.log('Election Commission address:', electionCommission);
    
    const contractWithSigner = contract.connect(signer);

    console.log('Registering candidate with params:', { name, nationalId, location });
    
    // Call the smart contract
    const tx = await contractWithSigner.registerCandidate(name, nationalId, location);
    console.log('Transaction hash:', tx.hash);
    
    const receipt = await tx.wait();
    console.log('Transaction confirmed in block:', receipt.blockNumber);

    return tx;
  } catch (error) {
    console.error('Detailed error:', {
      error: error,
      message: error.message,
      code: error.code,
      data: error.data,
      transaction: error.transaction
    });
    throw new Error('Failed to register candidate on blockchain: ' + error.message);
  }
} 