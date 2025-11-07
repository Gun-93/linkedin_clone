import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const res = await axios.post("http://localhost:5000/api/auth/register", {
        name,
        email,
        password,
      });

      if (res.status === 201) {
        setMessage("✅ Account created successfully!");
        setTimeout(() => navigate("/login"), 1500);
      }
    } catch (err) {
      if (err.response?.status === 409)
        setMessage("Email already registered. Please log in instead.");
      else setMessage("❌ Signup failed. Try again later.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="bg-white shadow-2xl rounded-2xl w-full max-w-md p-8">
        <h2 className="text-3xl font-bold text-center text-indigo-600 mb-2">
          Create Account 
        </h2>
        <p className="text-gray-500 text-center mb-6">
          Join our community and get started today
        </p>

        <form onSubmit={handleSignup} className="space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none"
            onChange={(e) => setName(e.target.value)}
            required
            autoComplete="name"/>
          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none"
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"/>
          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none"
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"/>

          <button
            type="submit"
            className="w-full py-3 text-white font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 transition">
            Sign Up
          </button>

          {message && (
            <p
              className={`text-center text-sm mt-3 ${
                message.startsWith("✅")
                  ? "text-green-600"
                  : message.startsWith("⚠️")
                  ? "text-yellow-600"
                  : "text-red-600"
              }`}>
              {message}
            </p>
          )}
        </form>

        <p className="mt-6 text-center text-gray-600">
          Already have an account?{" "}
          <span
            onClick={() => navigate("/login")}
            className="text-indigo-600 font-medium hover:underline cursor-pointer">
            Login
          </span>
        </p>
      </div>
    </div>
  );
}

