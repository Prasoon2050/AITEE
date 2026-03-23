const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const imageRoutes = require("./routes/images");
const productRoutes = require("./routes/products");
const orderRoutes = require("./routes/orders");

const authRoutes = require("./routes/auth");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Database Connection
connectDB();

// Routes
app.use("/api/images", imageRoutes);
app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);

app.get("/", (req, res) => {
  res.send("AITEE Backend is running");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
