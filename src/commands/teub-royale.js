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

let champion = null;


while (!champion) {


    const winners = getWinners(
        round,
        fight
    );


    // Un seul gagnant restant

    if (winners.length === 1) {

        champion = winners[0];
        break;

    }


    // Nouveau round

    round = createBracket(winners);

}



        await interaction.editReply(
`
# 🍆 TEUB ROYALE

🏆 Champion :

${champion.name}

`
        );

    }
};