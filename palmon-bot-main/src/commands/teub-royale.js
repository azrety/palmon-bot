const { EmbedBuilder } = require("discord.js");
const { postSheetApi } = require("../services/sheets");

// Une seule royale peut animer un salon à la fois, pour éviter des commentaires mélangés.
const activeChannels = new Set();

const wait = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));

function shuffle(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function parseNames(value) {
  if (!value) return [];
  return [...new Set(value.split(",").map(name => name.trim().toLocaleLowerCase()).filter(Boolean))];
}

function getArenaScores(left, right) {
  const getScore = (player, stat) => Number(player[stat]) || 0;
  const includeT4 = getScore(left, "t4") !== 0 && getScore(right, "t4") !== 0;
  const total = player => getScore(player, "t1") + getScore(player, "t2") + getScore(player, "t3") + (includeT4 ? getScore(player, "t4") : 0);
  return { left: total(left), right: total(right), includeT4 };
}

function chooseWinner(left, right) {
  const scores = getArenaScores(left, right);
  if (scores.left !== scores.right) {
    return scores.left > scores.right ? left : right;
  }

  // En cas d'égalité de total, on compare les paliers un par un, sans hasard.
  const stats = ["t1", "t2", "t3"];
  if (scores.includeT4) stats.push("t4");
  for (const stat of stats) {
    const leftValue = Number(left[stat]) || 0;
    const rightValue = Number(right[stat]) || 0;
    if (leftValue !== rightValue) return leftValue > rightValue ? left : right;
  }

  // Des statistiques parfaitement identiques restent possibles : ordre stable, jamais aléatoire.
  return left.name.localeCompare(right.name, "fr", { sensitivity: "base" }) <= 0 ? left : right;
}

function randomFrom(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function displayBracket(rounds) {
  return rounds.map((round, index) => {
    const lines = round.map(match => {
      if (match.bye) return `🛡️ ${match.winner.name} passe automatiquement`;
      const state = match.winner ? `→ **${match.winner.name}**` : "en attente";
      return `⚔️ ${match.left.name} vs ${match.right.name} — ${state}`;
    });
    return `**Round ${index + 1}**\n${lines.join("\n")}`;
  }).join("\n\n");
}

async function sendCombat(channel, left, right, winner, delaySeconds) {
  const loser = winner === left ? right : left;
  const scores = getArenaScores(left, right);
  const intro = randomFrom([
    "La foule rugit, le duel commence !",
    "Les portes de l'arène s'ouvrent !",
    "Le public retient son souffle !"
  ]);
  const introEn = randomFrom([
    "The crowd is roaring, the battle begins!",
    "The arena gates are opening!",
    "The crowd is holding its breath!"
  ]);
  const action = randomFrom([
    "Une attaque brutale secoue l'arène !",
    "Le combat devient complètement imprévisible !",
    "Quel choc ! Personne n'avait vu ça venir !"
  ]);
  const actionEn = randomFrom([
    "A brutal attack shakes the arena!",
    "The battle becomes completely unpredictable!",
    "What a shock! Nobody saw that coming!"
  ]);
  const ending = randomFrom([
    `${winner.name} écrase complètement ${loser.name}.`,
    `${loser.name} tombe après un duel légendaire.`,
    `${winner.name} arrache la victoire sous les cris du public.`
  ]);
  const endingEn = randomFrom([
    `${winner.name} completely crushes ${loser.name}.`,
    `${loser.name} falls after a legendary battle.`,
    `${winner.name} snatches victory under the crowd's roar.`
  ]);

  await channel.send(`━━━━━━━━ COMBAT ━━━━━━━━\n⚔️ **${left.name} VS ${right.name}**\n\n📣 ${intro}\n📣 ${introEn}`);
  await wait(delaySeconds * 1000);
  const t4Note = scores.includeT4 ? "" : "\n⏭️ T4 non compté / T4 not counted";
  await channel.send(`🥁 Les combattants se jaugent…\n🥁 The fighters are sizing each other up…\n\n📊 Scores d'arène / Arena scores : **${left.name} ${scores.left}** • **${right.name} ${scores.right}**${t4Note}`);
  await wait(delaySeconds * 1000);
  await channel.send(`💥 ${action}\n💥 ${actionEn}\n\n📊 Les statistiques désignent le vainqueur…\n📊 The statistics determine the winner…`);
  await wait(delaySeconds * 1000);
  await channel.send(`🏆 **${winner.name} L'EMPORTE !**\n🏆 **${winner.name} WINS!**\n\n🍆 ${ending}\n🍆 ${endingEn}\n\n💀 **${loser.name} est éliminé.**\n💀 **${loser.name} has been eliminated.**`);
}

module.exports = {
  name: "teub-royale",
  async execute(interaction) {
    const channelId = interaction.channelId;
    if (activeChannels.has(channelId)) {
      return interaction.reply({ content: "⏳ Une Teub Royale est déjà en cours dans ce salon.", ephemeral: true });
    }

    activeChannels.add(channelId);

    try {
      await interaction.deferReply();

      const mode = interaction.options.getString("mode");
      const participantsMode = interaction.options.getString("participants") || "auto";
      const requestedNames = parseNames(interaction.options.getString("joueurs"));
      const excludedNames = new Set(parseNames(interaction.options.getString("exclure")));
      const delaySeconds = interaction.options.getInteger("delai") || 7;

      if (participantsMode === "choisir" && requestedNames.length === 0) {
        return interaction.editReply("❌ Avec `participants: choisir`, indique une liste dans l'option `joueurs`.");
      }

      const data = await postSheetApi({ action: "getplayers" });
      if (!data?.success || !Array.isArray(data.players)) {
        return interaction.editReply("❌ Impossible de récupérer les joueurs.");
      }

      const playersByName = new Map(data.players.map(player => [player.name.trim().toLocaleLowerCase(), player]));
      const unknownNames = requestedNames.filter(name => !playersByName.has(name));
      const unknownExcluded = [...excludedNames].filter(name => !playersByName.has(name));

      if (unknownNames.length || unknownExcluded.length) {
        const missing = [...unknownNames, ...unknownExcluded].join(", ");
        return interaction.editReply(`❌ Joueur introuvable : ${missing}`);
      }

      const sourcePlayers = participantsMode === "choisir"
        ? requestedNames.map(name => playersByName.get(name))
        : data.players;
      const fighters = sourcePlayers.filter(player => !excludedNames.has(player.name.trim().toLocaleLowerCase()));

      if (fighters.length < 2) {
        return interaction.editReply("❌ Il faut au moins deux joueurs pour lancer une Teub Royale.");
      }

      const participantList = fighters.map(player => `• ${player.name}`).join("\n");
      const intro = new EmbedBuilder()
        .setColor(0x9B59B6)
        .setTitle("👑 TEUB ROYALE — BATTLE ROYALE 👑")
        .setDescription(`📣 **Le concours va démarrer !**\n📣 **The battle will start soon!**\n\n⚔️ **${fighters.length} combattants entrent dans l'arène.**\n⚔️ **${fighters.length} fighters enter the arena.**\n\n${participantList}\n\n💀 *Il n'en restera qu'un.*\n💀 *There can be only one.*`)
        .setFooter({ text: `${mode === "bracket" ? "🏆 Bracket fixe" : "🎲 Tirage aléatoire à chaque manche"} • Tempo : ${delaySeconds}s` });

      await interaction.editReply({ embeds: [intro] });
      await wait(10000);

      let survivors = mode === "bracket" ? shuffle(fighters) : fighters;
      const bracketRounds = [];
      let roundNumber = 1;

      while (survivors.length > 1) {
        if (mode === "random") survivors = shuffle(survivors);
        const currentSurvivors = [...survivors];
        const nextRound = [];
        const matches = [];

        await interaction.channel.send(`════════ **${roundNumber === 1 ? "ROUND 1" : `ROUND ${roundNumber}`}** ════════\n👥 Combattants restants / Fighters remaining: **${currentSurvivors.length}**`);

        while (survivors.length >= 2) {
          const left = survivors.shift();
          const right = survivors.shift();
          const winner = chooseWinner(left, right);
          matches.push({ left, right, winner });
          await sendCombat(interaction.channel, left, right, winner, delaySeconds);
          nextRound.push(winner);
        }

        if (survivors.length === 1) {
          const bye = survivors.shift();
          matches.push({ bye: true, winner: bye });
          nextRound.push(bye);
          await interaction.channel.send(`🛡️ **${bye.name}** reçoit un passage automatique.\n🛡️ **${bye.name}** receives a bye to the next round.`);
        }

        if (mode === "bracket") bracketRounds.push(matches);
        const survivorsText = nextRound.map(player => `• ${player.name}`).join("\n");
        const recap = mode === "bracket" ? `\n\n${displayBracket(bracketRounds)}` : "";
        await interaction.channel.send(`════════ **FIN DU ROUND ${roundNumber}** ════════\n✅ **Survivants / Survivors**\n${survivorsText}${recap}`);

        survivors = nextRound;
        roundNumber += 1;
        if (survivors.length > 1) {
          await interaction.channel.send("⏳ Prochain round dans **1 minute**…\n⏳ Next round in **1 minute**…");
          await wait(60000);
        }
      }

      const champion = survivors[0];
      const finalEmbed = new EmbedBuilder()
        .setColor(0xF1C40F)
        .setTitle("👑 LE DERNIER DEBOUT / THE LAST ONE STANDING 👑")
        .setDescription(`🏆 **${champion.name} REMPORTE LA TEUB ROYALE !**\n🏆 **${champion.name} WINS THE TEUB ROYALE!**\n\n💀 Tous les autres ont été éliminés.\n💀 Everyone else has been eliminated.\n\n🎉 Après ${roundNumber - 1} rounds, ${champion.name} est le dernier debout.`);
      await interaction.channel.send({ embeds: [finalEmbed] });
    } finally {
      activeChannels.delete(channelId);
    }
  }
};
