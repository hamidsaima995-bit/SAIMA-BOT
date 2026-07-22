// server.js — WhatsApp Cloud API webhook (Meta)
const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;        // apni marzi ka string
const ACCESS_TOKEN = process.env.WHATSAPP_TOKEN;      // Meta dashboard se
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;  // Meta dashboard se

// health check
app.get("/", (req, res) => res.send("Saima Bot webhook is running ✅"));

// 1) Webhook verification — Meta ye GET request bhejta hai
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("Webhook verified ✅");
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
});

// 2) Incoming messages
app.post("/webhook", async (req, res) => {
  res.sendStatus(200); // Meta ko turant 200 do, warna wo retry karega

  try {
    const entry = req.body.entry?.[0];
    const value = entry?.changes?.[0]?.value;
    const msg = value?.messages?.[0];

    if (!msg) return; // status update tha, message nahi

    const from = msg.from;                    // sender ka number
    const text = msg.text?.body || "";
    const name = value.contacts?.[0]?.profile?.name || "there";

    console.log(`Message from ${name} (${from}): ${text}`);

    const reply = await getReply(text, name);
    await sendMessage(from, reply);
  } catch (err) {
    console.error("Webhook error:", err.response?.data || err.message);
  }
});

// simple reply logic — baad me DeepSeek/Claude yahan plug karo
async function getReply(text, name) {
  const t = text.toLowerCase().trim();

  if (["hi", "hello", "salam", "assalam o alaikum", "aoa"].some(k => t.includes(k))) {
    return `Assalam o Alaikum ${name}! 👋 Main Saima Bot hoon. Kya madad chahiye?\n\n1️⃣ Services\n2️⃣ Pricing\n3️⃣ Contact`;
  }
  if (t === "1" || t.includes("service")) {
    return "Hum ye services dete hain:\n• Web development (React/Node)\n• WhatsApp automation\n• AI chatbots\n\nDetails ke liye 2 likhein.";
  }
  if (t === "2" || t.includes("price") || t.includes("rate")) {
    return "Pricing project ke scope pe depend karti hai. Apna requirement bhejein, main quote de doon ga.";
  }
  if (t === "3" || t.includes("contact")) {
    return "Aap yahin message kar sakte hain, ya visit karein: oddexvibe.com";
  }
  return `Aapne likha: "${text}"\n\nMain abhi seekh raha hoon. Menu ke liye "hi" likhein.`;
}

// 3) Send message back
async function sendMessage(to, body) {
  const url = `https://graph.facebook.com/v21.0/${PHONE_NUMBER_ID}/messages`;
  await axios.post(
    url,
    {
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body },
    },
    {
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
    }
  );
  console.log(`Replied to ${to}`);
}

app.listen(PORT, () => console.log(`Server on port ${PORT}`));
