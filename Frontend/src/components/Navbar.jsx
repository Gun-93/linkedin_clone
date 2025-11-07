import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate, useLocation } from "react-router-dom";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setUser(null);
      return;
    }

    axios
      .get("http://localhost:5000/api/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setUser(res.data))
      .catch(() => setUser(null));
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/login");
  };

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-indigo-600 shadow-md px-6 py-3 flex justify-between items-center text-white">
      <h1
        onClick={() => navigate("/feed")}
        className="font-bold text-xl cursor-pointer hover:scale-105 transition-transform">LinkedIn Clone
      </h1>

      <div className="flex items-center space-x-5">
        {user ? (
          <>
            <span className="font-medium text-white bg-white/10 px-3 py-1 rounded-full shadow">
              {user.name}
            </span>
            <button
              onClick={() => navigate("/profile")}
              className="hover:bg-white/20 px-3 py-1 rounded-md transition">
              Profile
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded-md transition">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="hover:bg-white/20 px-3 py-1 rounded-md transition">
              Login
            </Link>
            <Link
              to="/signup"
              className="bg-white text-blue-600 font-semibold px-3 py-1 rounded-md hover:bg-gray-100 transition">
              Signup
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}



