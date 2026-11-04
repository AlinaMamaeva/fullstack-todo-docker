
import mongoose from "mongoose";

mongoose.connection.on("connecting", () => {
  console.log("MongoDB connecting...");
});

mongoose.connection.on("connected", () => {
  console.log("MongoDB connected");
});

mongoose.connection.on("error", (error) => {
  console.error("MongoDB error:", error);
});

mongoose.connection.on("disconnected", () => {
  console.warn("MongoDB disconnected");
});

export default async function connectDB(): Promise<void> {
  const mongoURI = process.env.MONGODB_URI;

  if (!mongoURI) {
    throw new Error("MONGODB_URI is not defined");
  }

  await mongoose.connect(mongoURI);
}
