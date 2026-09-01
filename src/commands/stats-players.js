const { EmbedBuilder } = require("discord.js");
const { postSheetApi } = require("../services/sheets");

module.exports = {
    name: "stats-players",

    async execute(interaction) {

        await interaction.deferReply();

        const data = await postSheetApi({
            action: "getplayers"
        });

        if (!data?.success) {
            return interaction.editReply("❌ API error");
        }

        const players = data.players || [];

        const getScore = (player, stat) => {
            return Number(player[stat]) || 0;
        };

        const statsPlayers = players
            .map(player => {

                const t1 = getScore(player, "t1");
                const t2 = getScore(player, "t2");
                const t3 = getScore(player, "t3");
                const t4 = getScore(player, "t4");

                const totalSansT4 = t1 + t2 + t3;
                const totalAvecT4 = totalSansT4 + t4;

                return {
                    name: player.name || "Joueur inconnu",
                    t1,
                    t2,
                    t3,
                    t4,
                    totalSansT4,
                    totalAvecT4
                };
            })
            .sort((a, b) => b.totalAvecT4 - a.totalAvecT4);

        const totalGlobalAvecT4 = statsPlayers.reduce(
            (total, player) => total + player.totalAvecT4,
            0
        );

        const totalGlobalSansT4 = statsPlayers.reduce(
            (total, player) => total + player.totalSansT4,
            0
        );

        const totalGlobalT4 = statsPlayers.reduce(
            (total, player) => total + player.t4,
            0
        );

        const joueursAvecT4 = statsPlayers.filter(
            player => player.t4 > 0
        );

        let classement = "";

        statsPlayers.forEach((player, index) => {

            classement +=
                `${index + 1}. **${player.name}** — ` +
                `**${player.totalAvecT4.toFixed(2)} pts**`;

            if (player.t4 > 0) {
                classement +=
                    `\n   ↳ 🚫 Sans Team 4 : **${player.totalSansT4.toFixed(2)}**` +
                    ` | 🔥 Team 4 : **+${player.t4.toFixed(2)}**`;
            }

            classement += "\n\n";
        });

        const embed = new EmbedBuilder()
            .setTitle("📊 STATS PLAYERS")
            .setColor(0xFF00FF)
            .setDescription(
                `👥 **${players.length} joueurs analysés**

━━━━━━━━━━━━━━━━━━

📈 **TOTAL GÉNÉRAL**

🔥 Avec Team 4 :
**${totalGlobalAvecT4.toFixed(2)} pts**

🚫 Sans Team 4 :
**${totalGlobalSansT4.toFixed(2)} pts**

🔥 Total Team 4 :
**+${totalGlobalT4.toFixed(2)} pts**

━━━━━━━━━━━━━━━━━━

🏆 **CLASSEMENT DES JOUEURS**

${classement}`
            )
            .setFooter({
                text: `${joueursAvecT4.length} joueur(s) avec une Team 4`
            });

        return interaction.editReply({
            embeds: [embed]
        });
    }
};