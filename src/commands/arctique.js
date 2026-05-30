const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

module.exports = {
  name: "arctique",

  async execute(interaction) {

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId("add_base")
          .setLabel("📝 Ajouter")
          .setStyle(ButtonStyle.Success),

        new ButtonBuilder()
          .setCustomId("view_base")
          .setLabel("🔍 Consulter")
          .setStyle(ButtonStyle.Primary)
      );

    await interaction.reply({
      content: "📊 Gestion Arctique",
      components: [row]
    });
  }
};
