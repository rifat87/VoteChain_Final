export const LOCAL_CONTRACT_ADDRESS = '0xYourContractAddressHere';

export const LOCAL_CONTRACT_ABI = [
  // Add your contract's ABI here
  {
    "constant": true,
    "inputs": [],
    "name": "yourFunctionName",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  }
  // Add more ABI entries as needed
]; 