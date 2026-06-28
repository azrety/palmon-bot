const fs = require("fs");
const path = require("path");
const { MessageFlags } = require("discord.js");

const PUB_DIR = path.join(__dirname, "..", "..", "pub");
const PRIVATE_REPLY = MessageFlags.Ephemeral;
const ALLOWED_EXTENSIONS = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ".gif",
  ".mp4",
  ".webm",
  ".mov",
  ".mp3",
  ".wav",
  ".ogg"
]);

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getPubFiles() {
  if (!fs.existsSync(PUB_DIR)) return [];

  return fs.readdirSync(PUB_DIR)
    .filter(file => ALLOWED_EXTENSIONS.has(path.extname(file).toLowerCase()))
    .map(file => path.join(PUB_DIR, file));
}

function shuffle(files) {
  const result = [...files];

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

module.exports = {
  name: "pub",
  async execute(interaction) {
    const count = interaction.options.getInteger("nombre");
    const files = shuffle(getPubFiles()).slice(0, count);

    if (files.length < count) {
      return interaction.reply({
        content: `❌ Pas assez de pubs dans le dossier pub/. Ajoute au moins ${count} fichier(s) image, video ou musique.`,
        flags: PRIVATE_REPLY
      });
    }

    await interaction.reply({
      content: `📺 Pause pub : ${count} media(s) en approche...`,
      flags: PRIVATE_REPLY
    });

    try {
      for (let i = 0; i < files.length; i++) {
        await interaction.channel.send({
          content: "📺 Pause pub",
          files: [{
            attachment: files[i],
            name: path.basename(files[i])
          }]
        });

        if (i < files.length - 1) {
          await wait(750);
        }
      }
    } catch (err) {
      console.error("Erreur pub :", err);

      return interaction.editReply(
        "❌ Discord refuse l'envoi. Vérifie que le bot a les permissions Envoyer des messages + Joindre des fichiers."
      );
    }
  }
};
