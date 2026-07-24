const { postSheetApi } = require("../services/sheets");

module.exports = {
  name: "teub-royale",

  async execute(interaction) {

    await interaction.deferReply();

    const mode = interaction.options.getString("mode");
    const delai = interaction.options.getInteger("delai") ?? 5;

    const joueursOption = interaction.options.getString("joueurs");
    const exclureOption = interaction.options.getString("exclure");

    const data = await postSheetApi({
        action: "getplayers"
    });

    if (!data?.success) {
        return interaction.editReply("❌ API error");
    }

    let players = data.players;

    // Filtre "joueurs"
    if (joueursOption) {

        const liste = joueursOption
            .split(",")
            .map(p => p.trim().toLowerCase());

        players = players.filter(p =>
            liste.includes(p.name.toLowerCase())
        );
    }

    // Filtre "exclure"
    if (exclureOption) {

        const liste = exclureOption
            .split(",")
            .map(p => p.trim().toLowerCase());

        players = players.filter(p =>
            !liste.includes(p.name.toLowerCase())
        );
    }

    if (players.length < 2) {
        return interaction.editReply(
            "❌ Il faut au moins 2 joueurs."
        );
    }

    await interaction.editReply(

        `# 🍆 TEUB ROYALE

        🇫🇷 **${players.length} joueurs participeront.**

        🇬🇧 **${players.length} players will participate.**

        Mode : **${mode}**

        Délai : **${delai}s**

        ---

        ${players.map(p => `• ${p.name}`).join("\n")}

        `
            );

        }
};