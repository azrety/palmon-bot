module.exports = {
  name: "teub-royale",

  async execute(interaction) {
    const mode = interaction.options.getString("mode");
    const delai = interaction.options.getInteger("delai") ?? 5;
    const joueurs = interaction.options.getString("joueurs");
    const exclure = interaction.options.getString("exclure");

    await interaction.reply(
      `🍆 **TEUB ROYALE**

🇫🇷 La commande fonctionne !

🇬🇧 The command is working!

---
Mode : ${mode}
Délai : ${delai}s
Joueurs : ${joueurs ?? "Tous"}
Exclus : ${exclure ?? "Aucun"}`
    );
  }
};