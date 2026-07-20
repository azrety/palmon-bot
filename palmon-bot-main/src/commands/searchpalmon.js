const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder
} = require("discord.js");
const { getAttributesMap, getSheetData } = require("../services/sheets");
const { getEmoji, getName } = require("../utils/palmon");

module.exports = {
  name: "searchpalmon",
  async execute(interaction) {
    await interaction.deferReply();

    const args = interaction.options.getString("id")
      .trim()
      .split(/\s+/)
      .map(id => id.padStart(3, "0"));

    const players = await getSheetData();
    const attributes = await getAttributesMap();
    const results = players.filter(p => args.every(id => p.mons.includes(id)));

    if (!results.length) {
      return interaction.editReply("❌ Aucun résultat");
    }

    const formatMons = (p) => {
      return p.mons.map(m => {
        const id = String(m).padStart(3, "0");
        const attr = attributes[id];

        if (!attr) return `• ❔ ${id} [inconnu]`;

        return `• ${getEmoji(attr.category)} ${attr.id} [${attr.category}] (${getName(attr)})`;
      }).join("\n");
    };

    const lines = results.map(p => `👤 **${p.pseudo}**\n${formatMons(p)}`);
    const perPage = 6;
    let page = 0;
    const maxPage = Math.ceil(lines.length / perPage) - 1;

    const generateEmbed = () => {
      const slice = lines.slice(page * perPage, (page + 1) * perPage);

      return new EmbedBuilder()
        .setTitle(`🔎 ${args.join(" ")} (${results.length} résultats)`)
        .setColor(0xFFD700)
        .setDescription(slice.join("\n\n"))
        .setFooter({ text: `Page ${page + 1}/${maxPage + 1}` });
    };

    const row = () => new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("prev")
        .setLabel("⬅️")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(page === 0),
      new ButtonBuilder()
        .setCustomId("next")
        .setLabel("➡️")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(page === maxPage)
    );

    const msg = await interaction.editReply({
      embeds: [generateEmbed()],
      components: [row()]
    });

    const collector = msg.createMessageComponentCollector({ time: 60000 });

    collector.on("collect", async (i) => {
      if (i.user.id !== interaction.user.id) {
        return i.reply({ content: "❌ Pas pour toi", ephemeral: true });
      }

      if (i.customId === "prev") page--;
      if (i.customId === "next") page++;

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
