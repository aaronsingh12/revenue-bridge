import mongoose from 'mongoose'

let usingMongo = false

export async function connectDB() {
  const uri = process.env.MONGO_URI
  if (!uri) {
    console.warn('[db] MONGO_URI not set — leads will be appended to server/data/leads.dev.json (dev fallback only; use MongoDB in production).')
    return false
  }
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 6000 })
    usingMongo = true
    console.log('[db] MongoDB connected')
    return true
  } catch (err) {
    console.error('[db] MongoDB connection failed:', err.message)
    console.warn('[db] Falling back to server/data/leads.dev.json for this session.')
    return false
  }
}

export function isMongoConnected() {
  return usingMongo && mongoose.connection.readyState === 1
}
