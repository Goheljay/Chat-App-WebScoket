const express = require("express");
const cors = require("cors");
const verifyToken = require("./middleware/authentication")
const { connectDB } = require("./config/mongo.config"); // Import DB connection
const redisClient = require("./config/redis.config");  // Redis connection


const app = express();
const port = 3001;

app.use(cors());

// Or enable CORS with specific options
app.use(cors({
  origin: 'http://localhost:3000', // replace with your front-end URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // allowed methods
  allowedHeaders: ['Content-Type', 'Authorization'], // allowed headers
}));

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Authentication
app.use((req, res, next) => {
  verifyToken(req, res, next)
})

// Routes
app.use("", require("./routes/index"));

// Start Server
app.listen(port, () => {
  console.log(`Server listening on ${port} port`);
});

redisClient.connect().catch((err) => console.error("❌ Redis Connection Failed:", err));

