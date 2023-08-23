const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");
const {
  sendMessage,
  sendKeyboard,
  sendForm,
  deleteMessage,
  sendImage,
} = require("./customFunctions/telegramFunctions");
// const { test } = require("./customFunctions/chatGPT.js");
const { whoIAmKeyboard } = require("./constants/markupKeyboards.js");
const {
  newPostInOptions,
  newPostInGettingThere,
} = require("./replyData/NewPostIn/markupKeyboard.js");
const { newPostIn } = require("./replyData/NewPostIn/textReplies.js");
const { faqQuestions } = require("./replyData/FAQs/markupKeyboard.js");
const { FAQReplies } = require("./replyData/FAQs/textReplies.js");
const { formPrompt } = require("./replyData/Feedback/textReplies");
const { guides, tekongMessage, emojiCheck } = require("./constants/keys.js");
const { sendPictorialGuide } = require("./customFunctions/sendPictorialGuide");
const { database } = require("./customFunctions/firebase.js");
const {
  sbeCampsKeyboard,
  getNearestOptionsKeyboard,
} = require("./replyData/SBECamps/markupKeyboard.js");
const {
  campBlockReplies,
  campLocationReplies,
} = require("./replyData/SBECamps/textReplies.js");
const { chatWithGPT } = require("./customFunctions/chatGPT.js");
// give us the possibility of manage request properly
const app = express();

// Automatically allow cross-origin requests
app.use(cors({ origin: true }));

