const sbeCampsKeyboard = {
  keyboard: [
    [{ text: "🏤 Selarang Camp" }, { text: "🏤 Pasir Ris Camp" }],
    [{ text: "🏤 Hendon Camp" }, { text: "🏤 Bedok Camp" }],
    [{ text: "🏤 Kaki Bukit Camp" }, { text: "🏤 Tekong" }],
    [{ text: "◀️ Main Menu" }],
  ],
  input_field_placeholder: "Which camp would you like to go to?",
};

const getNearestOptionsKeyboard = (selectedCamp) => {
  const campValues = {
    "Selarang Camp": ["From bus stop 98131", "From bus stop 97091"],
    "Pasir Ris Camp": ["From bus stop 77269"],
    "Hendon Camp": ["From bus stop 99021", "From bus stop 99071"],
    "Kaki Bukit Camp": ["From Kaki Bukit MRT"],
    "Bedok Camp": ["From bus stop 94079"],
    Tekong: ["From bus stop 95091"],
  };
  const toAdd = campValues[selectedCamp].map((location) => {
    return { text: `🚶 ${location}` };
  });

  const markupKeyboard = [
    [...toAdd],
    [{ text: `🔑 Important Block Numbers at ${selectedCamp}` }],
    [{ text: "🔙 Back" }, { text: "◀️ Main Menu" }],
  ];

  if (selectedCamp === "Tekong") {
    markupKeyboard[1].push({ text: "🚢 Ferry Timings" });
  }

  return {
    keyboard: markupKeyboard,
  };
};

module.exports = { sbeCampsKeyboard, getNearestOptionsKeyboard };
