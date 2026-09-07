const { EmbedBuilder } = require("discord.js");
const { postSheetApi } = require("../services/sheets");

module.exports = {
  name: "stats",

  async execute(interaction) {
    await interaction.deferReply();

    const data = await postSheetApi({
      action: "getplayers"
    });

    if (!data?.success) {
      return interaction.editReply("❌ API error");
    }

    const formatDate = (date) => {
      if (!date) return "Inconnue";

      const parsedDate = new Date(date);

      if (isNaN(parsedDate.getTime())) {
        return String(date);
      }

      return parsedDate.toLocaleString("fr-FR", {
        timeZone: "Europe/Paris",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    };

    const embed = new EmbedBuilder()
      .setTitle("📊 Stats")
      .setColor(0x00AE86)
      .setDescription(
        data.players.map(p =>
          `👤 **${p.name}**
T1: **${p.t1}** | T2: **${p.t2}** | T3: **${p.t3}** | T4: **${p.t4}**
🕒 Dernière MAJ : **${formatDate(p.lastUpdate)}**`
        ).join("\n\n")
      );

    return interaction.editReply({
      embeds: [embed]
    });
  }
};