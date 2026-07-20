const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder
} = require("discord.js");
const { postSheetApi } = require("../services/sheets");

module.exports = {
  name: "history",
  async execute(interaction) {
  await interaction.deferReply({ ephemeral: true });

  const name = interaction.options.getString("name");

  // 🔔 Message public dans le salon
  await interaction.channel.send(
    `🕵️ ${interaction.user} est allé fouiller dans les archives de **${name}** 👀`
  );

  const data = await postSheetApi({ action: "history", name });

  // 🔔 Message privé à l'utilisateur
    if (!data?.success || !data.history?.length) {
      return interaction.editReply("❌ Aucun historique");
    }

    const formatLine = (h, prev) => {
      const date = new Date(h.date).toLocaleString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
      });

      const diff = (a, b) =>
        prev ? (a - b !== 0 ? `(${(a - b > 0 ? "+" : "") + (a - b).toFixed(1)})` : "") : "";

      return `📅 ${date} → T1:${h.t1}${diff(h.t1, prev?.t1)} | T2:${h.t2}${diff(h.t2, prev?.t2)} | T3:${h.t3}${diff(h.t3, prev?.t3)} | T4:${h.t4}${diff(h.t4, prev?.t4)}`;
    };

    const lines = data.history.map((h, i) =>
      formatLine(h, i > 0 ? data.history[i - 1] : null)
    );

    const perPage = 6;
    let page = 0;
    const maxPage = Math.ceil(lines.length / perPage) - 1;

    const generateEmbed = () => {
      const start = page * perPage;

      return new EmbedBuilder()
        .setTitle(`📜 Historique de ${data.name} (page ${page + 1}/${maxPage + 1})`)
        .setColor(0x00AE86)
        .setDescription(lines.slice(start, start + perPage).join("\n"));
    };

    const getRow = () => new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("prev")
        .setLabel("⬅️")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(page === 0),
      new ButtonBuilder()
        .setCustomId("next")
        .setLabel("➡️")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(page === maxPage)
    );

    const msg = await interaction.editReply({
      embeds: [generateEmbed()],
      components: [getRow()]
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
        components: [getRow()]
      });
    });

    collector.on("end", () => {
      msg.edit({ components: [] }).catch(() => {});
    });
  }
};
