const { getSession, updateSession, clearSession } = require("../teubRoyale/session");
const { createBracket } = require("../teubRoyale/bracket");
const { roundStart } = require("../teubRoyale/messages");
const { champion } = require("../teubRoyale/messages");

module.exports = {
  name: "teub-round",
  async execute(interaction) {
    const key = interaction.channelId;
    const session = getSession(key);

    if (!session || session.finished || session.control !== "manual") {
      return interaction.reply({ content: "❌ Aucun tournoi en cours dans ce salon.", ephemeral: true });
    }
    if (session.processing) {
      return interaction.reply({ content: "⏳ Attendez la fin du combat en cours.", ephemeral: true });
    }
    if (!session.roundComplete) {
      return interaction.reply({ content: "⚠️ Terminez d’abord tous les combats avec /teub-next.", ephemeral: true });
    }

    if (session.winners.length === 1) {
      const winner = session.winners[0];
      updateSession(key, { finished: true, champion: winner });
      await interaction.reply(champion(winner));
      clearSession(key);
      return;
    }

    if (session.winners.length < 2) {
      return interaction.reply({ content: "⚠️ Pas assez de joueurs pour créer un round.", ephemeral: true });
    }

    const nextRound = createBracket(session.winners, session.mode === "random");
    const nextNumber = session.roundNumber + 1;
    updateSession(key, {
      round: nextRound,
      winners: [],
      currentMatch: 0,
      roundNumber: nextNumber,
      roundComplete: false
    });

    await interaction.reply(roundStart(nextNumber));
  }
};
