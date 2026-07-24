function shuffle(array) {
    return [...array]
        .map(v => ({ v, r: Math.random() }))
        .sort((a, b) => a.r - b.r)
        .map(o => o.v);
}

function createBracket(players) {

    const shuffled = shuffle(players);

    const matches = [];

    for (let i = 0; i < shuffled.length; i += 2) {

        const p1 = shuffled[i];
        const p2 = shuffled[i + 1];

        matches.push({
            p1,
            p2: p2 || null,
            winner: null
        });
    }

    return matches;
}

module.exports = {
    createBracket
};