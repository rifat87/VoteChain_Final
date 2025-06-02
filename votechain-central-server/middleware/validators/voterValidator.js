import { body, query, param } from 'express-validator';

// Validation for creating a voter
export const createVoterValidation = [
  body('nationalId')
    .notEmpty()
    .withMessage('National ID is required')
    .isString()
    .withMessage('National ID must be a string'),
  
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .isString()
    .withMessage('Name must be a string'),
  
  body('fathersName')
    .notEmpty()
    .withMessage('Father\'s name is required')
    .isString()
    .withMessage('Father\'s name must be a string'),
  
  body('mothersName')
    .notEmpty()
    .withMessage('Mother\'s name is required')
    .isString()
    .withMessage('Mother\'s name must be a string'),
  
  body('dateOfBirth')
    .notEmpty()
    .withMessage('Date of birth is required')
    .isISO8601()
    .withMessage('Date of birth must be a valid date'),
  
  body('bloodGroup')
    .notEmpty()
    .withMessage('Blood group is required')
    .isString()
    .withMessage('Blood group must be a string'),
  
  body('postOffice')
    .notEmpty()
    .withMessage('Post office is required')
    .isString()
    .withMessage('Post office must be a string'),
  
  body('postCode')
    .notEmpty()
    .withMessage('Post code is required')
    .isNumeric()
    .withMessage('Post code must be a number'),
  
  body('location')
    .notEmpty()
    .withMessage('Location is required')
    .isString()
    .withMessage('Location must be a string'),
  
  body('faceId')
    .notEmpty()
    .withMessage('Face ID is required')
    .isString()
    .withMessage('Face ID must be a string'),
  
  body('fingerprint')
    .optional()
    .isString()
    .withMessage('Fingerprint must be a string'),
  
  body('blockchainId')
    .notEmpty()
    .withMessage('Blockchain ID is required')
    .isString()
    .withMessage('Blockchain ID must be a string')
    .matches(/^0x[a-fA-F0-9]{64}$/)
    .withMessage('Blockchain ID must be a valid transaction hash')
];

// Validation for updating a voter
export const updateVoterValidation = [
  query('id')
    .notEmpty()
    .withMessage('Voter ID is required')
    .isMongoId()
    .withMessage('Invalid voter ID'),
  
  body('nationalId')
    .optional()
    .isString()
    .withMessage('National ID must be a string'),
  
  body('name')
    .optional()
    .isString()
    .withMessage('Name must be a string'),
  
  body('fathersName')
    .optional()
    .isString()
    .withMessage('Father\'s name must be a string'),
  
  body('mothersName')
    .optional()
    .isString()
    .withMessage('Mother\'s name must be a string'),
  
  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Date of birth must be a valid date'),
  
  body('bloodGroup')
    .optional()
    .isString()
    .withMessage('Blood group must be a string'),
  
  body('postOffice')
    .optional()
    .isString()
    .withMessage('Post office must be a string'),
  
  body('postCode')
    .optional()
    .isString()
    .withMessage('Post code must be a string'),
  
  body('location')
    .optional()
    .isString()
    .withMessage('Location must be a string'),
  
  body('faceId')
    .optional()
    .isString()
    .withMessage('Face ID must be a string'),
  
  body('fingerprint')
    .optional()
    .isString()
    .withMessage('Fingerprint must be a string'),
  
  body('walletAddress')
    .optional()
    .isString()
    .withMessage('Wallet address must be a string')
    .matches(/^0x[a-fA-F0-9]{40}$/)
    .withMessage('Wallet address must be a valid Ethereum address'),
  
  body('blockchainId')
    .optional()
    .isString()
    .withMessage('Blockchain ID must be a string')
    .matches(/^0x[a-fA-F0-9]{64}$/)
    .withMessage('Blockchain ID must be a valid transaction hash')
];

// Validation for getting voter by ID
export const getVoterByIdValidation = [
  query('id')
    .notEmpty()
    .withMessage('Voter ID is required')
    .isMongoId()
    .withMessage('Invalid voter ID')
];

// Validation for getting voter by wallet address
export const getVoterByWalletValidation = [
  query('walletAddress')
    .notEmpty()
    .withMessage('Wallet address is required')
    .isString()
    .withMessage('Wallet address must be a string')
    .matches(/^0x[a-fA-F0-9]{40}$/)
    .withMessage('Wallet address must be a valid Ethereum address')
];

// Validation for deleting a voter
export const deleteVoterValidation = [
  query('id')
    .notEmpty()
    .withMessage('Voter ID is required')
    .isMongoId()
    .withMessage('Invalid voter ID')
];

// Validation for verifying a voter
export const verifyVoterValidation = [
  query('id')
    .notEmpty()
    .withMessage('Voter ID is required')
    .isMongoId()
    .withMessage('Invalid voter ID'),
  body('verificationNotes')
    .optional()
    .isString()
    .withMessage('Verification notes must be a string')
    .isLength({ max: 500 })
    .withMessage('Verification notes must not exceed 500 characters')
]; 