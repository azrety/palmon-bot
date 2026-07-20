function getEmoji(category) {
  return { S: "🟡", A: "🟣", B: "🔵", C: "⚪" }[category] || "❔";
}

function getName(attr) {
  if (!attr) return "?";
  return `${attr.fr} / ${attr.en} / ${attr.es} / ${attr.de}`;
}

module.exports = {
  getEmoji,
  getName
};
