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

        // Formatage de la date
        const formatDate = (date) => {
            if (!date) return "Inconnue";

            const parsedDate = new Date(date);

            if (isNaN(parsedDate.getTime())) {
                return String(date);
            }

            return parsedDate.toLocaleString("fr-FR", {
                timeZone: "Europe/Paris",
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            });
        };

        const getDaysSinceUpdate = (date) => {
            if (!date) return null;

            const parsedDate = new Date(date);
            if (isNaN(parsedDate.getTime())) return null;

            return Math.floor((Date.now() - parsedDate.getTime()) / (24 * 60 * 60 * 1000));
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
                    t4,
                    totalSansT4,
                    totalAvecT4,
                    lastUpdate: player.lastUpdate
                };
            })
            // Classement basé UNIQUEMENT sur la puissance sans Team 4
            .sort((a, b) => b.totalSansT4 - a.totalSansT4);

        let classement = "";

        statsPlayers.forEach((player, index) => {
            const daysSinceUpdate = getDaysSinceUpdate(player.lastUpdate);
            const isOutdated = daysSinceUpdate !== null && daysSinceUpdate > 14;

            classement +=
                `${isOutdated ? "🔴 " : ""}${index + 1}. **${player.name}** — ` +
                `**${player.totalSansT4.toFixed(2)} pts**\n`;

            if (player.t4 > 0) {
                classement +=
                    `   ↳ 🔥 Avec Team 4 : **${player.totalAvecT4.toFixed(2)} pts**\n`;
            }

            classement +=
                `   🕒 Last UP : **${formatDate(player.lastUpdate)}**` +
                (isOutdated
                    ? `\n   🔴 **(${daysSinceUpdate} jours sans mise à jour)**`
                    : "") +
                `\n\n`;

        });

        const embed = new EmbedBuilder()
            .setTitle("📊 STATS PLAYERS")
            .setColor(0xFF00FF)
            .setDescription(
                `👥 **${players.length} joueurs analysés**

━━━━━━━━━━━━━━━━━━

🏆 **CLASSEMENT**

*Classement basé sur la puissance sans Team 4.*

${classement}`
            )
            .setFooter({
                text: "Le classement ne prend pas en compte la Team 4"
            });

        return interaction.editReply({
            embeds: [embed]
        });
    }
};
