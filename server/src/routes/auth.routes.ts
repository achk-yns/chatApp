const express = require("express");
const router = express.Router();
import AuthController from "../controllers/AuthController"

router.post("/login",AuthController.loginUser)
router.post("/register",AuthController.registerUser)


router.get("/otherusers",AuthController.getOthersUsers)
router.get("/requests",AuthController.getRequests)
router.post("/sendrequest",AuthController.SendRequest)





export default router; 