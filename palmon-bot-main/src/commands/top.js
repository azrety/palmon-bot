const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder
} = require("discord.js");
const { postSheetApi } = require("../services/sheets");

module.exports = {
  name: "top",
  async execute(interaction) {
    await interaction.deferReply();

    const data = await postSheetApi({ action: "getplayers" });

    if (!data?.success) {
      return interaction.editReply("❌ API error");
    }

    const players = data.players.sort((a, b) => (b.t1 || 0) - (a.t1 || 0));
    const pageSize = 10;
    let page = 0;
    const maxPage = Math.ceil(players.length / pageSize) - 1;
    const medals = ["🥇", "🥈", "🥉"];

    function generateEmbed(pageNumber) {
      const start = pageNumber * pageSize;
      const current = players.slice(start, start + pageSize);

      const lines = current.map((p, i) => {
        const rank = start + i;
        const medal = medals[rank] || `🏅 #${rank + 1}`;

        return `${medal} **${p.name}**\nT1: ${p.t1} | T2: ${p.t2} | T3: ${p.t3} | T4: ${p.t4}`;
      });

      return new EmbedBuilder()
        .setTitle("🏆 Leaderboard - T1 Ranking")
        .setColor(0xFFD700)
        .setDescription(lines.join("\n\n"))
        .setFooter({ text: `Page ${pageNumber + 1} / ${maxPage + 1}` });
    }

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("prev")
        .setLabel("⬅️")
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId("next")
        .setLabel("➡️")
        .setStyle(ButtonStyle.Primary)
    );

    const message = await interaction.editReply({
      embeds: [generateEmbed(page)],
      components: [row]
    });

    const collector = message.createMessageComponentCollector({ time: 60000 });

    collector.on("collect", async (i) => {
      if (i.user.id !== interaction.user.id) {
        return i.reply({ content: "❌ Pas pour toi", ephemeral: true });
      }

      if (i.customId === "prev") {
        page = page > 0 ? page - 1 : maxPage;
      }

      if (i.customId === "next") {
        page = page < maxPage ? page + 1 : 0;
      }

      await i.update({
        embeds: [generateEmbed(page)],
        components: [row]
      });
    });

    collector.on("end", () => {
      message.edit({ components: [] }).catch(() => {});
    });
  }
};
