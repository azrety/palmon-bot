const { postSheetApi } = require("../services/sheets");

module.exports = {
  name: "upgrade",
  async execute(interaction) {
    await interaction.deferReply();

    const name = interaction.options.getString("name");
    const data = await postSheetApi({
      action: "upgrade",
      name,
      t1: interaction.options.getNumber("t1") ?? null,
      t2: interaction.options.getNumber("t2") ?? null,
      t3: interaction.options.getNumber("t3") ?? null,
      t4: interaction.options.getNumber("t4") ?? null
    });

    return interaction.editReply(data?.success ? `🔥 ${name} mis à jour` : "❌ erreur");
  }
};
