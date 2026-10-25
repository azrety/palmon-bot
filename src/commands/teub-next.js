const { getSession, updateSession } = require("../teubRoyale/session");
const { playMatch } = require("../teubRoyale/events");
const { champion } = require("../teubRoyale/messages");

function channelKey(interaction) {
  return interaction.channelId;
}

async function finishMatch(interaction, session) {
  session.currentMatch += 1;

  if (session.currentMatch < session.round.length) {
    await interaction.channel.send(
      "🎙️ Combat terminé ! Utilisez `/teub-next` pour lancer le prochain combat."
    );
    return;
  }

  updateSession(channelKey(interaction), { roundComplete: true });
  await interaction.channel.send(
    `⏸️ FIN DU ROUND ${session.roundNumber}\n\nTous les combats sont terminés. Utilisez /teub-round pour continuer.`
  );
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
      return interaction.reply({ content: "⚠️ Le round est terminé. Utilisez `/teub-round`.", ephemeral: true });
    }

    const match = session.round[session.currentMatch];
    session.processing = true;
    try {
      if (!match.p2) {
        session.winners.push(match.p1);
        await interaction.reply(`🛡️ ${match.p1.name} est exempté et passe au prochain round.`);
        await finishMatch(interaction, session);
        return;
      }

      await interaction.reply(`🎙️ PROCHAIN COMBAT\n\n⚔️ ${match.p1.name} VS ${match.p2.name}`);
      const winner = await playMatch(match, interaction, session.delai);
      session.winners.push(winner);
      await finishMatch(interaction, session);
    } finally {
      session.processing = false;
    }
  }
};




