const { getSession, updateSession } = require("../teubRoyale/session");
const { playMatch } = require("../teubRoyale/events");
const { createBracket } = require("../teubRoyale/bracket");


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