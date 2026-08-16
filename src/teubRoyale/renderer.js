function getName(player) {
    return player?.name || "BYE";
}

function renderBracket(matches) {
    let message = `
🍆 TEUB ROYALE

🏆 TABLEAU DU TOURNOI / TOURNAMENT BRACKET

`;

    for (const match of matches) {
        message += `
⚔️ ${getName(match.p1)} VS ${getName(match.p2)}
`;
    }

    return message;
}

module.exports = {
    renderBracket
};