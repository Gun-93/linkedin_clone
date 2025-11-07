import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
export async function register(req, res) {
  try {
    const { name, email, password } = req.body
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields required' })
    }
    const exists = await User.findOne({ email })
    if (exists) return res.status(409).json({ message: 'Email already registered' })

    const hash = await bcrypt.hash(password, 10)
    const user = await User.create({ name, email, password: hash })
    return res.status(201).json({ id: user._id })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ message: 'Server error' })
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email })
    if (!user) return res.status(401).json({ message: 'Invalid credentials' })

    const ok = await bcrypt.compare(password, user.password)
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' })

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' })
    return res.json({ token })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ message: 'Server error' })
  }
}

export const me = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("name email createdAt avatarUrl");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ message: "Server error" });
  }
};

