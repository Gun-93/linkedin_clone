import { useState, useEffect } from "react";
import api from "../lib/api";
import CommentSection from "../components/CommentSection";

export default function Feed() {
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [posts, setPosts] = useState([]);
  const [user, setUser] = useState(null);

  const fetchUser = async () => {
    try {
      const res = await api.get("/users/me");
      setUser(res.data);
    } catch (err) {
      console.error("User fetch failed:", err);
    }
  };

  const fetchPosts = async () => {
    try {
      const res = await api.get("/posts");
      setPosts(res.data);
    } catch (err) {
      console.error("Failed to load posts:", err);
    }
  };

  const handlePost = async (e) => {
    e.preventDefault();
    if (!content.trim() && !image) return;
    try {
      const formData = new FormData();
      formData.append("content", content);
      if (image) formData.append("image", image);
      await api.post("/posts", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setContent("");
      setImage(null);
      fetchPosts();
    } catch (err) {
      console.error("Failed to post:", err);
    }
  };

  const toggleLike = async (postId) => {
    try {
      const res = await api.post(`/posts/${postId}/like`);
      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId
            ? { ...p, likesCount: res.data.likesCount, liked: res.data.liked }
            : p
        )
      );
    } catch (err) {
      console.error("Like failed:", err);
    }
  };

  const handleDelete = async (postId) => {
    try {
      await api.delete(`/posts/${postId}`);
      setPosts(posts.filter((p) => p._id !== postId));
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  useEffect(() => {
    fetchUser();
    fetchPosts();
  }, []);

  return (
    <div className="max-w-2xl mx-auto mt-10">
      <form
        onSubmit={handlePost}
        className="mb-6 bg-white shadow-md rounded-2xl p-6 border border-gray-100"
      >
        <h3 className="font-semibold mb-3 text-gray-800 text-lg">
          {user ? `Hello, ${user.name}!` : "Share your thoughts"}
        </h3>

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind?"
          className="w-full p-3 border rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
          rows="3"
        />

        <div className="flex items-center justify-between">
          <input
            type="file"
            onChange={(e) => setImage(e.target.files[0])}
            className="text-sm text-gray-600"
          />
          <button className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition">
            Post
          </button>
        </div>
      </form>

      {posts.length === 0 ? (
        <p className="text-center text-gray-500">No posts yet. Be the first!</p>
      ) : (
        posts.map((post) => (
          <div
            key={post._id}
            className="bg-white rounded-2xl shadow-md p-5 mb-5 hover:shadow-lg transition border border-gray-100"
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-800">
                {post.user?.name || "Anonymous"}
              </h4>
              <span className="text-xs text-gray-500">
                {new Date(post.createdAt).toLocaleString()}
              </span>
            </div>

            <p className="text-gray-700 mb-3">{post.content}</p>

            {post.imageUrl && (
              <img
                src={`${import.meta.env.VITE_API_BASE_URL.replace('/api', '')}${post.imageUrl}`}
                alt="Post"
                className="rounded-xl max-h-72 w-full object-cover mb-3"
              />
            )}

            <div className="flex items-center space-x-4 text-sm mt-2">
              <button
                onClick={() => toggleLike(post._id)}
                className={`transition ${
                  post.liked
                    ? "text-blue-600 font-semibold"
                    : "text-gray-600 hover:text-blue-500"
                }`}
              >
                {post.liked ? "💙 Liked" : "🤍 Like"} ({post.likesCount || 0})
              </button>

              {user && post.user?._id === user._id && (
                <button
                  onClick={() => handleDelete(post._id)}
                  className="text-red-500 hover:text-red-700 transition"
                >
                  🗑️ Delete
                </button>
              )}
            </div>
            <div className="mt-3 border-t pt-3">
              <CommentSection postId={post._id} />
            </div>
          </div>
        ))
      )}
    </div>
  );
}

