const { EmbedBuilder } = require("discord.js");
const { postSheetApi } = require("../services/sheets");

module.exports = {
  name: "stats",
  async execute(interaction) {
    await interaction.deferReply();

    const data = await postSheetApi({ action: "getplayers" });

    if (!data?.success) return interaction.editReply("❌ API error");

    const embed = new EmbedBuilder()
      .setTitle("📊 Stats")
      .setColor(0x00AE86)
      .setDescription(
        data.players.map(p =>
          `👤 **${p.name}**\nT1:${p.t1} | T2:${p.t2} | T3:${p.t3} | T4:${p.t4}`
        ).join("\n\n")
      );

    return interaction.editReply({ embeds: [embed] });
  }
};
