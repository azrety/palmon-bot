function getName(player) {
  return player?.name || "BYE";
}

function renderBracket(matches) {
  let message = `
🍆 TEUB ROYALE

🏆 TABLEAU DU TOUR / ROUND BRACKET

`;

  for (const match of matches) {
    message += `⚔️ ${getName(match.p1)} VS ${getName(match.p2)}\n`;
  }

  return message;
}

function renderFullBracket(firstRound) {
  let message = `
🍆 TEUB ROYALE

🏆 TABLEAU COMPLET / FULL BRACKET
`;
  let matches = firstRound;
  let roundNumber = 1;

  while (matches.length > 0) {
    message += `\n🔥 ROUND ${roundNumber}\n`;
    matches.forEach((match, index) => {
      message += `⚔️ ${getName(match.p1)} VS ${getName(match.p2)}\n`;
    });

    if (matches.length === 1) break;

    const advancingPlayers = matches.map((match, index) => ({
      name: match.p2
        ? `Vainqueur combat ${index + 1}`
        : getName(match.p1)
    }));
    const nextRound = [];
    for (let i = 0; i < advancingPlayers.length; i += 2) {
      nextRound.push({
        p1: advancingPlayers[i],
        p2: advancingPlayers[i + 1] || null
      });
    }

    matches = nextRound;
    roundNumber += 1;
  }

  return message;
}

module.exports = { renderBracket, renderFullBracket };
