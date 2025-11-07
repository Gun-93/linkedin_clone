import mongoose from 'mongoose'
export async function connectDB(url) {
  try {
    await mongoose.connect(url, { dbName: 'linkedin_clone' })
    console.log('MongoDB connected')
  } catch (err) {
    console.error('MongoDB connection error:', err.message)
    process.exit(1)
  }
}
