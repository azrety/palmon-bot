const fs = require("fs");
const path = require("path");

const PENGUIN_SOUNDS_DIR = path.join(__dirname, "..", "..", "penguin sounds");
const ALLOWED_EXTENSIONS = new Set([".mp3", ".wav", ".ogg"]);

function getPenguinSounds() {
  if (!fs.existsSync(PENGUIN_SOUNDS_DIR)) return [];

  return fs.readdirSync(PENGUIN_SOUNDS_DIR)
    .filter(file => ALLOWED_EXTENSIONS.has(path.extname(file).toLowerCase()))
    .map(file => path.join(PENGUIN_SOUNDS_DIR, file));
}

function getRandomPenguinSound() {
  const sounds = getPenguinSounds();
  if (!sounds.length) return null;

  return sounds[Math.floor(Math.random() * sounds.length)];
}

module.exports = {
  name: "penguin",
  async execute(interaction) {
    const member = interaction.options.getUser("membre");
    const soundPath = getRandomPenguinSound();

    if (!soundPath) {
      return interaction.reply({
        content: "❌ Aucun son trouvé dans le dossier penguin sounds/."
      });
    }

    return interaction.reply({
      content: `${member} 🐧 Un pingouin roi spectral t'attend dans le jeu, va le chercher !`,
      files: [{
        attachment: soundPath,
        name: path.basename(soundPath)
      }]
    });
  }
};
