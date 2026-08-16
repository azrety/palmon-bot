const { postSheetApi } = require("../services/sheets");

module.exports = {
  name: "addplayer",
  async execute(interaction) {
    await interaction.deferReply();

    const name = interaction.options.getString("name");
    const data = await postSheetApi({
      action: "addplayer",
      name,
      t1: interaction.options.getNumber("t1") ?? 0,
      t2: interaction.options.getNumber("t2") ?? 0,
      t3: interaction.options.getNumber("t3") ?? 0,
      t4: interaction.options.getNumber("t4") ?? 0
    });

    return interaction.editReply(data?.success ? `✅ ${name} ajouté` : "❌ erreur API");
  }
};
