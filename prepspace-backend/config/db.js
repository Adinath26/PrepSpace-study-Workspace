const mongoose = require("mongoose");

/**
 * Opens the single Mongoose connection used by the whole app.
 * Call once from server.js before the HTTP server starts accepting requests.
 */
const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("MONGODB_URI is not set. Copy .env.example to .env and fill it in.");
  }

  mongoose.set("strictQuery", true);

  const conn = await mongoose.connect(uri);

  console.log(`[db] MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);

  mongoose.connection.on("error", (err) => {
    console.error("[db] MongoDB connection error:", err.message);
  });

  return conn;
};

module.exports = connectDB;
