import mongoose from 'mongoose'

// Define interface for global mongoose cache
interface GlobalMongoose {
  mongoose:
    | {
        conn: typeof mongoose | null
        promise: Promise<typeof mongoose> | null
      }
    | undefined
}

// Augment global scope
declare const global: GlobalMongoose

const { MONGODB_URI } = process.env

let cached = global.mongoose

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

export async function connectDB() {
  if (cached?.conn) {
    return cached.conn
  }

  if (!cached?.promise) {
    const opts = {
      bufferCommands: false
    }

    if (!MONGODB_URI) {
      throw new Error('Please define the MONGODB_URI environment variable')
    }

    cached!.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then(mongoose => {
        console.log('Connected to MongoDB')
        return mongoose
      })
      .catch(err => {
        console.error('MongoDB connection error:', err)
        throw err
      })
  }

  try {
    cached!.conn = await cached!.promise
  } catch (e) {
    cached!.promise = null
    throw e
  }

  return cached?.conn ?? null
}
