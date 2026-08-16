const { fight } = require("./engine");
const { fightStart, fightResult, roundStart, roundEnd } = require("./messages");
const { 
    randomFrom,
    fightStartComments,
    battleComments,
    victoryComments
} = require("./random");
const { bilingual } = require("./random");
const { randomArena } = require("./arena");

function wait(seconds){

    return new Promise(resolve =>
        setTimeout(resolve, seconds * 1000)
    );

}



async function playMatch(match, interaction, delai){


    // Début du combat

    await interaction.channel.send(
        fightStart(match.p1, match.p2)
    );

        const arena = randomArena();

        await interaction.channel.send(
        `
        🏟️ ARÈNE / ARENA

        🇫🇷 ${arena.fr}

        🇬🇧 ${arena.en}
        `
        );

        await wait(delai);



    // Message entrée combattants

    await interaction.channel.send(
        bilingual(fightStartComments)
    );


    await wait(delai);



    // Action pendant le combat

    await interaction.channel.send(
      bilingual(battleComments)
    );


    await wait(delai);



    const result = fight(
        match.p1,
        match.p2
    );



    // Victoire

    await interaction.channel.send(
        bilingual(victoryComments)
    );


    await wait(delai);



    // Résultat final

    await interaction.channel.send(
        fightResult(result)
    );


    await wait(delai);


    return result.winner;

}



async function startRound(roundNumber, interaction){

    await interaction.channel.send(
        roundStart(roundNumber)
    );

}

async function endRound(roundNumber, delai, interaction){

    await interaction.channel.send(
        roundEnd(roundNumber, delai)
    );

}

module.exports = {
    playMatch,
    startRound,
    endRound,
    wait
};
