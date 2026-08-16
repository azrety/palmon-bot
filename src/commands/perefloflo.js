const { randomPereflofloIntro } = require("../data/perefloflo");

module.exports = {
  name: "perefloflo",
  async execute(interaction) {
    const { intro, soundPath } = randomPereflofloIntro();

    await interaction.reply({
      content: intro,
      files: [{
        attachment: soundPath,
        name: "pere-floflo-intro.mp3"
      }]
    });
  }
};
