import { Router } from "express";
import { createNews,getAllNews, deleteNews, updateNews } from "../controllers/NewsSectionController.js";
const router = Router();


router.post("/",createNews)
router.get("/", getAllNews);
router.delete("/:id", deleteNews);
router.put("/:id", updateNews);

export const NewsRouter = router