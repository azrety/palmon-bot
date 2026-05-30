const {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

function createAddModal() {
  const modal = new ModalBuilder()
    .setCustomId("add_base_modal")
    .setTitle("Ajouter une observation");

  const base = new TextInputBuilder()
    .setCustomId("base")
    .setLabel("Numéro de base")
    .setStyle(TextInputStyle.Short)
    .setRequired(true);

  const equipe1 = new TextInputBuilder()
    .setCustomId("equipe1")
    .setLabel("Equipe 1")
    .setStyle(TextInputStyle.Short)
    .setRequired(false);

  const commentaire = new TextInputBuilder()
    .setCustomId("commentaire")
    .setLabel("Commentaire")
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(false);

  modal.addComponents(
    new ActionRowBuilder().addComponents(base),
    new ActionRowBuilder().addComponents(equipe1),
    new ActionRowBuilder().addComponents(commentaire)
  );

  return modal;
}

module.exports = {
  name: "arctique",

  async execute(interaction) {

    const row = new ActionRowBuilder().addComponents(
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

module.exports.createAddModal = createAddModal;
