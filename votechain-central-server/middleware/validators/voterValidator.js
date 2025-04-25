import { body, query } from 'express-validator';

// Validation for creating a voter
export const createVoterValidation = [
  body('nationalId')
    .isInt()
    .withMessage('National ID must be a number')
    .notEmpty()
    .withMessage('National ID is required'),
  
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  
  body('fathersName')
    .trim()
    .notEmpty()
    .withMessage('Father\'s name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Father\'s name must be between 2 and 100 characters'),
  
  body('mothersName')
    .trim()
    .notEmpty()
    .withMessage('Mother\'s name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Mother\'s name must be between 2 and 100 characters'),
  
  body('dateOfBirth')
    .isISO8601()
    .withMessage('Invalid date format')
    .notEmpty()
    .withMessage('Date of birth is required'),
  
  body('bloodGroup')
    .trim()
    .notEmpty()
    .withMessage('Blood group is required')
    .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
    .withMessage('Invalid blood group'),
  
  body('postOffice')
    .trim()
    .notEmpty()
    .withMessage('Post office is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Post office must be between 2 and 100 characters'),
  
  body('postCode')
    .isInt()
    .withMessage('Post code must be a number')
    .notEmpty()
    .withMessage('Post code is required'),
  
  body('location')
    .trim()
    .notEmpty()
    .withMessage('Location is required')
    .isLength({ min: 2, max: 200 })
    .withMessage('Location must be between 2 and 200 characters'),
  
  body('faceId')
    .trim()
    .notEmpty()
    .withMessage('Face ID is required'),
  
  body('fingerprint')
    .trim()
    .notEmpty()
    .withMessage('Fingerprint is required')
];

// Validation for updating a voter
export const updateVoterValidation = [
  query('id')
    .isMongoId()
    .withMessage('Invalid voter ID'),
  
  body('nationalId')
    .optional()
    .isInt()
    .withMessage('National ID must be a number'),
  
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  
  body('fathersName')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Father\'s name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Father\'s name must be between 2 and 100 characters'),
  
  body('mothersName')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Mother\'s name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Mother\'s name must be between 2 and 100 characters'),
  
  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format'),
  
  body('bloodGroup')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Blood group is required')
    .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
    .withMessage('Invalid blood group'),
  
  body('postOffice')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Post office is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Post office must be between 2 and 100 characters'),
  
  body('postCode')
    .optional()
    .isInt()
    .withMessage('Post code must be a number'),
  
  body('location')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Location is required')
    .isLength({ min: 2, max: 200 })
    .withMessage('Location must be between 2 and 200 characters'),
  
  body('faceId')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Face ID is required'),
  
  body('fingerprint')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Fingerprint is required')
];

// Validation for getting voter by ID
export const getVoterByIdValidation = [
  query('id')
    .isMongoId()
    .withMessage('Invalid voter ID')
];

// Validation for getting voter by wallet address
export const getVoterByWalletValidation = [
  query('walletAddress')
    .isEthereumAddress()
    .withMessage('Invalid wallet address')
];

// Validation for deleting a voter
export const deleteVoterValidation = [
  query('id')
    .isMongoId()
    .withMessage('Invalid voter ID')
]; 