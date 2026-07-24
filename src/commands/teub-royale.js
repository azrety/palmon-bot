const { postSheetApi } = require("../services/sheets");
const { createBracket } = require("../teubRoyale/bracket");
const { playMatch, startRound, endRound, wait } = require("../teubRoyale/events");
const { createSession } = require("../teubRoyale/session");


module.exports = {
    name: "teub-royale",

    async execute(interaction) {

        await interaction.deferReply();


        const mode = interaction.options.getString("mode");

        const controle = interaction.options.getString("controle");

        const delai = interaction.options.getInteger("delai") ?? 5;

        const delaiRound = interaction.options.getInteger("delai_round") ?? 10;

        const joueursOption = interaction.options.getString("joueurs");
        const exclureOption = interaction.options.getString("exclure");


        const data = await postSheetApi({
            action: "getplayers"
        });


        if (!data?.success) {
            return interaction.editReply("❌ API error");
        }


        let players = data.players;



        // Filtre joueurs inclus

        if (joueursOption) {

            const liste = joueursOption
                .split(",")
                .map(p => p.trim().toLowerCase());


            players = players.filter(p =>
                liste.includes(p.name.toLowerCase())
            );

        }



        // Filtre joueurs exclus

        if (exclureOption) {

            const liste = exclureOption
                .split(",")
                .map(p => p.trim().toLowerCase());


            players = players.filter(p =>
                !liste.includes(p.name.toLowerCase())
            );

        }



        if (players.length < 2) {

            return interaction.editReply(
                "❌ Il faut au moins 2 joueurs."
            );

        }



        // Création du premier tour

        let round = createBracket(players);

        // MODE PRESENTATEUR 🎙️

        if(controle === "presentateur"){


            createSession({

                mode,

                delai,

                delaiRound,

                roundNumber:1,

                round,

                winners:[],

                currentMatch:0,

                interactionChannel: interaction.channel.id

            });


            return interaction.editReply(
        `
        🍆 TEUB ROYALE

        🎙️ MODE PRÉSENTATEUR ACTIVÉ

        🇫🇷 Le tournoi est prêt !
        🇬🇧 The tournament is ready!


        🔥 ROUND 1


        Utilisez :

        /teub-next

        pour lancer le prochain combat.
        `
            );

        }

       // Déroulement des rounds

        let champion = null;
        let roundNumber = 1;

        while (!champion) {

            await startRound(
                roundNumber,
                interaction
            );

            const winners = [];


            for (const match of round) {


                if (!match.p2) {

                    winners.push(match.p1);
                    continue;

                }


                const winner = await playMatch(
                    match,
                    interaction,
                    delai
                );


                winners.push(winner);

            }



            if (winners.length === 1) {

                champion = winners[0];
                break;

            }



           await endRound(
            roundNumber,
            delai,
            interaction
        );


        await wait(delai);


        round = createBracket(winners);
        roundNumber++;

        }



        const { champion: championMessage } = require("../teubRoyale/messages");


        await interaction.editReply(
        `
        🍆 TEUB ROYALE

        🔥 Le tournoi est terminé !
        🔥 The tournament is over!
        `
        );


        await interaction.channel.send(
            championMessage(champion)
        );

    }
};