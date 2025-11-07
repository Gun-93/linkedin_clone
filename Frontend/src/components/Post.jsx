import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

function timeSince(dateStr) {
  const s = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  const r = (v, n) => `${v} ${n}${v > 1 ? "s" : ""} ago`;
  if (s < 60) return r(s, "sec");
  const m = Math.floor(s / 60);
  if (m < 60) return r(m, "min");
  const h = Math.floor(m / 60);
  if (h < 24) return r(h, "hour");
  const d = Math.floor(h / 24);
  if (d < 7) return r(d, "day");
  const w = Math.floor(d / 7);
  if (w < 4) return r(w, "week");
  const mo = Math.floor(d / 30);
  if (mo < 12) return r(mo, "month");
  const y = Math.floor(d / 365);
  return r(y, "year");
}

export default function Post({ post, onChanged, onDeleted }) {
  const { user } = useAuth();
  const [content, setContent] = useState(post.content);
  const [editing, setEditing] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState([]);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);

  const isOwner = useMemo(
    () => user?._id === post?.user?._id,
    [user, post]
  );

  const API = "http://localhost:5000/api";
  useEffect(() => {
    if (!commentsOpen) return;
    const token = localStorage.getItem("token");
    axios
      .get(`${API}/posts/${post._id}/comments`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setComments(res.data))
      .catch((err) => console.error("Failed to load comments:", err));
  }, [commentsOpen]);

  const toggleLike = async () => {
    if (likeLoading) return;
    setLikeLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${API}/posts/${post._id}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onChanged({
        ...post,
        liked: res.data.liked,
        likesCount: res.data.likesCount,
      });
    } catch (err) {
      console.error("Like failed:", err);
    } finally {
      setLikeLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `${API}/posts/${post._id}`,
        { content },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onChanged(res.data);
      setEditing(false);
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  //  Delete post
  const handleDelete = async () => {
    if (!window.confirm("Delete this post?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API}/posts/${post._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      onDeleted(post._id);
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  //  Add comment
  const addComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${API}/posts/${post._id}/comments`,
        { text: commentText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComments([res.data, ...comments]);
      setCommentText("");
    } catch (err) {
      console.error("Add comment failed:", err);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        <div>
          <h4 className="font-semibold">{post.user?.name || "Anonymous"}</h4>
          <p className="text-sm text-gray-500">{timeSince(post.createdAt)}</p>
        </div>

        {isOwner && (
          <div className="space-x-2 text-sm">
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="text-blue-600 hover:underline">
                Edit
              </button>
            )}
            <button
              onClick={handleDelete}
              className="text-red-600 hover:underline">
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Post content */}
      {editing ? (
        <div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full border p-2 rounded"/>
          <div className="mt-2 space-x-2">
            <button
              onClick={handleUpdate}
              className="px-3 py-1 bg-blue-600 text-white rounded">
              Save
            </button>
            <button
              onClick={() => setEditing(false)}
              className="px-3 py-1 bg-gray-200 rounded">
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <p className="text-gray-700">{post.content}</p>
      )}

      {post.imageUrl && (
        <img
          src={`http://localhost:5000${post.imageUrl}`}
          alt="Post"
          className="mt-3 rounded-lg max-h-64 object-cover"
        />
      )}

      {/* Likes + Comments */}
      <div className="flex items-center space-x-4 mt-3 text-sm">
        <button
          onClick={toggleLike}
          disabled={likeLoading}
          className={`${
            post.liked ? "text-blue-600" : "text-gray-600"
          } hover:underline`}>
          {post.liked ? "💙 Liked" : "🤍 Like"} ({post.likesCount || 0})
        </button>
        <button
          onClick={() => setCommentsOpen(!commentsOpen)}
          className="text-gray-600 hover:underline">
          💬 {comments.length || post.commentsCount || 0} Comments
        </button>
      </div>

      {/* Comments Section */}
      {commentsOpen && (
        <div className="mt-3 border-t pt-2">
          <form onSubmit={addComment} className="flex gap-2 mb-2">
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 border rounded p-2 text-sm"/>
            <button className="text-blue-600 font-medium">Post</button>
          </form>

          {comments.map((c) => (
            <div key={c._id} className="mb-2">
              <p className="text-sm">
                <strong>{c.user?.name}</strong>: {c.text}
              </p>
              <p className="text-xs text-gray-400">
                {timeSince(c.createdAt)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
