require("dotenv").config();
const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

const EMAIL = "harshit0766.be23@chitkara.edu.in";
const isNum = (x) => typeof x === "number" && !isNaN(x);

function fib(n) {
    if (!isNum(n) || n < 0) return null;
    let a = 0, b = 1, out = [];
    for (let i = 0; i < n; i++) {
        out.push(a);
        [a, b] = [b, a + b];
    }
    return out;
}

function isPrime(n) {
    if (!isNum(n) || n < 2) return false;
    for (let i = 2; i <= Math.sqrt(n); i++) {
        if (n % i === 0) return false;
    }
    return true;
}

function gcd(a, b) {
    a = Math.abs(a);
    b = Math.abs(b);
    while (b) {
        [a, b] = [b, a % b];
    }
    return a;
}

function lcm(a, b) {
    if (a === 0 || b === 0) return 0;
    return Math.abs(a * b) / gcd(a, b);
}

function lcmArray(arr) {
    if (!arr.length) return null;
    return arr.reduce((acc, curr) => lcm(acc, curr), arr[0]);
}

function hcfArray(arr) {
    if (!arr.length) return null;
    return arr.reduce((acc, curr) => gcd(acc, curr), arr[0]);
}

app.get("/health", (req, res) => {
    res.status(200).json({
        is_success: true,
        official_email: EMAIL,
    });
});

app.post("/bfhl", async (req, res) => {
    try {
        const body = req.body;

        if (!body || Object.keys(body).length !== 1) {
            return res.status(400).json({ is_success: false });
        }

        const key = Object.keys(body)[0];
        const value = body[key];
        let data = null;

        switch (key) {
            case "fibonacci":
                data = fib(value);
                if (data === null) {
                    return res.status(400).json({ is_success: false });
                }
                break;

            case "prime":
                if (!Array.isArray(value)) {
                    return res.status(400).json({ is_success: false });
                }
                data = value.filter((v) => isPrime(v));
                break;

            case "lcm":
                if (!Array.isArray(value)) {
                    return res.status(400).json({ is_success: false });
                }
                data = lcmArray(value.filter(isNum));
                if (data === null) {
                    return res.status(400).json({ is_success: false });
                }
                break;

            case "hcf":
                if (!Array.isArray(value)) {
                    return res.status(400).json({ is_success: false });
                }
                data = hcfArray(value.filter(isNum));
                if (data === null) {
                    return res.status(400).json({ is_success: false });
                }
                break;

            case "AI":
                if (typeof value !== "string") {
                    return res.status(400).json({ is_success: false });
                }

                const ai = await axios.post(
                    "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent",
                    {
                        contents: [
                            {
                                parts: [{ text: value }]
                            }
                        ]
                    },
                    {
                        headers: {
                            "Content-Type": "application/json",
                            "x-goog-api-key": process.env.GEMINI_API_KEY
                        }
                    }
                );

                const raw = ai.data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
                let cleaned = raw.replace(/[*_\n\r]/g, " ").trim();
                let match = cleaned.match(/\bis\s+([A-Za-z]+)/i);

                if (match) {
                    data = match[1];
                } else {
                    let words = cleaned.match(/\b[A-Z][a-z]+\b/g);
                    data = words ? words[words.length - 1] : cleaned.split(" ")[0];
                }

                break;

            default:
                return res.status(400).json({ is_success: false });
        }

        return res.status(200).json({
            is_success: true,
            official_email: EMAIL,
            data: data,
        });
    } catch (e) {
        return res.status(500).json({ is_success: false });
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`API running on port ${PORT}`);
});