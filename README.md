# Saima Bot

A WhatsApp auto-reply bot built on Meta's WhatsApp Cloud API. Incoming messages hit a Node.js webhook, get matched against a menu of rules, and receive a reply within seconds — no one at the keyboard.

---

## What it does

Small businesses lose enquiries overnight. Someone messages at 11pm asking about services or pricing, nobody replies until morning, and by then they have gone elsewhere.

Saima Bot answers immediately. It greets the sender by name, offers a numbered menu, and responds to each option — services, pricing, contact. Anything it does not recognise gets a fallback that points back to the menu.

## How it works

```
Customer sends a WhatsApp message
            │
            ▼
Meta Cloud API  ──POST──▶  Express webhook  ──▶  match against rules
                                                          │
Customer receives reply  ◀──Graph API POST────────────────┘
```

1. Meta verifies the webhook once via a `GET /webhook` challenge
2. Every incoming message arrives as `POST /webhook`
3. The server responds `200` immediately so Meta does not retry
4. The message body is matched against keyword rules
5. The reply is sent back through the Graph API

## Features

- Full Meta Cloud API integration — webhook verification, receive, and send
- Keyword and numbered-menu routing
- Personalised greeting using the sender's WhatsApp profile name
- Fallback response for unrecognised input
- Immediate `200` acknowledgement to prevent Meta retry storms
- Credentials kept entirely in environment variables
- Health check endpoint for uptime monitoring

## Tech stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express |
| HTTP client | Axios |
| Messaging | WhatsApp Cloud API (Graph API v21.0) |
| Hosting | Railway |

## Endpoints

| Method | Route | Purpose |
|---|---|---|
| `GET` | `/` | Health check |
| `GET` | `/webhook` | Meta verification challenge |
| `POST` | `/webhook` | Receives incoming messages |

## Environment variables

| Variable | Where it comes from |
|---|---|
| `VERIFY_TOKEN` | Any string you choose — must match what you enter in Meta |
| `WHATSAPP_TOKEN` | Meta dashboard access token |
| `PHONE_NUMBER_ID` | Meta dashboard, under WhatsApp → API Setup |
| `PORT` | Set automatically by Railway |

## Running locally

```bash
git clone https://github.com/hamidsaima995-bit/SAIMA-BOT.git
cd SAIMA-BOT
npm install
```

Create a `.env` file:

```
VERIFY_TOKEN=your_chosen_string
WHATSAPP_TOKEN=your_meta_access_token
PHONE_NUMBER_ID=your_phone_number_id
PORT=3000
```

```bash
node server.js
```

Meta needs a public HTTPS URL to reach the webhook. For local testing, expose the port with a tunnel:

```bash
npx ngrok http 3000
```

Then set the ngrok URL plus `/webhook` as the callback URL in the Meta dashboard.

## Meta setup

1. Create an app at [developers.facebook.com](https://developers.facebook.com) and add the WhatsApp product
2. Under WhatsApp → API Setup, copy the temporary access token and phone number ID
3. Under WhatsApp → Configuration, set the callback URL to `https://your-domain/webhook` and the verify token to whatever you set in `VERIFY_TOKEN`
4. Subscribe to the `messages` webhook field
5. Add your test number under recipients while in development mode

## Extending it

The reply logic lives in a single function, so swapping rules for an AI model is a contained change:

```js
async function getReply(text, name) {
  // replace keyword matching with a call to DeepSeek, Claude, or any LLM
}
```

## Roadmap

- [ ] AI-generated replies instead of fixed rules
- [ ] Conversation history per sender
- [ ] Media message support — images and documents
- [ ] Business hours awareness
- [ ] Admin dashboard for editing replies without a deploy

## Notes

This runs in Meta development mode, which only delivers to numbers added as test recipients. Production access requires business verification through Meta.

---

Built by [Saima](https://github.com/hamidsaima995-bit) — Ninja Tech
