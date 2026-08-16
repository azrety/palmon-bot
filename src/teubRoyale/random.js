function randomFrom(array) {
    return array[
        Math.floor(Math.random() * array.length)
    ];
}

function bilingual(array) {
    const message = randomFrom(array);

    return `
🇫🇷 ${message.fr}

🇬🇧 ${message.en}
`;
}

const fightStartComments = [
    {
        fr: "Les combattants entrent dans l'arène !",
        en: "The fighters enter the arena!"
    },
    {
        fr: "Le public retient son souffle !",
        en: "The crowd holds its breath!"
    },
    {
        fr: "Le duel légendaire commence !",
        en: "The legendary battle begins!"
    },
    {
        fr: "Deux monstres vont s'affronter !",
        en: "Two monsters are about to clash!"
    }
];

const battleComments = [
    {
        fr: "La puissance augmente !",
        en: "The power keeps rising!"
    },
    {
        fr: "L'arène devient complètement folle !",
        en: "The arena goes completely wild!"
    },
    {
        fr: "Un moment historique est en train de se produire !",
        en: "History is being written!"
    },
    {
        fr: "Les supporters scandent leur nom !",
        en: "The crowd is chanting their names!"
    }
];

const victoryComments = [
    {
        fr: "Une victoire écrasante !",
        en: "A crushing victory!"
    },
    {
        fr: "Le champion du combat est désigné !",
        en: "The champion of the battle has been crowned!"
    },
    {
        fr: "Quel combat incroyable !",
        en: "What an incredible fight!"
    }
];

module.exports = {
    randomFrom,
    bilingual,
    fightStartComments,
    battleComments,
    victoryComments
};