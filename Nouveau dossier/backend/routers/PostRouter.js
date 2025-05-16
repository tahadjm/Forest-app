import express from 'express';
import { Router } from 'express';
import {identifier} from '../middlewares/identifier.js'
const router = Router();

router.get('/all-posts', );
router.get('/single-post', );
router.post('/create-post',identifier, );
router.get('/users', );

router.delete('/delete-post',identifier,);
router.put('/update-post',identifier,)
router.patch('/change-psw',identifier,)
router.patch('/forgetpsw',)
router.patch('/forgetpswvalidation',)



export const PostRouter =  router;