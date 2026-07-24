const { fight } = require("./engine");
const { fightStart, fightResult } = require("./messages");
const { randomComment } = require("./random");


function wait(seconds){

    return new Promise(resolve =>
        setTimeout(resolve, seconds * 1000)
    );

}



async function playMatch(match, interaction, delai){


    await interaction.channel.send(
        fightStart(match.p1, match.p2)
    );

    await wait(delai);

    await interaction.channel.send(
        randomComment()
    );

    await wait(delai);



    const result = fight(
        match.p1,
        match.p2
    );


    await interaction.channel.send(
        fightResult(result)
    );


    await wait(delai);


    return result.winner;

}

async function startRound(roundNumber, interaction){

        await interaction.channel.send(
    `
    🔥 ROUND ${roundNumber}

    ⚔️ Les combats commencent !
    `
        );

}


module.exports = {
    playMatch,
    startRound
};