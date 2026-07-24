function shuffle(array) {
    return [...array]
        .map(v => ({ v, r: Math.random() }))
        .sort((a, b) => a.r - b.r)
        .map(o => o.v);
}

function getScore(player) {
    return (
        Number(player.t1 || 0) +
        Number(player.t2 || 0) +
        Number(player.t3 || 0) +
        Number(player.t4 || 0)
    );
}

function fight(a, b) {

    const scoreA = getScore(a);
    const scoreB = getScore(b);

    const winner = scoreA >= scoreB ? a : b;
    const loser = winner === a ? b : a;

    return {
        winner,
        loser,
        scoreA,
        scoreB
    };
}

module.exports = {
    shuffle,
    getScore,
    fight
};