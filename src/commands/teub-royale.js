const { postSheetApi } = require("../services/sheets");
const { createBracket, getWinners } = require("../teubRoyale/bracket");
const { fight } = require("../teubRoyale/engine");


module.exports = {
    name: "teub-royale",

    async execute(interaction) {

        await interaction.deferReply();


        const mode = interaction.options.getString("mode");
        const delai = interaction.options.getInteger("delai") ?? 5;

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



        // Déroulement des rounds

        while (round.length > 1) {


            const winners = getWinners(
                round,
                fight
            );


            // Si un seul joueur reste = champion

            if (winners.length === 1) {

                round = winners;
                break;

            }


            // Nouveau tour

            round = createBracket(winners);

        }



        const champion = round[0];



        await interaction.editReply(
`
# 🍆 TEUB ROYALE

🏆 Champion :

${champion.name}

`
        );

    }
};