const { getSession, updateSession } = require("../teubRoyale/session");
const { createBracket } = require("../teubRoyale/bracket");


module.exports = {

    name: "teub-round",


    async execute(interaction){


        const session = getSession();


        if(!session){

            return interaction.reply({
                content:"❌ Aucun tournoi en cours.",
                ephemeral:true
            });

        }


        const winners = session.winners;



        // ==========================
        // FIN DU TOURNOI
        // ==========================

        if(winners.length === 1){


            updateSession({

                champion:winners[0],

                finished:true

            });


            return interaction.reply(
`
🍆 TEUB ROYALE

🏆 CHAMPION / CHAMPION


🇫🇷 ${winners[0].name} remporte le tournoi !
🇬🇧 ${winners[0].name} wins the tournament!
`
            );

        }



        if(winners.length < 2){

            return interaction.reply({
                content:"⚠️ Pas assez de joueurs pour créer un round.",
                ephemeral:true
            });

        }



        // ==========================
        // NOUVEAU ROUND
        // ==========================


        const nextRound = createBracket(winners);



        const nextNumber =
            session.roundNumber === "FINAL"
            ? "FINAL"
            : session.roundNumber + 1;



        updateSession({

            round: nextRound,

            winners: [],

            currentMatch: 0,

            roundNumber: nextNumber

        });



        await interaction.reply(
`
🔥 ROUND ${nextNumber}

🇫🇷 Les combats sont prêts !
🇬🇧 The fights are ready!


🎙️ Présentateur :

Utilisez :

/teub-next

pour lancer le prochain combat.
`
        );


    }

};