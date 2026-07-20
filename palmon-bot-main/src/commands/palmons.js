const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder
} = require("discord.js");
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

function formatMon(idValue, attributes) {
  const id = String(idValue).padStart(3, "0");
  const attr = attributes[id];

  if (!attr) return `• ❔ ${id} [inconnu]`;

  return `• ${getEmoji(attr.category)} ${attr.id} [${attr.category}] (${getName(attr)})`;
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

    const lines = results.length === 1
      ? results[0].mons.map(m => formatMon(m, attributes))
      : results.map(p => `👤 **${p.pseudo}**\n${formatMons(p.mons, attributes)}`);

    const perPage = results.length === 1 ? 8 : 4;
    let page = 0;
    const maxPage = Math.ceil(lines.length / perPage) - 1;

    const generateEmbed = () => {
      const slice = lines.slice(page * perPage, (page + 1) * perPage);

      return new EmbedBuilder()
        .setTitle(`🥚 Palmons de ${pseudo}`)
        .setColor(0xFFD700)
        .setDescription(slice.join("\n\n") || "Aucun Palmon")
        .setFooter({ text: `Page ${page + 1}/${maxPage + 1}` });
    };

    const row = () => new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("palmons_prev")
        .setLabel("⬅️")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(page === 0),
      new ButtonBuilder()
        .setCustomId("palmons_next")
        .setLabel("➡️")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(page === maxPage)
    );

    const components = maxPage > 0 ? [row()] : [];

    const msg = await interaction.editReply({
      embeds: [generateEmbed()],
      components
    });

    if (maxPage <= 0) return;

    const collector = msg.createMessageComponentCollector({ time: 60000 });

    collector.on("collect", async (i) => {
      if (i.user.id !== interaction.user.id) {
        return i.reply({ content: "❌ Pas pour toi", ephemeral: true });
      }

      if (i.customId === "palmons_prev") page--;
      if (i.customId === "palmons_next") page++;

      if (page < 0) page = 0;
      if (page > maxPage) page = maxPage;

      await i.update({
        embeds: [generateEmbed()],
        components: [row()]
      });
    });

    collector.on("end", () => {
      interaction.editReply({ components: [] }).catch(() => {});
    });
  }
};
