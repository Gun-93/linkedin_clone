import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import { auth } from "./middleware/auth.js";
import { me } from "./controllers/authController.js";

dotenv.config();
const app = express();

// Middleware
app.use(express.json());
app.use(morgan("dev"));

// ✅ Allow both local and deployed frontend
const allowedOrigins = [
  "http://localhost:5173", // local dev
  "https://clonegfvg.netlify.app", // replace with your real netlify domain
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS not allowed for this origin"));
      }
    },
    credentials: true,
  })
);

// Static uploads
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.get("/", (req, res) => res.send("✅ Backend server is running successfully!"));
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.get("/api/users/me", auth, me);
app.get("/api/health", (_, res) => res.json({ ok: true }));

// DB + Start
const PORT = process.env.PORT || 5000;
connectDB(process.env.MONGO_URL).then(() => {
  app.listen(PORT, () =>
    console.log(`✅ Server running on http://localhost:${PORT}`)
  );
});







