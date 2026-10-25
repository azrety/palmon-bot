function shuffle(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

function randomFrom(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function bilingual(array) {
    const message = randomFrom(array);
    return `
🇫🇷 ${message.fr}

🇬🇧 ${message.en}
`;
}

const fightStartComments = [
    { fr: "Deux monstres vont s'affronter !", en: "Two monsters are about to clash!" }
];

const battleComments = [
    { fr: "Un moment historique est en train de se produire !", en: "History is being written!" }
];

const victoryComments = [
    { fr: "Quel combat incroyable !", en: "What an incredible fight!" }
];

module.exports = {
    shuffle,
    randomFrom,
    bilingual,
    fightStartComments,
    battleComments,
    victoryComments
};
