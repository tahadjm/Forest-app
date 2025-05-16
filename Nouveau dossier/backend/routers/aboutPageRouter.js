import express from 'express';
import {
  getAboutPage,
  createAboutPage,
  updateAboutPage,
  deleteAboutPage
} from '../controllers/aboutPageController.js';

const router = express.Router();

router.get('/', getAboutPage);
router.post('/', createAboutPage);
router.patch('/:id', updateAboutPage);
router.delete('/:id', deleteAboutPage);

export const AboutPageRouter = router;