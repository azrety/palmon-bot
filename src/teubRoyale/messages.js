const { getEmoji } = require("./profiles");

function fightStart(player1, player2) {
    const p1 = getEmoji(player1.name);
    const p2 = getEmoji(player2.name);

    return `
⚔️ COMBAT / FIGHT

${p1} ${player1.name} VS ${p2} ${player2.name}
`;
}



function fightResult(result) {
    const winnerEmoji = getEmoji(result.winner.name);
    const loserEmoji = getEmoji(result.loser.name);

    return `
🏆 RESULTAT / RESULT

🇫🇷 ✅ ${winnerEmoji} ${result.winner.name} gagne !
🇬🇧 ✅ ${winnerEmoji} ${result.winner.name} wins!

📊 SCORE

${winnerEmoji} ${result.winner.name} : ${result.winnerScore}

${loserEmoji} ${result.loser.name} : ${result.loserScore}
`;
}



function champion(player) {
    const emoji = getEmoji(player.name);

    return `
🍆 TEUB ROYALE

🏆 CHAMPION

${emoji} ${player.name}

🇫🇷 remporte le tournoi !

🇬🇧 wins the tournament!
`;
}


function roundStart(number){

return `
🔥 ROUND ${number}

🇫🇷 Les combats commencent !
🇬🇧 The battles begin!
`;

}



function roundEnd(number){

return `
⏸️ FIN DU ROUND ${number}

🇫🇷 Préparation du prochain tour...
🇬🇧 Preparing the next round...
`;

}

function roundEnd(number, delai){

return `
⏸️ FIN DU ROUND ${number}

🇫🇷 Préparation du prochain tour dans ${delai} secondes...
🇬🇧 Preparing the next round in ${delai} seconds...
`;

}


module.exports = {

fightStart,
fightResult,
champion,
roundStart,
roundEnd

};