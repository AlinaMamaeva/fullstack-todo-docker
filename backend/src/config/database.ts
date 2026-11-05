import mongoose from "mongoose";

mongoose.connection.on("connected", () => {
  console.log("MongoDB connected");
});

mongoose.connection.on("error", (error) => {
  console.error("MongoDB connection error:", error);
});

mongoose.connection.on("disconnected", () => {
  console.warn("MongoDB disconnected");
});

export default async function connectDB(): Promise<void> {
  let mongoURI = process.env.MONGODB_URI;

  if (!mongoURI) {
    throw new Error("MONGODB_URI is not defined");
  }

  if (process.env.MONGO_PASSWORD_FILE) {
    const { readFileSync } = await import("node:fs");

    const password = readFileSync(
      process.env.MONGO_PASSWORD_FILE,
      "utf8",
    ).trim();

    const username = process.env.MONGO_USERNAME || "admin";

    const url = new URL(mongoURI);
    url.username = encodeURIComponent(username);
    url.password = encodeURIComponent(password);
    url.searchParams.set("authSource", "admin");

    mongoURI = url.toString();
  }

  await mongoose.connect(mongoURI);
}
