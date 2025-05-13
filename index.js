const express = require("express");
const axios = require("axios");
const { SessionsClient } = require("@google-cloud/dialogflow");
const app = express();

app.use(express.json());

const projectId = process.env.DIALOGFLOW_PROJECT_ID;
const sessionClient = new SessionsClient({
  credentials: JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON),
});

app.post("/webhook", async (req, res) => {
  const events = req.body.events;

  for (const event of events) {
    if (event.type === "message") {
      const userMessage = event.message.text;
      const replyToken = event.replyToken;
      const userId = event.source.userId;

      const dialogflowReply = await detectIntentText(userId, userMessage);
      await replyToLine(replyToken, dialogflowReply);
    }
  }

  res.sendStatus(200);
});

async function detectIntentText(sessionId, text) {
  const sessionPath = sessionClient.projectAgentSessionPath(projectId, sessionId);

  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        text: text,
        languageCode: "zh-TW",
      },
    },
  };

  const responses = await sessionClient.detectIntent(request);
  const result = responses[0].queryResult;
  return result.fulfillmentText || "嗯？我還沒學會這個回應～";
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
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
