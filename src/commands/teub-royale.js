const { postSheetApi } = require("../services/sheets");
const { createBracket } = require("../teubRoyale/bracket");
const { fight } = require("../teubRoyale/engine");
const { getWinners } = require("../teubRoyale/bracket");

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

    // Filtre "joueurs"
    if (joueursOption) {

        const liste = joueursOption
            .split(",")
            .map(p => p.trim().toLowerCase());

        players = players.filter(p =>
            liste.includes(p.name.toLowerCase())
        );
    }

    // Filtre "exclure"
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

const bracket = createBracket(players);

        let round = bracket;

        let tour = 1;

        while(round.length > 1){

        const winners=getWinners(round,fight);


        round=createBracket(winners);


        tour++;

        }


        const champion = round[0].p1;

const lines = bracket.map((m, i) => {

    if (!m.p2) {
        return `${i + 1}. 🛡️ ${m.p1.name} est exempt / gets a bye`;
    }

    return `${i + 1}. ⚔️ ${m.p1.name} vs ${m.p2.name}`;

});

await interaction.editReply(
`
# 🍆 TEUB ROYALE

🏆 Champion :

${champion.name}

`
);
        }
};