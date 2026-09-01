const { EmbedBuilder } = require("discord.js");
const { postSheetApi } = require("../services/sheets");

module.exports = {
name: "stats-players",

```
async execute(interaction) {

    await interaction.deferReply();

    // Récupération des joueurs depuis l'API
    const data = await postSheetApi({
        action: "getplayers"
    });

    if (!data?.success) {
        return interaction.editReply("❌ API error");
    }

    const players = data.players;

    // Fonction pour convertir les valeurs en nombres
    const getScore = (player, stat) =>
        Number(player[stat]) || 0;


    // =========================
    // CALCUL DES JOUEURS
    // =========================

    const statsPlayers = players
        .map(player => {

            const t1 = getScore(player, "t1");
            const t2 = getScore(player, "t2");
            const t3 = getScore(player, "t3");
            const t4 = getScore(player, "t4");

            // Total des équipes 1, 2 et 3
            const totalSansT4 =
                t1 +
                t2 +
                t3;

            // Si le joueur a une Team 4,
            // elle est ajoutée au total
            const totalAvecT4 =
                totalSansT4 +
                t4;

            return {
                name: player.name,
                t1,
                t2,
                t3,
                t4,
                totalSansT4,
                totalAvecT4
            };

        })
        .sort(
            (a, b) =>
                b.totalAvecT4 - a.totalAvecT4
        );


    // =========================
    // TOTAUX GLOBAUX
    // =========================

    const totalGlobalAvecT4 =
        statsPlayers.reduce(
            (total, player) =>
                total + player.totalAvecT4,
            0
        );

    const totalGlobalSansT4 =
        statsPlayers.reduce(
            (total, player) =>
                total + player.totalSansT4,
            0
        );

    const totalGlobalT4 =
        statsPlayers.reduce(
            (total, player) =>
                total + player.t4,
            0
        );


    // =========================
    // JOUEURS AVEC TEAM 4
    // =========================

    const joueursAvecT4 =
        statsPlayers.filter(
            player => player.t4 > 0
        );


    // =========================
    // LISTE DES JOUEURS
    // =========================

    const classement =
        statsPlayers
            .map((player, index) => {

                let ligne =
                    `**${index + 1}. ${player.name}** — ` +
                    `**${player.totalAvecT4.toFixed(2)}** pts`;

                if (player.t4 > 0) {

                    ligne +=
                        `\n↳ 🚫 Sans T4 : **${player.totalSansT4.toFixed(2)}**` +
                        ` | 🔥 T4 : **+${player.t4.toFixed(2)}**`;

                }

                return ligne;

            })
            .join("\n\n");


    // =========================
    // EMBED
    // =========================

    const embed = new EmbedBuilder()
        .setTitle("📊 STATS PLAYERS")
        .setColor(0xFF00FF)
        .setDescription(
            `
```

## 👥 ${players.length} JOUEURS ANALYSÉS

━━━━━━━━━━━━━━━━━━

## 📈 TOTAL GÉNÉRAL

🔥 **Avec Team 4**

**${totalGlobalAvecT4.toFixed(2)} pts**

🚫 **Sans Team 4**

**${totalGlobalSansT4.toFixed(2)} pts**

🔥 **Total Team 4**

**+${totalGlobalT4.toFixed(2)} pts**

━━━━━━━━━━━━━━━━━━

## 🏆 CLASSEMENT DES JOUEURS

${classement}
`            )
            .setFooter({
                text:`${joueursAvecT4.length} joueur(s) avec une Team 4`
});

```
    return interaction.editReply({
        embeds: [embed]
    });

}
```

};
