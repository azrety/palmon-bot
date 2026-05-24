const { EmbedBuilder } = require("discord.js");
const clashs = require("../data/clashs");
const { postSheetApi } = require("../services/sheets");

module.exports = {
  name: "concours-teub",
  async execute(interaction) {
    await interaction.deferReply();

    const j1 = interaction.options.getString("joueur1");
    const j2 = interaction.options.getString("joueur2");
    const data = await postSheetApi({ action: "getplayers" });

    if (!data?.success) return interaction.editReply("❌ API error");

    const p1 = data.players.find(p => p.name.toLowerCase() === j1.toLowerCase());
    const p2 = data.players.find(p => p.name.toLowerCase() === j2.toLowerCase());

    if (!p1 || !p2) {
      return interaction.editReply("❌ Joueur introuvable");
    }

    const stats = ["t1", "t2", "t3", "t4"];
    const lines = stats.map(stat => {
      const v1 = p1[stat] || 0;
      const v2 = p2[stat] || 0;

      let left = `${p1.name}: ${v1}`;
      let right = `${p2.name}: ${v2}`;

      if (v1 > v2) {
        left = `🟢 ${left}`;
        right = `🔴 ${right}`;
      } else if (v2 > v1) {
        left = `🔴 ${left}`;
        right = `🟢 ${right}`;
      } else {
        left = `⚖️ ${left}`;
        right = `⚖️ ${right}`;
      }

      return `• **${stat.toUpperCase()}** → ${left} ⚔️ ${right}`;
    });

    const total1 = stats.reduce((acc, s) => acc + (p1[s] || 0), 0);
    const total2 = stats.reduce((acc, s) => acc + (p2[s] || 0), 0);
    const rawClash = clashs[Math.floor(Math.random() * clashs.length)];

    const winnerDynamic =
      total1 > total2 ? p1.name :
      total2 > total1 ? p2.name :
      null;

    const loserDynamic =
      total1 > total2 ? p2.name :
      total2 > total1 ? p1.name :
      null;

    const finalClash = rawClash
      .replace("{winner}", winnerDynamic ?? "personne")
      .replace("{loser}", loserDynamic ?? "personne");

    const winnerName =
      total1 > total2 ? p1.name :
      total2 > total1 ? p2.name :
      "ÉGALITÉ PARFAITE";

    const winnerEmoji =
      total1 > total2 ? "🟥" :
      total2 > total1 ? "🟦" :
      "⚖️";

    const embed = new EmbedBuilder()
      .setTitle("⚔️ ARENA MATCH : CONCOURS DE TEUB")
      .setColor(0xFF00FF)
      .setDescription(
    `🟥 **${p1.name}** VS 🟦 **${p2.name}**

    🎮 *Bienvenue dans ce nouveau concours de teub où les cerveaux s'affrontent !*  
    🎮 *Welcome to this new Dicksus contest where minds collide!*

    ## 🎯 Sortez vos armes ... / Draw your weapons ...

    🤛 *READY...FIGHT* 🤜

    ${lines.join("\n")}

    ---
    ## 📊 SCORE FINAL / FINAL SCORE

    🟥 **${p1.name}** → ${total1} pts  
    🟦 **${p2.name}** → ${total2} pts  

    ---
    ## 🏆 GAGNANT / WINNER

    ${winnerEmoji} **${winnerName}**

    ## 🎙️ COMMENTATEUR LIVE / LIVE COMMENTATOR

    💬 
    *${finalClash}*

    📡 *“Ce match vient d’entrer dans les annales du serveur…”*  
    📡 *“This match has officially entered the server’s history…”*
    `
  );

    return interaction.editReply({ embeds: [embed] });
  }
};
