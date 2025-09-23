// src/routes/protectedRoutes.js
import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/secret", authMiddleware, (req, res) => {
  res.json({
    message: "Secret data unlocked 🚀",
    user: req.user, // yaha middleware ka output milega
  });
});

export default router;
