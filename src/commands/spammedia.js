const fs = require("fs");
const path = require("path");
const { MessageFlags } = require("discord.js");
const config = require("../config");

const ALLOWED_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/webm",
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/ogg"
];

const ALLOWED_EXTENSIONS = [
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ".gif",
  ".mp4",
  ".webm",
  ".mp3",
  ".wav",
  ".ogg"
];

const GIFS_DIR = path.join(__dirname, "..", "..", "gifs");
const PRIVATE_REPLY = MessageFlags.Ephemeral;

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getLocalMediaFiles() {
  if (!fs.existsSync(GIFS_DIR)) return [];

  return fs.readdirSync(GIFS_DIR)
    .filter(file => ALLOWED_EXTENSIONS.includes(path.extname(file).toLowerCase()))
    .map(file => path.join(GIFS_DIR, file));
}

function getRandomLocalMedia() {
  const files = getLocalMediaFiles();
  if (!files.length) return null;

  return files[Math.floor(Math.random() * files.length)];
}

module.exports = {
  name: "spammedia",
  async execute(interaction) {
    if (!config.spamChannelId) {
      return interaction.reply({
        content: "❌ SPAM_CHANNEL_ID n'est pas configuré dans le .env du serveur.",
        flags: PRIVATE_REPLY
      });
    }

    if (interaction.channelId !== config.spamChannelId) {
      return interaction.reply({
        content: "❌ Cette commande est réservée au salon autorisé.",
        flags: PRIVATE_REPLY
      });
    }

    const media = interaction.options.getAttachment("media");
    const count = interaction.options.getInteger("nombre");
    const text = interaction.options.getString("texte") || "";

    if (media && !ALLOWED_TYPES.includes(media.contentType)) {
      return interaction.reply({
        content: "❌ Le fichier doit être une image ou un gif.",
        flags: PRIVATE_REPLY
      });
    }

    const mediaFiles = [];

    for (let i = 0; i < count; i++) {
      if (media) {
        mediaFiles.push(media.url);
        continue;
      }

      const randomMedia = getRandomLocalMedia();
      if (randomMedia) mediaFiles.push(randomMedia);
    }

    if (mediaFiles.length < count) {
      return interaction.reply({
        content: "❌ Aucun media trouvé dans le dossier gifs/. Ajoute des fichiers .gif, .png, .jpg, .jpeg ou .webp.",
        flags: PRIVATE_REPLY
      });
    }

    await interaction.reply({
      content: `✅ Envoi de ${count} media(s)...`,
      flags: PRIVATE_REPLY
    });

    try {
      for (let i = 0; i < mediaFiles.length; i++) {
        await interaction.channel.send({
          content: text,
          files: [mediaFiles[i]]
        });

        if (i < mediaFiles.length - 1) {
          await wait(750);
        }
      }
    } catch (err) {
      console.error("Erreur spammedia :", err);

      return interaction.editReply(
        "❌ Discord refuse l'envoi dans ce salon. Vérifie que le bot voit le salon et a les permissions Envoyer des messages + Joindre des fichiers."
      );
    }
  }
};
