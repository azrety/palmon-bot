function shuffle(array){

    return [...array]
        .sort(() => Math.random() - 0.5);

}


function randomFrom(array){

    return array[
        Math.floor(Math.random() * array.length)
    ];

}


function randomComment(){

    return randomFrom(battleComments);

}

const fightStartComments = [

"🔥 Les combattants entrent dans l'arène !",
"🔥 The fighters enter the arena!",

"🏟️ Le public retient son souffle !",
"🏟️ The crowd holds its breath!",

"⚔️ Le duel légendaire commence !",
"⚔️ The legendary battle begins!",

"😈 Deux monstres, une seule victoire !",
"😈 Two monsters, only one victory!",

"🍆 L'arène est prête pour ce combat !",
"🍆 The arena is ready for this fight!"

];

const battleComments = [

"💥 Une attaque dévastatrice vient de partir !",

"🔥 La puissance monte encore !",

"⚡ Le public devient complètement fou !",

"😱 Personne ne s'attendait à ça !",

"🏟️ Les supporters hurlent dans l'arène !",

"💀 Quel échange brutal !",

"🍆 Une technique secrète vient d'être utilisée !",

"🚨 Les arbitres commencent à paniquer !",

"🤯 Même les anciens champions regardent le combat !",

"🗿 Un moment historique est en train de se produire !"

];

const victoryComments = [

"👑 Une victoire écrasante !",

"🔥 Quelle démonstration de puissance !",

"⚔️ Le champion du combat est désigné !",

"🏆 Une performance incroyable !",

"😎 Il repart de l'arène en héros !",

"📢 Le public scande son nom !",

"💪 Une victoire sans discussion !"

];

const defeatComments = [

"💀 Le rêve s'arrête ici...",

"😭 L'aventure touche à sa fin...",

"🏳️ Il quitte l'arène avec honneur.",

"🥲 Une belle bataille malgré tout.",

"⚰️ La Teub Royale ne pardonne personne."

];


module.exports = {
    shuffle,
    randomFrom,
    randomComment,
    fightStartComments,
    battleComments,
    victoryComments,
    defeatComments
};