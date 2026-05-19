const config = require("../config");

const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
  name: "spammedia",
  async execute(interaction) {
    if (!config.spamChannelId) {
      return interaction.reply({
        content: "❌ SPAM_CHANNEL_ID n'est pas configuré dans le .env du serveur.",
        ephemeral: true
      });
    }

    if (interaction.channelId !== config.spamChannelId) {
      return interaction.reply({
        content: "❌ Cette commande est réservée au salon autorisé.",
        ephemeral: true
      });
    }

    const media = interaction.options.getAttachment("media");
    const count = interaction.options.getInteger("nombre");
    const text = interaction.options.getString("texte") || "";

    if (!ALLOWED_TYPES.includes(media.contentType)) {
      return interaction.reply({
        content: "❌ Le fichier doit être une image ou un gif.",
        ephemeral: true
      });
    }

    await interaction.reply({
      content: `✅ Envoi de ${count} media(s)...`,
      ephemeral: true
    });

    for (let i = 0; i < count; i++) {
      await interaction.channel.send({
        content: text,
        files: [media.url]
      });

      if (i < count - 1) {
        await wait(750);
      }
    }
  }
};
