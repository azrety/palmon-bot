const { postSheetApi } = require("../services/sheets");
const { createBracket } = require("../teubRoyale/bracket");
const { playMatch, startRound, endRound, wait } = require("../teubRoyale/events");
const { createSession, getSession, clearSession } = require("../teubRoyale/session");
const { renderUpcomingRounds } = require("../teubRoyale/renderer");
const { champion: championMessage } = require("../teubRoyale/messages");

module.exports = {
  name: "teub-royale",
  async execute(interaction) {
    await interaction.deferReply();
    const key = interaction.channelId;

    if (getSession(key)) {
      return interaction.editReply("❌ Un tournoi est déjà en cours dans ce salon.");
    }

    const mode = interaction.options.getString("mode");
    const control = interaction.options.getString("controle");
    const delai = interaction.options.getInteger("delai") ?? 5;
    const delaiRound = interaction.options.getInteger("delai_round") ?? 10;
    const joueursOption = interaction.options.getString("joueurs");
    const exclureOption = interaction.options.getString("exclure");

    const data = await postSheetApi({ action: "getplayers" });
    if (!data?.success || !Array.isArray(data.players)) {
      return interaction.editReply("❌ Impossible de récupérer la liste des joueurs.");
    }

    let players = data.players.filter(player => player?.name);
    if (joueursOption) {
      const included = joueursOption.split(",").map(name => name.trim().toLowerCase()).filter(Boolean);
      players = players.filter(player => included.includes(player.name.toLowerCase()));
    }
    if (exclureOption) {
      const excluded = exclureOption.split(",").map(name => name.trim().toLowerCase()).filter(Boolean);
      players = players.filter(player => !excluded.includes(player.name.toLowerCase()));
    }
    if (players.length < 2) {
      return interaction.editReply("❌ Il faut au moins 2 joueurs après application des filtres.");
    }

    const randomize = mode === "random";
    const round = createBracket(players, true);
    const sessionCreated = createSession(key, {
      mode,
      control,
      delai,
      delaiRound,
      roundNumber: 1,
      round,
      winners: [],
      currentMatch: 0,
      roundComplete: false,
      channelId: key
    });
    if (!sessionCreated) {
      return interaction.editReply("❌ Un tournoi vient d’être lancé dans ce salon.");
    }

    if (control === "manual") {
      try {
        await startRound(1, interaction);
        await interaction.editReply(
          "🍆 TEUB ROYALE — mode présentateur activé. Utilisez /teub-next pour lancer les combats."
        );
      } catch (error) {
        clearSession(key);
        throw error;
      }
      return;
    }

    try {
      await interaction.editReply("🔥 Tournoi lancé en mode automatique.");

      let currentRound = round;
      let roundNumber = 1;
      let tournamentChampion = null;

      while (!tournamentChampion) {
        await startRound(roundNumber, interaction);
        const winners = [];

        for (const match of currentRound) {
          if (!match.p2) {
            winners.push(match.p1);
            continue;
          }
          winners.push(await playMatch(match, interaction, delai));
        }

        if (winners.length === 1) {
          tournamentChampion = winners[0];
          break;
        }

        await endRound(roundNumber, delaiRound, interaction);
        if (roundNumber === 1 && mode === "bracket") {
          const upcomingRounds = renderUpcomingRounds(round);
          if (upcomingRounds) await interaction.channel.send(upcomingRounds);
        }
        await wait(delaiRound);
        currentRound = createBracket(winners, randomize);
        roundNumber += 1;
      }

      await interaction.channel.send(championMessage(tournamentChampion));
    } finally {
      clearSession(key);
    }
  }
};
