function shuffle(array){

return [...array]
.sort(()=>Math.random()-0.5);

}


function randomComment(){

const comments = [

"🔥 Le public devient complètement fou !",
"💥 Une attaque dévastatrice dans l'arène !",
"⚔️ Le duel est légendaire !",
"🍆 Le stade tremble devant ce combat !"

];


return comments[
Math.floor(Math.random()*comments.length)
];

}


module.exports={
shuffle,
randomComment
};