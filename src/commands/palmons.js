const { EmbedBuilder } = require("discord.js");
const { getAttributesMap, getSheetData } = require("../services/sheets");
const { getEmoji, getName } = require("../utils/palmon");

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

function formatMons(mons, attributes) {
  if (!mons.length) return "Aucun Palmon";

  return mons.map(m => {
    const id = String(m).padStart(3, "0");
    const attr = attributes[id];

    if (!attr) return `• ❔ ${id} [inconnu]`;

    return `• ${getEmoji(attr.category)} ${attr.id} [${attr.category}] (${getName(attr)})`;
  }).join("\n");
}

module.exports = {
  name: "palmons",
  async execute(interaction) {
    await interaction.deferReply();

    const pseudo = interaction.options.getString("pseudo");
    const search = normalize(pseudo);
    const players = await getSheetData();
    const attributes = await getAttributesMap();

    const exactResults = players.filter(p => normalize(p.pseudo) === search);
    const results = exactResults.length
      ? exactResults
      : players.filter(p => normalize(p.pseudo).includes(search));

    if (!results.length) {
      return interaction.editReply("❌ Aucun pseudo trouvé dans la pouponnière");
    }

    const lines = results.map(p =>
      `👤 **${p.pseudo}**\n${formatMons(p.mons, attributes)}`
    );

    const embed = new EmbedBuilder()
      .setTitle(`🥚 Palmons de ${pseudo}`)
      .setColor(0xFFD700)
      .setDescription(lines.join("\n\n"));

    return interaction.editReply({ embeds: [embed] });
  }
};
