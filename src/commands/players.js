const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder
} = require("discord.js");
const { postSheetApi } = require("../services/sheets");

module.exports = {
  name: "players",
  async execute(interaction) {
    await interaction.deferReply();

    const data = await postSheetApi({ action: "getplayers" });

    if (!data?.success) {
      return interaction.editReply("❌ API error");
    }

    const names = data.players
      .map(p => p.name || p.pseudo)
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b, "fr", { sensitivity: "base" }));

    const perPage = 20;
    let page = 0;
    const maxPage = Math.ceil(names.length / perPage) - 1;

    const generateEmbed = () => {
      const slice = names.slice(page * perPage, (page + 1) * perPage);

      return new EmbedBuilder()
        .setTitle("👥 Liste des joueurs")
        .setColor(0x00AE86)
        .setDescription(slice.map(n => `👤 ${n}`).join("\n"))
        .setFooter({ text: `Page ${page + 1}/${maxPage + 1}` });
    };

    const row = () => new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`players_prev_${interaction.id}`)
        .setLabel("⬅️")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(page === 0),
      new ButtonBuilder()
        .setCustomId(`players_next_${interaction.id}`)
        .setLabel("➡️")
        .setStyle(ButtonStyle.Primary)
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

      if (i.customId === `players_prev_${interaction.id}`) page--;
      if (i.customId === `players_next_${interaction.id}`) page++;

      if (page < 0) page = 0;
      if (page > maxPage) page = maxPage;

      await i.update({
        embeds: [generateEmbed()],
        components: [row()]
      });
    });

    collector.on("end", () => {
      msg.edit({ components: [] }).catch(() => {});
    });
  }
};
