const { shuffle } = require("./random");

function wait(seconds) {
  return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}

async function playMatch(match, interaction, delai) {
  await interaction.channel.send(fightStart(match.p1, match.p2));
  const arena = randomArena();
  await interaction.channel.send(`🏟️ ARÈNE / ARENA\n\n🇫🇷 ${arena.fr}\n🇬🇧 ${arena.en}`);
  await interaction.channel.send(bilingual(fightStartComments));
  await interaction.channel.send(bilingual(battleComments));
  await interaction.channel.send(bilingual(victoryComments));

  const result = fight(match.p1, match.p2);
  await interaction.channel.send(fightResult(result));
  await wait(delai);
  return result.winner;
}

async function startRound(roundNumber, interaction) {
  await interaction.channel.send(roundStart(roundNumber));
}

async function endRound(roundNumber, delai, interaction) {
  await interaction.channel.send(roundEnd(roundNumber, delai));
}

const { fight } = require("./engine");
const { fightStart, fightResult, roundStart, roundEnd } = require("./messages");
const { bilingual, fightStartComments, battleComments, victoryComments } = require("./random");
const { randomArena } = require("./arena");

module.exports = { playMatch, startRound, endRound, wait };


