# SAIMA-BOT

A WhatsApp assistant built on Meta's official Cloud API. It replies to messages automatically with AI answers, captures leads, and keeps conversation memory so replies stay in context. It can also send email and WhatsApp alerts when someone reaches out.

## Tech

- Node.js with Express
- Axios for API calls
- Meta WhatsApp Cloud API
- An AI model for the replies

## What is inside

- `server.js`, the webhook server and bot logic
- `package.json`, dependencies and the start script

## Configuration

The bot needs some values set as environment variables (do not commit real values):

- the Meta WhatsApp access token
- the webhook verify token
- the phone number ID
- the AI API key

Set these in your host dashboard, or in a local `.env` file for development.

## Running it locally

You need Node.js installed.

```
npm install
npm start
```

The server starts and listens for the WhatsApp webhook. To receive messages during development, expose the port with a tunnel and point the Meta webhook at it.

## Deployment

Deployed on Railway. The webhook URL is set in the Meta app settings.

## Author

Saima Hamid, Ninja Tech, Lahore. https://ninjatechdev.com
