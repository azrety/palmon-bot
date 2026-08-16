const fs = require("fs");
const path = require("path");
const { MessageFlags } = require("discord.js");

const ALLOWED_EXTENSIONS = [
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
];

const PUB_DIR = path.join(__dirname, "..", "..", "pub");
const PRIVATE_REPLY = MessageFlags.Ephemeral;

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getPubFiles() {
  if (!fs.existsSync(PUB_DIR)) return [];

  return fs.readdirSync(PUB_DIR)
    .filter(file => ALLOWED_EXTENSIONS.includes(path.extname(file).toLowerCase()))
    .map(file => path.join(PUB_DIR, file));
}

function getRandomPub() {
  const files = getPubFiles();
  if (!files.length) return null;

  return files[Math.floor(Math.random() * files.length)];
}

module.exports = {
  name: "pub",
  async execute(interaction) {
    const count = interaction.options.getInteger("nombre");
    const mediaFiles = [];

    for (let i = 0; i < count; i++) {
      const randomPub = getRandomPub();
      if (randomPub) mediaFiles.push(randomPub);
    }

    if (mediaFiles.length < count) {
      return interaction.reply({
        content: "❌ Aucun media trouvé dans le dossier pub/. Ajoute des fichiers .gif, .png, .jpg, .jpeg, .webp, .mp4, .webm, .mov, .mp3, .wav ou .ogg.",
        flags: PRIVATE_REPLY
      });
    }

    await interaction.reply({
      content: `📺 Pause pub : envoi de ${count} media(s)...`,
      flags: PRIVATE_REPLY
    });

    try {
      for (let i = 0; i < mediaFiles.length; i++) {
        await interaction.channel.send({
          content: "📺 Pause pub",
          files: [mediaFiles[i]]
        });

        if (i < mediaFiles.length - 1) {
          await wait(750);
        }
      }
    } catch (err) {
      console.error("Erreur pub :", err);

      return interaction.editReply(
        "❌ Discord refuse l'envoi dans ce salon. Vérifie que le bot voit le salon et a les permissions Envoyer des messages + Joindre des fichiers."
      );
    }
  }
};