// our single entry point for every message
app.post("/", async (req, res) => {
  if (req.body.callback_query) {
    const response = req.body.callback_query.data;
    const chat_id = req.body.callback_query.from.id;

    // reading data from the DB
    const dbRef = database.ref(`users/${chat_id}`);
    const returnData = {};
    await dbRef.once("value", (snapshot) => {
      snapshot.forEach((entry) => {
        returnData[entry.key] = entry.val();
      });
    });
    const selectedGuide = returnData.activeGuide;
    const counter = returnData.guideStepNo;
    deleteMessage(chat_id, returnData.latestMsg);

    if (response === "Next Step") {
      try {
        const response = await sendPictorialGuide(
          chat_id,
          guides[selectedGuide],
          counter + 1
        );
        dbRef.update({
          latestMsg: response.data.result.message_id,
          guideStepNo: counter + 1,
        });
      } catch (err) {
        sendMessage(
          chat_id,
          `Oh no, seems we have run into an error getting the next picture :(`
        );
        res.status(400).send(err);
      }
    } else {
      try {
        const response = await sendPictorialGuide(
          chat_id,
          guides[selectedGuide],
          counter - 1
        );
        dbRef.update({
          latestMsg: response.data.result.message_id,
          guideStepNo: counter - 1,
        });
      } catch (err) {
        sendMessage(chat_id, err);
        res.status(400).send(err);
      }
    }

    return res.status(200).send(`Everything went alright`);
  }

  //get the chat_id and input message from user, for non-inline requests
  const chat_id = req.body.message.chat.id;
  const userInput = req.body.message.text;
  const dbRef = database.ref(`users/${chat_id}`);
  const initialEmoji = userInput.slice(0, 3);
  try {
    if (initialEmoji.includes("◀️")) {
      const response = sendKeyboard(
        chat_id,
        "How can I help you?",
        whoIAmKeyboard
      );
    } else if (initialEmoji.includes("🔙")) {
      const dbData = {};
      await dbRef.once("value", (snapshot) => {
        snapshot.forEach((entry) => {
          dbData[entry.key] = entry.val();
        });
      });
      const lastActiveKeyboard = dbData.lastPage;
      if (lastActiveKeyboard === "CampGuide") {
        const response = sendKeyboard(
          chat_id,
          "Which camp are you headed to?",
          sbeCampsKeyboard
        );
      } else {
        const response = await sendKeyboard(
          chat_id,
          "Here's what you need to know for your first day at SBE 🥳",
          newPostInOptions
        );
      }
    } else if (initialEmoji.includes("🌟")) {
      //idk why but the star takes up 2 spaces...
      const query = userInput.slice(3);
      const reply = newPostIn[query];
      if (query.includes("Reporting Details")) {
        await sendMessage(chat_id, reply);
      } else {
        dbRef.update({
          lastPage: "New Post In",
          test: "new update",
        });
        await sendKeyboard(chat_id, reply, newPostInGettingThere);
      }
    } else if (initialEmoji.includes("❓")) {
      const query = userInput.slice(2);
      const reply = FAQReplies[query];
      const response = await sendMessage(chat_id, reply);
    } else if (initialEmoji.includes("🚶")) {
      const busStopCode = userInput.slice(-5);
      // first option is from after Loyang Way
      if (busStopCode == 98131) {
        const response = await sendPictorialGuide(
          chat_id,
          guides["slrGuide1"],
          0
        );
        dbRef.update({
          latestMsg: response.data.result.message_id,
          activeGuide: "slrGuide1",
          guideStepNo: 0,
          // lastPage: "CampGuide",
        });
      } else if (busStopCode == 97091) {
        const response = await sendPictorialGuide(
          chat_id,
          guides[`slrGuide2`],
          0
        );
        dbRef.update({
          latestMsg: response.data.result.message_id,
          activeGuide: "slrGuide2",
          guideStepNo: 0,
          // lastPage: "CampGuide",
        });
      } else if (busStopCode == 77269) {
        const response = await sendPictorialGuide(
          chat_id,
          guides[`prcGuide`],
          0
        );
        dbRef.update({
          latestMsg: response.data.result.message_id,
          activeGuide: "prcGuide",
          guideStepNo: 0,
          // lastPage: "CampGuide",
        });
      } else if (busStopCode == 99021) {
        const response = await sendPictorialGuide(
          chat_id,
          guides[`hendonGuide`],
          0
        );
        dbRef.update({
          latestMsg: response.data.result.message_id,
          activeGuide: "hendonGuide",
          guideStepNo: 0,
          // lastPage: "CampGuide",
        });
      } else if (busStopCode == 99071) {
        const response = await sendPictorialGuide(
          chat_id,
          guides[`hendonGuide2`],
          0
        );
        dbRef.update({
          latestMsg: response.data.result.message_id,
          activeGuide: "hendonGuide2",
          guideStepNo: 0,
          // lastPage: "CampGuide",
        });
      } else if (busStopCode == "t MRT") {
        const response = await sendPictorialGuide(
          chat_id,
          guides[`kakiBukitGuide`],
          0
        );
        dbRef.update({
          latestMsg: response.data.result.message_id,
          activeGuide: "kakiBukitGuide",
          guideStepNo: 0,
          // lastPage: "CampGuide",
        });
      } else if (busStopCode == 94079) {
        const response = await sendPictorialGuide(
          chat_id,
          guides[`bedokGuide`],
          0
        );
        dbRef.update({
          latestMsg: response.data.result.message_id,
          activeGuide: "bedokGuide",
          guideStepNo: 0,
          // lastPage: "CampGuide",
        });
      } else if (busStopCode == 95091) {
        const response = await sendPictorialGuide(
          chat_id,
          guides[`tekongGuide`],
          0
        );
        dbRef.update({
          latestMsg: response.data.result.message_id,
          activeGuide: "tekongGuide",
          guideStepNo: 0,
          // lastPage: "CampGuide",
        });
      }
    } else if (initialEmoji.includes("🏤")) {
      const query = userInput.slice(3);
      const responseKeyboard = getNearestOptionsKeyboard(query);
      dbRef.update({
        lastPage: "CampGuide",
        test: `newer update`,
      });
      const response = await sendKeyboard(
        chat_id,
        campLocationReplies[query],
        responseKeyboard
      );
    } else if (initialEmoji.includes("🔑")) {
      const query = userInput.slice(30);
      const response = await sendMessage(chat_id, campBlockReplies[query]);
    }
    //start to take in the controlled inputs from the bot
    else if (userInput === "Newly posted into SBE 🌑") {
      const response = await sendKeyboard(
        chat_id,
        "Welcome to Supply Base East! 🎉",
        newPostInOptions
      );
    } else if (userInput === "FAQs 🙋‍♂️") {
      const response = await sendKeyboard(
        chat_id,
        "Here's a list of Frequently Asked Questions",
        faqQuestions
      );
    } else if (userInput === "SBE Camps 🏘️") {
      const response = await sendKeyboard(
        chat_id,
        "Which camp are you headed to?",
        sbeCampsKeyboard
      );
    } else if (userInput === "Important Bots 🤖") {
      const response = await sendMessage(
        chat_id,
        `<b><u>Bots</u></b>
<b>The Wolf Pack:</b> https://t.me/+n-MF_thfx7w2OTE1
<b>Cat 1: </b>https://t.me/ArmyCAT1
<b>SLR Cookhouse:</b> https://t.me/FFCSelarangCookhouse
<b>PRC Cookhouse:</b> ??
<b>Hendon Cookhouse: </b>??
<b>Bedok & Kaki Bukit Cookhouse: </b>http://t.me/+gKZUBpLH4rFjNmU9
<b>Tekong Sch 3 Cookhouse: </b>`
      );
    } else if (userInput === "Safety 🦺") {
      const response = await sendMessage(
        chat_id,
        `<u><b>Safety</b></u>
(1) Safeguardian App:
Android: https://play.google.com/store/apps/details?id=sg.mindef.ns.safeguardian&hl=en_SG&gl=US
Apple: https://apps.apple.com/sg/app/safeguardian/id1558990521

(2) Open Reporting (formSG) https://form.gov.sg/60c06404ef6eab0011bbe7bb

(3) Hazard Reporting Hotline - 6510 8381

(4) Army Safety Hotline - 97233891

(5) GSOC Emergency Hotline - 1733`
      );
    }
    //display the custom reply keyboard once the user starts the bot
    else if (userInput === "/start") {
      const response = await sendKeyboard(
        chat_id,
        "How can I help you?",
        whoIAmKeyboard
      );
    } else if (userInput === "Feedback 🗣️") {
      const response = await sendForm(chat_id, formPrompt);
    } else if (userInput === "🚢 Ferry Timings") {
      await sendForm(chat_id, tekongMessage);
    } else if (userInput === "/test") {
      // const ref = database.ref(`users/${chat_id}`);
      // ref.set({
      //   latestMsg: 5,
      //   activeGuide: "sheesh",
      //   guideStepNo: 0,
      // });
      // sendMessage(chat_id, `writing execution completed`);

      // const value = await ref.once("value", (snapshot) => {
      //   const returnObj = {};
      //   snapshot.forEach((entry) => {
      //     sendMessage(chat_id, `${entry.key} gives ${entry.val()}`);
      //     returnObj[entry.key] = entry.val();
      //   });
      // });
      // sendMessage(chat_id, `reading execution completed`);
      await sendMessage(
        chat_id,
        `Haha this is a relic from development. Congrats on finding it! 👑`
      );
    } else {
      // if there is an emoji in the input, it is likely to be a markup reply
      if (emojiCheck.test(userInput)) {
        sendForm(
          chat_id,
          `Welp, I do not regonize that command. If you have replied using the markup keyboard, you may wish to report this error at: https://forms.gle/m8jtLwQG2sxCWGJg9`
        );
      }
      // this contains no input, more likely to be a chat option
      else {
        chatWithGPT(chat_id, userInput);
      }
    }
    return res.status(200).send({ status: "OK" });
  } catch (err) {
    sendMessage(chat_id, `help`);
    return res.status(200).send(err);
  }
});

app.get("/", async (req, res) => {
  const chat_id = 1026617736;
  const userInput = "🔑 Important Block Numbers at Selarang Camp";
  try {
    sendImage(chat_id, "prc step 13", "https://imgbox.com/RoZkthfy");
    res.status(200).send("ok");
  } catch (err) {
    return res.status(500).send(err.data);
  }
});

// "https://imgbox.com/D11ld37t"

// this is the only function it will be published in firebase
//bless my soul I love chatGPT
exports.teleListener = functions
  .region("asia-southeast1")
  .runWith({
    // Ensure the function has enough memory and time
    // to process large files
    timeoutSeconds: 10,
  })
  .https.onRequest(app);
