const supabase = require("./supabase");

// 儲存使用者暱稱
async function saveNickname(senderId, nickname) {
  const { error } = await supabase
    .from("user_log")
    .upsert({ sender_id: senderId, nickname: nickname, updated_at: new Date().toISOString() }, { onConflict: ['sender_id'] });

  if (error) console.error("🔴 儲存暱稱失敗:", error);
}

// 取得使用者暱稱
async function getNickname(senderId) {
  const { data, error } = await supabase
    .from("user_log")
    .select("nickname")
    .eq("sender_id", senderId)
    .single();

  if (error) {
    console.error("🔴 讀取暱稱失敗:", error);
    return null;
  }
  return data.nickname;
}

// 可選擴充：儲存/讀取對話紀錄
async function saveMessage(senderId, history) {
  const { error } = await supabase
    .from("user_log")
    .update({ history: history, updated_at: new Date().toISOString() })
    .eq("sender_id", senderId);

  if (error) console.error("🔴 儲存對話失敗:", error);
}

async function getLastMessage(senderId) {
  const { data, error } = await supabase
    .from("user_log")
    .select("history")
    .eq("sender_id", senderId)
    .single();

  if (error) {
    console.error("🔴 讀取訊息失敗:", error);
    return null;
  }

  return data.history;
}

module.exports = {
  saveNickname,
  getNickname,
  saveMessage,
  getLastMessage
};
