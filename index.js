// Load environment variables
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const apiRoutes = require("./routes");

const app = express();

// Configure CORS to allow both localhost and production URLs
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5000",
  "http://localhost:5173", // Vite default
  "https://muhammad-hamid-raza.vercel.app",
  process.env.FRONTEND_URL, // Allow dynamic frontend URL
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g., curl or Postman)
      if (!origin) return callback(null, true);

      // Allow all origins in production if needed, or stick to whitelist
      if (allowedOrigins.includes(origin) || process.env.NODE_ENV === "development") {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Handle CORS preflight requests explicitly
app.options("*", cors());

// Parse JSON and URL-encoded bodies with increased size limits for base64 images
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: false }));

// Log all incoming requests for debugging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.get("/", (req, res) => {
  res.send("Welcome to the Portfolio Backend API!");
});

app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Serve uploaded images statically
app.use('/uploads', express.static('uploads'));

app.use("/api", apiRoutes);

const port = process.env.PORT || 3000;
app.listen(port, "0.0.0.0", () => {
  console.log(`Backend server running on port ${port} in ${process.env.NODE_ENV || 'development'} mode`);
});

module.exports = app;
