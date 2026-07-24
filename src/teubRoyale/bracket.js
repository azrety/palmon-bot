function shuffle(array){

return [...array]
.sort(()=>Math.random()-0.5);

}



function createBracket(players){

const shuffled=shuffle(players);

const matches=[];


for(let i=0;i<shuffled.length;i+=2){

matches.push({

p1: shuffled[i],
p2: shuffled[i+1] || null

});

}


return matches;

}



function getWinners(matches, fight){


const winners=[];


for(const match of matches){


if(!match.p2){

winners.push(match.p1);
continue;

}


const result=fight(
match.p1,
match.p2
);


winners.push(result.winner);


}


return winners;

}



module.exports={
createBracket,
getWinners
};