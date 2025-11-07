import { useState, useEffect } from "react";
import axios from "axios";
import api from "../lib/api";
export default function Profile() {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const API = "http://localhost:5000/api";
  useEffect(() => {
    const token = localStorage.getItem("token");
    axios
      .get(`${API}/users/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setUser(res.data))
      .catch((err) => console.error("User fetch failed:", err));

    axios
      .get(`${API}/posts/user`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setPosts(res.data))
      .catch((err) =>
        console.error("User posts fetch failed:", err.response?.data || err.message)
      );
  }, []);

  if (!user)
    return <p className="text-center mt-10 text-gray-500 animate-pulse">Loading profile...</p>;

  return (
    <div className="max-w-2xl mx-auto mt-10 bg-white rounded-2xl shadow-lg p-8">
      <h2 className="text-3xl font-bold mb-6 text-blue-600 text-center">
        My Profile
      </h2>

      <div className="mb-8 text-center">
        <div className="w-20 h-20 mx-auto bg-blue-100 rounded-full flex items-center justify-center text-3xl font-semibold text-blue-600 mb-3">
          {user.name?.charAt(0).toUpperCase()}
        </div>
        <p className="text-xl font-semibold">{user.name}</p>
        <p className="text-gray-600">{user.email}</p>
        <p className="text-gray-500 mt-2 text-sm">
          Joined:{" "}
          {user.createdAt
            ? new Date(user.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })
            : "N/A"}
        </p>
      </div>

      <h3 className="text-2xl font-semibold text-gray-700 mb-3 border-b pb-2">My Posts</h3>

      {posts.length === 0 ? (
        <p className="text-center text-gray-500 mt-4">
          You haven’t posted anything yet.
        </p>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <div
              key={post._id}
              className="border rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition shadow-sm"
            >
              <p className="text-gray-800 mb-2">{post.content}</p>

              {post.imageUrl && (
                <img
                  src={`http://localhost:5000${post.imageUrl}`}
                  alt="Post"
                  className="rounded-lg max-h-64 object-cover mb-3"/>
              )}

              <p className="text-xs text-gray-500">
                {new Date(post.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}



