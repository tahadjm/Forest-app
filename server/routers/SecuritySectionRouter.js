import express from 'express';
import {
createSection,
getAllSections,
getSection,
updateSection,
deleteSection
} from '../controllers/SecuritySectionController.js';

const router = express.Router();

router.route('/')
.get(getAllSections)
.post(createSection);

router.get('/',getAllSections);
router.post('/',createSection)
router.patch('/:id',updateSection)
router.get('/:id',getSection)
router.delete('/',deleteSection);


export const SecuritySectionRouter = router;
