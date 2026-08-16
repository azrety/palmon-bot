const arenas = [
    {
        fr: "🌋 Arène volcanique",
        en: "🌋 Volcanic Arena"
    },
    {
        fr: "🏛️ Colisée impérial",
        en: "🏛️ Imperial Coliseum"
    },
    {
        fr: "❄️ Arène glacée",
        en: "❄️ Frozen Arena"
    },
    {
        fr: "🏴‍☠️ Port des pirates",
        en: "🏴‍☠️ Pirate Harbor"
    }
];

function randomArena() {
    return arenas[
        Math.floor(Math.random() * arenas.length)
    ];
}

module.exports = {
    randomArena
};