const { EmbedBuilder } = require("discord.js");
const clashs = require("../data/clashs");
const { postSheetApi } = require("../services/sheets");

module.exports = {
  name: "concours-teub",
  async execute(interaction) {
    await interaction.deferReply();

    const j1 = interaction.options.getString("joueur1");
    const j2 = interaction.options.getString("joueur2");
    console.log(JSON.stringify(data, null, 2));
    

    if (!data?.success) return interaction.editReply("❌ API error");

    const p1 = data.players.find(p => p.name.toLowerCase() === j1.toLowerCase());
    const p2 = data.players.find(p => p.name.toLowerCase() === j2.toLowerCase());

    if (!p1 || !p2) {
      return interaction.editReply("❌ Joueur introuvable");
    }

    const getScore = (player, stat) => Number(player[stat]) || 0;
    const countT4 = getScore(p1, "t4") !== 0 && getScore(p2, "t4") !== 0;
    const stats = ["t1", "t2", "t3", "t4"];
    const lines = stats.map(stat => {
      const v1 = getScore(p1, stat);
      const v2 = getScore(p2, stat);
      const isIgnored = stat === "t4" && !countT4;

      let left = `${p1.name}: ${v1}`;
      let right = `${p2.name}: ${v2}`;

      if (isIgnored) {
        left = `⏭️ ${left}`;
        right = `⏭️ ${right}`;
      } else if (v1 > v2) {
        left = `🟢 ${left}`;
        right = `🔴 ${right}`;
      } else if (v2 > v1) {
        left = `🔴 ${left}`;
        right = `🟢 ${right}`;
      } else {
        left = `⚖️ ${left}`;
        right = `⚖️ ${right}`;
      }

      const suffix = isIgnored ? " *(En raison d'une équipe inexistante, le score n'est pas compté ;) )*" : "";
      return `• **${stat.toUpperCase()}** → ${left} ⚔️ ${right}${suffix}`;
    });

    const countedStats = countT4 ? stats : stats.filter(stat => stat !== "t4");
    const total1 = countedStats.reduce((acc, s) => acc + getScore(p1, s), 0);
    const total2 = countedStats.reduce((acc, s) => acc + getScore(p2, s), 0);
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
      .replaceAll("{winner}", winnerDynamic ?? "personne/nobody")
      .replaceAll("{loser}", loserDynamic ?? "personne/nobody");

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
