const { getSession, updateSession } = require("../teubRoyale/session");
const { playMatch } = require("../teubRoyale/events");
const { renderUpcomingRounds } = require("../teubRoyale/renderer");

function channelKey(interaction) {
  return interaction.channelId;
}

async function finishMatch(interaction, session) {
  session.currentMatch += 1;

  if (session.currentMatch < session.round.length) {
    return;
  }

  updateSession(channelKey(interaction), { roundComplete: true });
  await interaction.channel.send(
    `⏸️ FIN DU ROUND ${session.roundNumber}\n\nTous les combats sont terminés.`
  );

  if (session.roundNumber === 1 && session.mode === "bracket") {
    const upcomingRounds = renderUpcomingRounds(session.round);
    if (upcomingRounds) await interaction.channel.send(upcomingRounds);
  }
}

module.exports = {
  name: "teub-next",
  async execute(interaction) {
    const key = channelKey(interaction);
    const session = getSession(key);

    if (!session || session.finished || session.control !== "manual") {
      return interaction.reply({ content: "❌ Aucun tournoi en cours dans ce salon.", ephemeral: true });
    }
    if (session.processing) {
      return interaction.reply({ content: "⏳ Un combat est déjà en cours dans ce salon.", ephemeral: true });
    }
    if (session.roundComplete || session.currentMatch >= session.round.length) {
      return interaction.reply({ content: "⚠️ Le round est terminé. Utilisez /teub-round.", ephemeral: true });
    }

    const match = session.round[session.currentMatch];
    session.processing = true;
    try {
      if (!match.p2) {
        session.winners.push(match.p1);
        await interaction.reply(`🛡️ ${match.p1.name} passe automatiquement au prochain round.`);
        await finishMatch(interaction, session);
        return;
      }

      await interaction.reply({ content: "🎙️ Combat lancé dans le salon.", ephemeral: true });
      const winner = await playMatch(match, interaction, session.delai);
      session.winners.push(winner);
      await finishMatch(interaction, session);
    } finally {
      session.processing = false;
    }
  }
};
