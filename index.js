const http = require("http");
const dotenv = require("dotenv");
dotenv.config();
const { Pool } = require("pg");

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: {
    rejectUnauthorized: false,
  },
});

const queryDatabase = async () => {
  try {
    const result = await pool.query("SELECT NOW()"); // Example query
    console.log("Connected to PostgreSQL RDS:", result.rows[0]);
  } catch (err) {
    console.error("Error connecting to PostgreSQL RDS:", err);
  }
};

queryDatabase();

const server = http.createServer(async (req, res) => {
  // Add CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle OPTIONS request for CORS preflight
  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.url === "/api/users" && req.method === "GET") {
    const result = await pool.query("SELECT * FROM users");
    const users = result.rows;
    if (users.length === 0) {
      res.statusCode = 404;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ message: "No users found" }));
    } else {
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ users }));
    }
  } else if (req.url === "/api/users" && req.method === "POST") {
    const name = "John Doe";
    const age = 20;
    const result = await pool.query(
      "INSERT INTO users (name, age) VALUES ($1, $2) RETURNING *",
      [name, age]
    );
    const newUser = result.rows[0];
    res.statusCode = 201;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ newUser }));
  } else if (req.url === "/" && req.method === "GET") {
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ message: "Hello World" }));
  } else {
    res.statusCode = 404;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ message: "Route not found" }));
  }
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
