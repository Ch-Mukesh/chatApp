import express from "express"
import { protectRoute } from "../middleware/auth.middleware.js";
import { getUsersForSidebar,getMessages, sendMessages, deleteMessages } from "../controllers/message.controller.js"


const router = express.Router();

router.get("/users",protectRoute,getUsersForSidebar);

router.get("/:id",protectRoute,getMessages);

router.post("/send/:id",protectRoute,sendMessages);

router.delete("/:id",protectRoute, deleteMessages);

export default router;