const axios = require("axios");
const { teleUrl } = require("../constants/keys.js");

const sendMessage = async (chat_id, text) => {
  const options = {
    chat_id,
    text,
    parse_mode: "HTML",
    disable_web_page_preview: true,
  };

  const response = await axios.post(`${teleUrl}/sendMessage`, options);
  return response;
};

const sendKeyboard = async (chat_id, text, keyboard) => {
  const options = {
    chat_id,
    text,
    parse_mode: "HTML",
    reply_markup: keyboard,
  };
  const response = await axios.post(`${teleUrl}/sendMessage`, options);
  return response;
};

const sendImage = async (chat_id, caption, photo, keyboard) => {
  const options = {
    chat_id,
    caption,
    photo,
    reply_markup: keyboard,
  };
  const response = await axios.post(`${teleUrl}/sendPhoto`, options);
  return response;
};

const sendForm = async (chat_id, text) => {
  const options = {
    chat_id,
    text,
    parse_mode: "HTML",
  };

  const response = await axios.post(`${teleUrl}/sendMessage`, options);
  return response;
};

const deleteMessage = async (chat_id, message_id) => {
  const options = {
    chat_id,
    message_id,
  };

  const response = await axios.post(`${teleUrl}/deleteMessage`, options);
  return response;
};

module.exports = {
  sendMessage,
  sendKeyboard,
  sendForm,
  sendImage,
  deleteMessage,
};
