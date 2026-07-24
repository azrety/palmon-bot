function fightStart(player1, player2){

return `
⚔️ COMBAT

${player1.name} VS ${player2.name}

🔥 Le duel commence...
`;

}


function fightResult(result){

return `
🏆 RESULTAT

✅ ${result.winner.name} gagne !

📊 Score :

${result.winner.name} : ${result.winnerScore}
${result.loser.name} : ${result.loserScore}
`;

}


function champion(player){

return `
🍆 TEUB ROYALE

🏆 Champion :

${player.name}
`;

}


module.exports = {
    fightStart,
    fightResult,
    champion
};