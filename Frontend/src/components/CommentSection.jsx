import { useState, useEffect } from "react";
import axios from "axios";

export default function CommentSection({ postId }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const API = "http://localhost:5000/api";

  const fetchComments = async () => {
    const token = localStorage.getItem("token");
    const res = await axios.get(`${API}/posts/${postId}/comments`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setComments(res.data);
  };

  const addComment = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    const token = localStorage.getItem("token");
    await axios.post(
      `${API}/posts/${postId}/comments`,
      { text },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setText("");
    fetchComments();
  };

  useEffect(() => {
    fetchComments();
  }, []);

  return (
    <div className="mt-2">
      <form onSubmit={addComment} className="flex space-x-2">
        <input
          type="text"
          placeholder="Add a comment..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1 border rounded px-2 py-1 text-sm"/>
        <button className="text-sm text-blue-600 hover:underline">Post</button>
      </form>
      <div className="mt-2 space-y-1">
        {comments.map((c) => (
          <p key={c._id} className="text-sm text-gray-700">
            <strong>{c.user?.name || "User"}:</strong> {c.text}
          </p>
        ))}
      </div>
    </div>
  );
}

