// you should receive an array of objects, which look something like this
// const pictures = [
//   {text: "Step 1", imageLink = "http://...."},
//   {text: "Step 2", imageLink = "http://...."},
// ]

const { sendImage, sendMessage } = require("./telegramFunctions");

// might also try to implement a global counter, for which you can track which image to show. Just need to keep in mind that the counter has to be reset everytime a new guiding function is called

const startKeyboard = {
  inline_keyboard: [
    [
      {
        text: "⏭️ Next Step",
        callback_data: "Next Step",
      },
    ],
  ],
};

const middleKeyboard = {
  inline_keyboard: [
    [
      {
        text: "⏭️ Next Step",
        callback_data: "Next Step",
      },
    ],

    [
      {
        text: "🔙 Previous Step",
        callback_data: "Previous Step",
      },
    ],
  ],
};

const endKeyboard = {
  inline_keyboard: [
    [
      {
        text: "🔙 Previous Step",
        callback_data: "Previous Step",
      },
    ],
  ],
};

const sendPictorialGuide = async (chatId, imageArr, counter) => {
  const selectedStep = imageArr[counter];
  let keyboard;
  if (counter === 0) {
    keyboard = startKeyboard;
  } else if (counter === imageArr.length - 1) {
    keyboard = endKeyboard;
  } else {
    keyboard = middleKeyboard;
  }
  const response = await sendImage(
    chatId,
    selectedStep.text,
    selectedStep.imageUrl,
    keyboard
  );
  return response;
};

module.exports = { sendPictorialGuide };
