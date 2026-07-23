// server.js — WhatsApp Cloud API webhook (Meta)

const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;        // any string you choose
const ACCESS_TOKEN = process.env.WHATSAPP_TOKEN;      // from Meta dashboard
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;  // from Meta dashboard

// health check
app.get("/", (req, res) => res.send("Saima Bot webhook is running ✅"));

// 1) Webhook verification — Meta sends this GET request
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
  res.sendStatus(200); // respond to Meta immediately, otherwise it retries

  try {
    const entry = req.body.entry?.[0];
    const value = entry?.changes?.[0]?.value;
    const msg = value?.messages?.[0];

    if (!msg) return; // status update, not a message

    const from = msg.from;                    // sender's number
    const text = msg.text?.body || "";
    const name = value.contacts?.[0]?.profile?.name || "there";

    console.log(`Message from ${name} (${from}): ${text}`);

    const reply = await getReply(text, name);
    await sendMessage(from, reply);
  } catch (err) {
    console.error("Webhook error:", err.response?.data || err.message);
  }
});

// simple reply logic — plug in DeepSeek/Claude here later
async function getReply(text, name) {
  const t = text.toLowerCase().trim();

  if (["hi", "hello", "hey", "salam", "assalam o alaikum", "aoa"].some(k => t.includes(k))) {
    return `Hello ${name}! 👋 I'm Saima Bot. How can I help you today?\n\n1️⃣ Services\n2️⃣ Pricing\n3️⃣ Contact`;
  }

  if (t === "1" || t.includes("service")) {
    return "Here's what we build:\n• Web development (React/Node)\n• WhatsApp automation\n• AI chatbots\n\nReply 2 for pricing.";
  }

  if (t === "2" || t.includes("price") || t.includes("rate") || t.includes("cost")) {
    return "Pricing depends on the scope of the project. Send over your requirements and I'll get you a quote.";
  }

  if (t === "3" || t.includes("contact")) {
    return "You can message here anytime, or visit oddexvibe.com";
  }

  return `You said: "${text}"\n\nI'm still learning. Type "hi" to see the menu.`;
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
