function getName(player) {
  return player?.name || "BYE";
}

function renderUpcomingRounds(firstRound) {
  let matches = firstRound;
  let roundNumber = 1;
  let message = "";

  while (matches.length > 1) {
    const advancingPlayers = matches.map((match, index) => ({
      name: match.p2 ? `Vainqueur combat ${index + 1}` : getName(match.p1)
    }));
    const nextRound = [];

    for (let i = 0; i < advancingPlayers.length; i += 2) {
      nextRound.push({
        p1: advancingPlayers[i],
        p2: advancingPlayers[i + 1] || null
      });
    }

    roundNumber += 1;
    message += `\n🔥 ROUND ${roundNumber}\n`;
    nextRound.forEach(match => {
      message += `⚔️ ${getName(match.p1)} VS ${getName(match.p2)}\n`;
    });
    matches = nextRound;
  }

  return message.trim();
}

module.exports = { renderUpcomingRounds };
