const { getSession, updateSession } = require("../teubRoyale/session");
const { playMatch } = require("../teubRoyale/events");


module.exports = {

    name: "teub-next",


    async execute(interaction){


        const session = getSession();


        if(!session){

            return interaction.reply({
                content:"❌ Aucun tournoi en cours.",
                ephemeral:true
            });

        }


        const round = session.round;


        const match = round[session.currentMatch];


        if(!match){

            return interaction.reply({
                content:"⚠️ Tous les combats du round sont terminés.",
                ephemeral:true
            });

        }


        if(!match.p2){

        session.winners.push(match.p1);
        session.currentMatch++;

        updateSession({
            winners: session.winners,
            currentMatch: session.currentMatch
        });


        return interaction.reply(
    `
    🛡️ EXEMPT / BYE

    🇫🇷 ${match.p1.name} passe automatiquement au prochain tour !
    🇬🇧 ${match.p1.name} advances automatically!
    `
        );

    }



    await interaction.reply(
    `
    🎙️ PROCHAIN COMBAT / NEXT FIGHT

    ⚔️ ${match.p1.name} VS ${match.p2.name}
    `
    );


        const winner = await playMatch(
            match,
            interaction,
            session.delai
        );


        session.winners.push(winner);


        session.currentMatch++;



        updateSession({

            winners: session.winners,

            currentMatch: session.currentMatch

        });



        // Dernier combat du round terminé

        if(session.currentMatch >= session.round.length){


            updateSession({

                currentMatch:0

            });


          await interaction.channel.send(
`
        ⏸️ FIN DU ROUND ${session.roundNumber}

        🇫🇷 Tous les combats sont terminés !
        🇬🇧 All fights are finished!


        🎙️ Présentateur :

        Utilisez :

        /teub-round

        pour lancer le prochain tour.

        ⏱️ Délai prévu :
        ${session.delaiRound} secondes
        `
        );


            return;

        }



        // Sinon prochain combat

        await interaction.channel.send(
        `
        🎙️ Présentateur :

        🇫🇷 Combat terminé !
        🇬🇧 Fight finished!


        Utilisez :

        /teub-next

        pour le prochain combat.
        `
        );


    }

};