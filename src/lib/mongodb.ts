import mongoose from "mongoose";
import Quote from "@/models/Quote";
import QuoteTemplate from "@/models/QuoteTemplate";
import Customer from "@/models/Customer";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local"
  );
}

interface Cached {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: Cached;
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

// Register models
if (!mongoose.models.Quote) {
  mongoose.model("Quote", Quote.schema);
}
if (!mongoose.models.QuoteTemplate) {
  mongoose.model("QuoteTemplate", QuoteTemplate.schema);
}
if (!mongoose.models.Customer) {
  mongoose.model("Customer", Customer.schema);
}

export async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI!, opts);
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}
