import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import CryptoJS from "crypto-js";
import dotenv from "dotenv";

dotenv.config(); // Load env vars

const app = express();
const PORT = process.env.PORT || 3000;
const BACKEND_URL = process.env.BACKEND_URL;
const AES_KEY = process.env.AES_KEY;

// Middlewares
app.use(bodyParser.json());

// Helpers
function encrypt(data) {
  return CryptoJS.AES.encrypt(JSON.stringify(data), AES_KEY).toString();
}

function decrypt(encryptedPayload) {
  const bytes = CryptoJS.AES.decrypt(encryptedPayload, AES_KEY);
  const decryptedStr = bytes.toString(CryptoJS.enc.Utf8);
  try {
    return JSON.parse(decryptedStr);
  } catch {
    return decryptedStr;
  }
}

// Route to book a seat
app.post("/book-seat", async (req, res) => {
  try {
    const payload = encrypt(req.body);
    const response = await axios.post(`${BACKEND_URL}/seatBooking`, {
      payload,
    });
    const decrypted = decrypt(response.data.encryptedResult);
    res.status(200).json({ success: true, data: decrypted });
  } catch (error) {
    console.error("Book Seat Error:", error.message);
    res.status(500).json({
      success: false,
      message: decrypt(error.response ? error.response.data : error.message),
    });
  }
});

// Route to check seat status
app.post("/check-seat", async (req, res) => {
  try {
    const payload = encrypt(req.body);
    const response = await axios.post(`${BACKEND_URL}/chekBooking`, {
      payload,
    });
    const decrypted = decrypt(response.data);
    res.status(200).json({ success: true, data: decrypted });
  } catch (error) {
    console.error("Check Seat Error:", error.data);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get("/", async (req, res) => {
  res.status(200).json({ message: "Hello from my seat booking scheduler" });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
