// 取得最近訊息（測試用途）
async function getLastMessage(userId) {
  const { data, error } = await supabase
    .from("user_memory")
    .select("last_message")
    .eq("user_id", userId)
    .single();

  if (error) {
    console.error("🔴 讀取訊息失敗:", error);
    return null;
  }
  return data.last_message;
}

module.exports = {
  saveUserName,
  getUserName,
  saveMessage,
  getLastMessage,
};
