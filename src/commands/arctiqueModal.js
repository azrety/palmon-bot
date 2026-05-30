const {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder
} = require("discord.js");

function createAddModal() {
  const modal = new ModalBuilder()
    .setCustomId("add_base_modal")
    .setTitle("Ajouter une base");

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

  const equipe2 = new TextInputBuilder()
    .setCustomId("equipe2")
    .setLabel("Equipe 2")
    .setStyle(TextInputStyle.Short)
    .setRequired(false);

  const equipe3 = new TextInputBuilder()
    .setCustomId("equipe3")
    .setLabel("Equipe 3")
    .setStyle(TextInputStyle.Short)
    .setRequired(false);

  const commentaire = new TextInputBuilder()
    .setCustomId("commentaire")
    .setLabel("Commentaire (Pseudo, base 4?, KO membre 1ALL...)")
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(false);

  modal.addComponents(
    new ActionRowBuilder().addComponents(base),
    new ActionRowBuilder().addComponents(equipe1),
    new ActionRowBuilder().addComponents(equipe2),
    new ActionRowBuilder().addComponents(equipe3),
    new ActionRowBuilder().addComponents(commentaire)
  );

  return modal;
}

module.exports = { createAddModal };
