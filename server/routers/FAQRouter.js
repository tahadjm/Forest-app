import express from 'express';
import {
    getFaqs,
    createFaq,
    updateFaq,
    addFaqItem,
    deleteFaqItem,
    deleteFaq
} from '../controllers/FAQController.js';

const router = express.Router();

router.get('/', getFaqs);
router.post('/', createFaq);
router.patch('/:id', updateFaq);
router.post('/items/:id', addFaqItem);
router.delete('/:id/items/:faqId', deleteFaqItem);
router.delete('/:id/', deleteFaq);

export const FAQRouter =  router;