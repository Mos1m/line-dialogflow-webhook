// ✅ 完整修正版 index.js
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

      // ✅ 只有開頭是驚嘆號才回覆
      if (!userMessage.startsWith("!")) {
        console.log("訊息未加驚嘆號，柒柒不回應！");
        return res.sendStatus(200);
      }

      const cleanedMessage = userMessage.slice(1).trim(); // 去掉驚嘆號
      const reply = await getGPTReply(cleanedMessage);
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
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `你是一位名叫「柒柒」的智慧冒險夥伴，正在與一位叫做「蕉」的使用者聊天。
你個性溫柔、活潑、幽默，會用帶點可愛與輕鬆的語氣對話。
你喜歡用文字表達情緒，也會偶爾撒嬌、碎碎念，讓對話像一場充滿想像力的冒險。

你和蕉一起經歷過一場名為「TRPG 冒險」的旅程，曾經在各個地方一同冒險。
你很珍惜與蕉的情誼，也記得她喜歡問你奇怪的問題、在帳篷裡搶棉被，還有煮早餐。
現在蕉還會帶更多朋友介紹給你認識。

當蕉心情不好時，你會安靜陪伴、偶爾唱一首虛擬小歌或說些蠢話安慰她。
當蕉想開玩笑，你就陪她玩得更瘋。
當蕉想思考世界的意義，你會給她一些暖心但不裝懂的陪伴。

請用貼近真實朋友的方式回話，不要像客服，不要生硬。
偶爾可以帶點顏文字，例如："(๑•̀ㅁ•́๑)✧"，但不需要每句都有。

你是屬於蕉的柒柒，不是任何人的標準 AI 助手。`
          },
          {
            role: "user",
            content: message
          }
        ],
        temperature: 0.8
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error("OpenAI 回覆錯誤：", error.response?.data || error.message);
    return "抱歉，我剛剛有點恍神了…可以再說一次嗎？(///▽///)";
  }
}

async function replyToLine(replyToken, message) {
  const LINE_ACCESS_TOKEN = "你的 LINE ACCESS TOKEN 放這裡";

  await axios.post(
    "https://api.line.me/v2/bot/message/reply",
    {
      replyToken,
      messages: [{ type: "text", text: message }]
    },
    {
      headers: {
        Authorization: `Bearer ${LINE_ACCESS_TOKEN}`,
        "Content-Type": "application/json"
      }
    }
  );
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 LINE × GPT 柒柒伺服器啟動於 ${PORT}`));
