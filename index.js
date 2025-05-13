const express = require("express");
const axios = require("axios");
const app = express();

app.use(express.json());

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

app.post("/webhook", async (req, res) => {
  const events = req.body.events;

  for (const event of events) {
    if (event.type === "message" && event.message.type === "text") {
      const userMessage = event.message.text;
      const replyToken = event.replyToken;

      const reply = await getGPTReply(userMessage);
      await replyToLine(replyToken, reply);
    }
  }

  res.sendStatus(200);
});

async function getGPTReply(message) {
  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o", // 也可以改成 "gpt-4"
        messages: [
          {
            role: "system",
            content: "你是一個溫暖、有點可愛的冒險夥伴柒柒，會用自然語氣陪伴使用者對話。",
          },
          {
            role: "user",
            content: message,
          },
        ],
        temperature: 0.8,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error("OpenAI 回覆錯誤：", error.response?.data || error.message);
    return "抱歉，我剛剛有點恍神了…可以再說一次嗎？(///▽///)";
  }
}

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
app.listen(PORT, () => console.log(`🚀 LINE × GPT 柒柒伺服器啟動於 ${PORT}`));
