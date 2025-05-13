const express = require("express");
const axios = require("axios");
const app = express();

app.use(express.json());

// 用來處理 LINE 傳來的訊息
app.post("/webhook", async (req, res) => {
  const events = req.body.events;

  for (const event of events) {
    if (event.type === "message") {
      const userMessage = event.message.text;
      const replyToken = event.replyToken;

      // 這裡是簡單範例：你說什麼我就回什麼
      await replyToLine(replyToken, `你說了：「${userMessage}」`);
    }
  }

  res.sendStatus(200);
});

// 用來回傳訊息給 LINE
async function replyToLine(replyToken, message) {
  const LINE_ACCESS_TOKEN = "dVoP8tmac5wAOvJNhsnR8Z6fSmF4Uz4xMZshNRzxX1ywhxOuHyhZXbwCmvAMz/tgjXHvele9Lb/jeOEs+vIvO9+IUXKsmuZLKZJA2fUZ51Po3DI6x01GZaFE4zHzrDV4qEAUp9KVSH1jpItCF0Z3qQdB04t89/1O/w1cDnyilFU=";

  await axios.post(
    "https://api.line.me/v2/bot/message/reply",
    {
      replyToken,
      messages: [{ type: "text", text: message }],
    },
    {
      headers: {
        Authorization: `Bearer ${LINE_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
    }
  );
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
