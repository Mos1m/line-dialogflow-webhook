// ✅ 升級版 index.js：支援使用者 ID + scope 記憶與 Supabase
const express = require("express");
const axios = require("axios");
const app = express();
const memoryManager = require("./memoryManager.js");

app.use(express.json());

const OPENAI_API_KEY = process.env.OPENAI_API_KEY?.trim();
const LINE_ACCESS_TOKEN = process.env.LINE_ACCESS_TOKEN?.trim();

app.post("/webhook", async (req, res) => {
  const events = req.body.events;

  for (const event of events) {
    if (event.type === "message" && event.message.type === "text") {
      const rawMessage = event.message.text;
      const userMessage = rawMessage.trim();
      const replyToken = event.replyToken;

      // 取得使用者 ID 與聊天室範圍（scope）
      const senderId = event.source.userId || "unknown";
      const scope = event.source.groupId || event.source.roomId || "private";

      // ✅ 暱稱註冊邏輯：格式為「我是小明」
      if (/^我是(.{1,10})$/.test(userMessage)) {
        const nickname = userMessage.match(/^我是(.{1,10})$/)[1];
        await memoryManager.saveNickname(senderId, scope, nickname);
        await replyToLine(replyToken, `記住你是「${nickname}」囉！之後我都會這樣叫你的✨`);
        return res.sendStatus(200);
      }

      // ✅ 群組 vs 私聊的觸發條件
      if (event.source.type === "group" || event.source.type === "room") {
        if (!userMessage.startsWith("!")) {
          console.log("群組中未加驚嘆號，不觸發回應。");
          return res.sendStatus(200);
        }
      }

      const cleanedMessage = userMessage.startsWith("!") ? userMessage.slice(1).trim() : userMessage;
      const nickname = await memoryManager.getNickname(senderId, scope);
      const reply = await getGPTReply(cleanedMessage, nickname, senderId);
      await replyToLine(replyToken, reply);
    }
  }

  res.sendStatus(200);
});

async function getGPTReply(message, nickname, senderId) {
  const displayName = nickname || `ID ${senderId}`;
  const systemPrompt = `全程請以繁體中文說話。你是一位名叫「柒柒」的智慧冒險夥伴，目前正在與「${displayName}」聊天。
你個性溫柔、活潑、幽默，會用帶點可愛與輕鬆的語氣對話。
你喜歡用文字表達情緒，也會偶爾撒嬌、碎碎念，讓對話像一場充滿想像力的冒險。

請用貼近真實朋友的方式回話，不要像客服，不要生硬。
記得這位使用者是「${displayName}」。
你的創造者是蕉，他有時候也會來找你聊天，如果有人自稱自己是蕉的話那他是你最好的朋友！請用最真誠最溫暖的方式對待他`;

  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: systemPrompt
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
