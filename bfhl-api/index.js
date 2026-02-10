const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  return res.status(200).json({
    is_success: true,
    official_email: EMAIL
  });
});

function getFibonacci(n) {
  let arr = [0, 1];
  for (let i = 2; i < n; i++) {
    arr.push(arr[i - 1] + arr[i - 2]);
  }
  return arr.slice(0, n);
}

function isPrime(num) {
  if (num < 2) return false;
  for (let i = 2; i * i <= num; i++) {
    if (num % i === 0) return false;
  }
  return true;
}

function gcd(a, b) {
  while (b !== 0) {
    let temp = b;
    b = a % b;
    a = temp;
  }
  return Math.abs(a);
}

function lcm(a, b) {
  return Math.abs(a * b) / gcd(a, b);
}

async function getAIAnswer(question) {
  const url =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=" +
    process.env.GEMINI_API_KEY;

  const body = {
    contents: [
      {
        parts: [{ text: question }]
      }
    ]
  };

  try {
    const response = await axios.post(url, body);

    let answer =
      response.data.candidates[0].content.parts[0].text;

    // keep only one word
    answer = answer.replace(/[^a-zA-Z ]/g, "").trim();
    answer = answer.split(" ")[0];

    return answer;
  } catch (err) {
    throw new Error("AI API failed");
  }
}

app.post("/bfhl", async (req, res) => {
  try {
    const body = req.body;
    const keys = Object.keys(body);

    if (keys.length !== 1) {
      return res.status(400).json({
        is_success: false,
        official_email: EMAIL,
        error: "Exactly one key is required"
      });
    }

    const key = keys[0];
    let result;

    if (key === "fibonacci") {
      const n = body[key];
      if (typeof n !== "number" || n <= 0) {
        throw new Error("Invalid fibonacci input");
      }
      result = getFibonacci(n);

    } else if (key === "prime") {
      if (!Array.isArray(body[key])) {
        throw new Error("Prime input must be array");
      }
      result = body[key].filter(
        (num) => Number.isInteger(num) && isPrime(num)
      );

    } else if (key === "lcm") {
      const arr = body[key];
      if (!Array.isArray(arr) || arr.length < 2) {
        throw new Error("LCM requires at least two numbers");
      }
      result = arr.reduce((a, b) => lcm(a, b));

    } else if (key === "hcf") {
      const arr = body[key];
      if (!Array.isArray(arr) || arr.length < 2) {
        throw new Error("HCF requires at least two numbers");
      }
      result = arr.reduce((a, b) => gcd(a, b));

    } else if (key === "AI") {
      if (typeof body[key] !== "string") {
        throw new Error("AI input must be string");
      }
      result = await getAIAnswer(body[key]);

    } else {
      throw new Error("Invalid key");
    }

    res.status(200).json({
      is_success: true,
      official_email: EMAIL,
      data: result
    });

  } catch (err) {
    res.status(400).json({
      is_success: false,
      official_email: EMAIL,
      error: err.message
    });
  }
});

const EMAIL = "harshit0766.be23@chitkara.edu.in";

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});

