import express from 'express';
import {
  createReceipt,
  getReceipts,
  getReceiptById
} from '../controllers/ReciptController.js';

const router = express.Router();

// Create a new receipt
router.post('/', createReceipt);

// Get all receipts
router.get('/', getReceipts);

// Get a single receipt by ID
router.get('/:id', getReceiptById);

export const ReceiptRouter = router;