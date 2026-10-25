const { shuffle } = require("./random");

function createBracket(players, randomize = true) {
  const participants = randomize ? shuffle(players) : [...players];
  const matches = [];

  for (let i = 0; i < participants.length; i += 2) {
    matches.push({
      p1: participants[i],
      p2: participants[i + 1] || null
    });
  }

  return matches;
}

function getWinners(matches, fight) {
  const winners = [];
  for (const match of matches) {
    if (!match.p2) {
      winners.push(match.p1);
      continue;
    }
    winners.push(fight(match.p1, match.p2).winner);
  }
  return winners;
}

module.exports = { createBracket, getWinners };
