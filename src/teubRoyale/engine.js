function getScore(player) {
  return ["t1", "t2", "t3", "t4"].reduce((total, key) => {
    const value = Number(player[key]);
    return total + (Number.isFinite(value) ? value : 0);
  }, 0);
}

function fight(player1, player2) {
  const score1 = getScore(player1);
  const score2 = getScore(player2);
  const winner = score1 >= score2 ? player1 : player2;
  const loser = winner === player1 ? player2 : player1;

  return {
    winner,
    loser,
    winnerScore: Number((winner === player1 ? score1 : score2).toFixed(2)),
    loserScore: Number((loser === player1 ? score1 : score2).toFixed(2))
  };
}

module.exports = { fight, getScore };
