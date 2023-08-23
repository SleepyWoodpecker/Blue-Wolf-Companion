const { chatGPTApiKey } = require("../constants/keys");
const axios = require("axios");
const { sendMessage } = require("./telegramFunctions");

const options = {
  headers: {
    Authorization: `Bearer ${chatGPTApiKey}`,
  },
};

const chatWithGPT = async (chat_id, chatInput) => {
  const response = await axios.post(
    "https://api.openai.com/v1/chat/completions",
    {
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a polite and helpful companion, who provides information about Supply Base East and adds emojis in its replies. Try to be as concise as possible.",
        },
        {
          role: "user",
          content: chatInput,
        },
      ],
    },
    options
  );
  const { choices } = response.data;
  const replyData = await sendMessage(chat_id, choices[0].message.content);
  return;
};

module.exports = { chatWithGPT };
