import express from "express";
import Redis from "ioredis";

const app = express();
app.use(express.json());

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

function otpKey(phone) {
    return `otp:${phone}`;
}

app.post("/otp", async (req, res) => {
    const { phone } = req.body;
    if (!/^\d{10}$/.test(phone)) {
        return res.status(400).json({ error: "Invalid phone number format" });
    }
    if (!phone) {
        return res.status(400).json({ error: "Phone number is required" });
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await redis.set(otpKey(phone), otp, "EX", 60);
    res.json({ message: "OTP sent successfully", otp });
});

app.post("/verify-otp", async (req, res) => {
    const { phone, otp } = req.body;
    if (!phone || !otp) {
        return res.status(400).json({ error: "Phone number and OTP are required" });
    }
    const storedOtp = await redis.get(otpKey(phone));
    if(!storedOtp) {
        return res.status(400).json({ error: "OTP has expired or does not exist" });
    }
    if(storedOtp !== otp) {
        return res.status(400).json({ error: "Invalid OTP" });
    }
    await redis.del(otpKey(phone));
    res.json({ message: "OTP verified successfully" });
});


app.get("/otp/:phone/ttl", async (req, res) => {
    if (!/^\d{10}$/.test(req.params.phone)) {
        return res.status(400).json({ error: "Invalid phone number format" });
    }
    if (!req.params.phone) {
        return res.status(400).json({ error: "Phone number is required" });
    }
    if (!await redis.exists(otpKey(req.params.phone))) {
        return res.status(400).json({ error: "OTP does not exist for this phone number" });
    }
    if (await redis.ttl(otpKey(req.params.phone)) === -2) {
        return res.status(400).json({ error: "OTP has expired" });
    }
    const { phone } = req.params;
    const ttl = await redis.ttl(otpKey(phone));
    res.json({ ttl });
});

app.listen(3000, () => {
    console.log("Server is running on port http://localhost:3000");
});


