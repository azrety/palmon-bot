function shuffle(array){

    return [...array]
        .sort(() => Math.random() - 0.5);

}


function randomComment(){

    const comments = [

        "🔥 Le public devient complètement fou !",
        "💥 Une attaque dévastatrice vient de partir !",
        "⚔️ Le stade tremble devant ce duel !",
        "🍆 Une puissance incroyable est libérée !",
        "😱 Personne ne s'attendait à ça !",
        "🏟️ Les supporters hurlent dans l'arène !"

    ];


    return comments[
        Math.floor(Math.random() * comments.length)
    ];

}


module.exports = {
    shuffle,
    randomComment
};