import express from "express";
import { addChangelog, getChangelog, updateChangelog, deleteChangelog } from "../controllers/ChangelogController.js";

const router = express.Router();

router.post("/", addChangelog);
router.get("/", getChangelog);
router.put("/:id", updateChangelog);
router.delete("/:id", deleteChangelog);

export const ChangelogRouter =  router;