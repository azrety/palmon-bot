function fightStart(player1, player2){

return `
⚔️ COMBAT / FIGHT

🇫🇷 ${player1.name} VS ${player2.name}
🇬🇧 ${player1.name} VS ${player2.name}


🔥 Le duel commence...
🔥 The duel begins...
`;

}



function fightResult(result){

return `
🏆 RESULTAT / RESULT

🇫🇷 ✅ ${result.winner.name} gagne !
🇬🇧 ✅ ${result.winner.name} wins!


📊 Score / Score:

${result.winner.name} : ${result.winnerScore}
${result.loser.name} : ${result.loserScore}
`;

}



function champion(player){

return `
🍆 TEUB ROYALE

🏆 CHAMPION / CHAMPION


🇫🇷 ${player.name} remporte le tournoi !
🇬🇧 ${player.name} wins the tournament!
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



module.exports = {

fightStart,
fightResult,
champion,
roundStart,
roundEnd

};