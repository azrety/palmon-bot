const { getScore } = require("./random");


function fight(player1, player2) {

    const score1 = getScore(player1);
    const score2 = getScore(player2);


    let winner;
    let loser;


    if (score1 >= score2) {
        winner = player1;
        loser = player2;
    } else {
        winner = player2;
        loser = player1;
    }


    return {
        winner,
        loser,
        score1,
        score2
    };
}



module.exports = {
    fight
};