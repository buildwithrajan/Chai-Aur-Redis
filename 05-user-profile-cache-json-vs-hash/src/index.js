import express from "express";
import Redis from "ioredis";

const app = express();
app.use(express.json());

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

//storing user data as a stringified json
app.post("/user/:id/json", async (req, res) => {
    await redis.set(`user:${req.params.id}`, JSON.stringify(req.body));
    res.json({ message: "User data stored successfully", status: 200 });
});

//getting user data stored as a stringified json
app.get("/user/:id/json", async (req, res) => {
    const user = await redis.get(`user:${req.params.id}`);
    res.json({ message: "User data retrieved successfully", user: user ? JSON.parse(user) : null, status: 200 });
});

//storing user data as a object only not stringified json
app.post("/user/:id/hash", async (req, res) => {
    await redis.hset(`user:${req.params.id}:hash`, req.body);
    res.json({ message: "User data stored successfully", status: 200 });
});


app.get("/user/:id/hash", async (req, res) => {
    const user = await redis.hgetall(`user:${req.params.id}:hash`);
    res.json({ message: "User data retrieved successfully", user, status: 200 });
});

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});