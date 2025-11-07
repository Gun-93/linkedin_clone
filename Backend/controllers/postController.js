import fs from "fs";
import path from "path";
import Post from "../models/Post.js";
import Comment from "../models/Comment.js";
function toClient(p, me) {
  const liked = me ? p.likes.map(String).includes(String(me)) : false;
  return {
    _id: p._id,
    content: p.content,
    imageUrl: p.imageUrl,
    createdAt: p.createdAt,
    user:
      p.user && {
        _id: p.user._id,
        name: p.user.name,
        avatarUrl: p.user.avatarUrl,
      },
    likesCount: p.likes?.length || 0,
    commentsCount: p.commentsCount ?? 0,
    liked,
  };
}

// ✅ Get all posts (public feed)
export async function listPosts(req, res) {
  try {
    const posts = await Post.aggregate([
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $lookup: {
          from: "comments",
          localField: "_id",
          foreignField: "post",
          as: "comments",
        },
      },
      { $addFields: { commentsCount: { $size: "$comments" } } },
      { $project: { comments: 0 } },
    ]);
    res.json(posts.map((p) => toClient(p, req.user?._id)));
  } catch (e) {
    console.error("❌ listPosts error:", e);
    res.status(500).json({ message: "Server error" });
  }
}

// ✅ Create a post (text + image optional)
export async function createPost(req, res) {
  try {
    console.log("📸 Incoming post data:", req.body);
    console.log("📁 Uploaded file:", req.file);
    console.log("🙋‍♂️ User:", req.user?._id);

    const { content } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    if (!content && !imageUrl) {
      return res
        .status(400)
        .json({ message: "Post content or image required" });
    }

    // ✅ use req.user._id instead of req.userId
    const post = await Post.create({ user: req.user._id, content, imageUrl });
    await post.populate("user", "_id name avatarUrl");

    res.status(201).json(toClient(post.toObject(), req.user._id));
  } catch (e) {
    console.error("❌ Post creation failed:", e);
    res.status(500).json({ message: e.message || "Server error" });
  }
}

// ✅ Update post
export async function updatePost(req, res) {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: "Not found" });
    if (String(post.user) !== String(req.user._id))
      return res.status(403).json({ message: "Forbidden" });

    post.content = content ?? post.content;
    await post.save();
    await post.populate("user", "_id name avatarUrl");
    res.json(toClient(post.toObject(), req.user._id));
  } catch (e) {
    console.error("❌ updatePost error:", e);
    res.status(500).json({ message: "Server error" });
  }
}

// ✅ Delete post
export async function deletePost(req, res) {
  try {
    const { id } = req.params;
    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: "Not found" });
    if (String(post.user) !== String(req.user._id))
      return res.status(403).json({ message: "Forbidden" });

    // remove uploaded image if exists
    if (post.imageUrl?.startsWith("/uploads/")) {
      const filepath = path.join(
        process.cwd(),
        post.imageUrl.replace(/^\//, "")
      );
      fs.promises.unlink(filepath).catch(() => {});
    }

    await Comment.deleteMany({ post: id });
    await post.deleteOne();
    res.json({ ok: true });
  } catch (e) {
    console.error("❌ deletePost error:", e);
    res.status(500).json({ message: "Server error" });
  }
}

// ✅ Toggle like
export async function toggleLike(req, res) {
  try {
    const { id } = req.params;
    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: "Not found" });

    const idx = post.likes.findIndex((u) => String(u) === String(req.user._id));
    if (idx >= 0) post.likes.splice(idx, 1);
    else post.likes.push(req.user._id);
    await post.save();

    res.json({ likesCount: post.likes.length, liked: idx < 0 });
  } catch (e) {
    console.error("❌ toggleLike error:", e);
    res.status(500).json({ message: "Server error" });
  }
}

// ✅ Get comments for a post
export async function listComments(req, res) {
  try {
    const { id } = req.params;
    const comments = await Comment.find({ post: id })
      .sort({ createdAt: -1 })
      .populate("user", "_id name avatarUrl");
    res.json(comments);
  } catch (e) {
    console.error("❌ listComments error:", e);
    res.status(500).json({ message: "Server error" });
  }
}

// ✅ Add comment
export async function addComment(req, res) {
  try {
    const { id } = req.params;
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: "Text required" });

    const comment = await Comment.create({
      post: id,
      user: req.user._id,
      text,
    });
    await comment.populate("user", "_id name avatarUrl");

    res.status(201).json(comment);
  } catch (e) {
    console.error("❌ addComment error:", e);
    res.status(500).json({ message: "Server error" });
  }
}

