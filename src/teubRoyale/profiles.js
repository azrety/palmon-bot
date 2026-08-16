const profiles = {
    azrety: {
        emoji: "🦊"
    },

    fly: {
        emoji: "🐺"
    },

    dodue: {
        emoji: "🐸"
    }
};

function getEmoji(playerName) {
    const profile = profiles[playerName.toLowerCase()];

    return profile?.emoji || "🍆";
}

module.exports = {
    getEmoji
};