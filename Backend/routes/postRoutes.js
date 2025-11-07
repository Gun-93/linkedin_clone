import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { auth } from "../middleware/auth.js";
import {
  listPosts,
  createPost,
  deletePost,
  toggleLike,
  listComments,
  addComment
} from "../controllers/postController.js";
import Post from "../models/Post.js";

const router = Router();

// Ensure uploads folder exists
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, "uploads/"),
  filename: (_, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});
const upload = multer({ storage });

// ✅ Fetch all posts
router.get("/", auth, listPosts);

// ✅ Fetch user’s own posts (for Profile)
router.get("/user", auth, async (req, res) => {
  try {
    const posts = await Post.find({ user: req.user.id })
      .populate("user", "name email")
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    console.error("Error fetching user posts:", err);
    res.status(500).json({ message: "Failed to fetch user posts" });
  }
});

// ✅ Create post
router.post("/", auth, upload.single("image"), createPost);

// ✅ Like / Unlike
router.post("/:id/like", auth, toggleLike);

// ✅ Delete post
router.delete("/:id", auth, deletePost);

// ✅ Comments
router.get("/:id/comments", auth, listComments);
router.post("/:id/comments", auth, addComment);

export default router;





