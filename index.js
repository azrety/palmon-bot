const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  REST,
  Routes,
  SlashCommandBuilder
} = require('discord.js');

// 🔥 FIX node-fetch (compatible v3)
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const { DateTime } = require('luxon');

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const SHEET_ID = process.env.SHEET_ID;
const SHEET_API = process.env.SHEET_API;

const ATTR_GID = process.env.ATTR_GID // "1049184729" GID de la feuille "attributs" (modifiable dans .env)



const GUILD_ID = "1491506781245931563";

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
// CLASH GENERATOR //
const clashs = [
  "😐 Duel correct, rien de fou.",
  "🤨 C’était bizarre mais ok.",
  "🤨 Ca passe mais sans éclat",
  "📉 Niveau pas ouf aujourd’hui.",
  "⚖️ Match neutre, sans émotion.",
  "💀 HUMILIATION TOTALE pour {loser}",
  "💀 Humiliation publique validée",
  "☠️ Catastrophique… on en parle plus.",
  "☠️ Niveau catastrophique... vraiment insupportable à regarder.",
  "🤡 {loser} a juste servi de sparring.",
  "🤡 {loser} s'est fait écraser sans résistance",
  "🚮 {loser} direction la poubelle des stats !",
  "🪦 {loser} a quitté le jeu mentalement",
  "🔥 C’était un carnage sans défense de {loser}.",
  "🏆 Victoire écrasante de {winner}. Y a même pas eu match.",
  "🔥 {winner} est venu, il a vu… et il a humilié.",
  "👑 On appelle ça une démonstration de {winner}.",
  "🎯 Merci d’être venu participer {winner}… enfin essayer.",
  "📊 Performance solide de {winner}, validée par la science et le ridicule adverse de {loser}.",
  "💀 Ouch… ça pique un peu là non {loser} ?",
  "😬 On va faire comme si t’avais pas essayé.",
  "🎭 {loser} a perdu avec dignité… enfin presque.",
  "🤏 C’est pas la taille qui compte… mais là ça aide pas.",
  "📉 On a connu des défaites, mais celle-là elle est collector.",
  "🔥 {loser} a réussi l’exploit de perdre avant même de commencer.",
  "🧠 Même le bot a hésité à afficher le résultat par respect.",
  "📚 C’est une défaite, mais surtout une leçon de vie pour {loser}.",
  "🗂️ On va archiver ça dans “fails historiques”.",
  "🥲 {loser} n’est pas dernier… ah si en fait.",
  "🤡 Analyse en cours… ah non pardon, c’était déjà fini.",
  "🧾 Résultat validé par un expert totalement impartial (moi).",
  "🎁 {winner} repart avec la gloire, {loser} avec… rien.",
  "💥 Tentative intéressante. Résultat catastrophique.",
  "🎟️ Le public demande un remboursement.",
  "😐 On a vu pire… mais pas aujourd’hui.",
  "🤨 C’était… quelque chose.",
  "😬 Le public reste partagé. Surtout entre rire et pleurer.",
  "📉 Pas sûr que les stats s’en remettent.",
  "⏩ Ça mérite… une rediffusion en accéléré. Donc en gros, pas de rediffusion.",
  "🎯 On va dire que l’intention y était.",
  "📊 Un match qui existera, techniquement.",
  "👥 {winner} et {loser} ont participé. C’est déjà ça.",
  "🫥 On appelle ça une disparition en direct.",
  "👤 Même l’ombre de {loser} a quitté la partie.",
  "🗑️ C’est plus une défaite, c’est un effacement.",
  "🗜️ Il a été compressé en format zip.",
  "🔍 On cherche encore le respect quelque part sur le terrain.",
  "📢 Le score de {loser} parle, et il est violent.",
  "🏚️ On a assisté à un effondrement contrôlé.",
  "🚫 Le replay sera classé contenu sensible.",
  "👑 Domination totale de {winner}, sans appel, sans discussion.",
  "⚔️ {winner} a joué, {loser} a subi.",
  "📚 Une leçon donnée sans demander la permission.",
  "💥 C’était rapide, propre… et brutal. Merci {winner}!",
  "📦 Le match a été plié, rangé, archivé! Bien joué {winner}.",
  "🎁 Victoire de {winner} avec option humiliation incluse pour {loser}.",
  "🧠 Performance chirurgicale.",
  "🔥 Un carnage validé par la meta.",
  "🧪 Les scientifiques étudient encore ce qu’on vient de voir.",
  "🌀 Un moment qui restera dans… quelque chose.",
  "🎲 Même le RNG n’assume pas.",
  "🧠 On appelle ça une stratégie… audacieuse.",
  "🚪 Les lois de la logique ont quitté le chat.",
  "🌪️ Un résultat de {loser} sponsorisé par le chaos.",
  "❓ C’était prévu ? Non. Est-ce que ça passe ? Non plus.",
  "🤖 Le script lui-même hésite à valider.",
  "🔌 Il s’est fait débrancher proprement.",
  "🔁 Retour à l’écran titre recommandé.",
  "🕹️ Le bouton ‘retry’ commence à trembler.",
  "🌡️ Ça pique… même à distance.",
  "🧹 Il va falloir désinstaller la honte pour {loser}.",
  "💀 Le respect a pris un congé maladie.",
  "🤖 On a vu des bots jouer mieux que {loser}… parfois.",
  "💥 Même le spectateur a pris des dégâts de la part de {winner}.",
  "🎙️ Je commente, mais je comprends pas tout.",
  "😶 On m’avait pas préparé à ça.",
  "📉 Je suis payé pour analyser… mais là…",
  "🎭 On va faire comme si c’était normal.",
  "❌ Analyse en cours… erreur 404.",
  "👏 Je vais faire semblant d’être impressionné.",
  "🔇 On coupe le micro ? Non ? Bon…"
  
];
// CACHE// (pour éviter de spammer l’API à chaque interaction)
let SHEET_CACHE = {
  data: null,
  lastFetch: 0
};

const CACHE_TTL = 60 * 1000; // 60 secondes

// =========================
// REGISTER COMMANDS
// =========================
async function registerCommands() {
  const commands = [

// SEARCH PALMON//
    new SlashCommandBuilder()
      .setName('searchpalmon')
      .setDescription('Recherche un Palmon par ID')
      .addStringOption(o =>
        o.setName('id')
          .setDescription('Ex: 033 027')
          .setRequired(true)
      ),


//ADD PLAYER//
    new SlashCommandBuilder()
        .setName('addplayer')
        .setDescription('Ajouter un joueur')
        .addStringOption(o =>
          o.setName('name')
            .setDescription('Nom du joueur')
            .setRequired(true)
        )
        .addNumberOption(o =>
          o.setName('t1')
            .setDescription('Score T1')
            .setRequired(false)
        )
        .addNumberOption(o =>
          o.setName('t2')
            .setDescription('Score T2')
            .setRequired(false)
        )
        .addNumberOption(o =>
          o.setName('t3')
            .setDescription('Score T3')
            .setRequired(false)
        )
        .addNumberOption(o =>
          o.setName('t4')
            .setDescription('Score T4')
            .setRequired(false)
        ),

// UPGRADE//
    new SlashCommandBuilder()
      .setName('upgrade')
      .setDescription('Améliorer les stats d’un joueur')
      .addStringOption(o =>
        o.setName('name')
          .setDescription('Nom du joueur')
          .setRequired(true)
      )
      .addNumberOption(o =>
        o.setName('t1')
          .setDescription('Bonus T1')
      )
      .addNumberOption(o =>
        o.setName('t2')
          .setDescription('Bonus T2')
      )
      .addNumberOption(o =>
        o.setName('t3')
          .setDescription('Bonus T3')
      )
      .addNumberOption(o =>
        o.setName('t4')
          .setDescription('Bonus T4')
    ),
// STATS//
    new SlashCommandBuilder()
      .setName('stats')
      .setDescription('Voir stats'),
// HISTORY//
    new SlashCommandBuilder()
      .setName('history')
      .setDescription('Voir historique')
      .addStringOption(o =>
        o.setName('name')
          .setDescription('Nom du joueur')
          .setRequired(true)
      ),
//TOP//
    new SlashCommandBuilder()
      .setName('top')
      .setDescription('Classement des joueurs (T1)'),   
// CONCOURS TEUB//   
    new SlashCommandBuilder()
      .setName('concours-teub')
      .setDescription('Comparer 2 joueurs')
      .addStringOption(o =>
        o.setName('joueur1')
          .setDescription('Premier joueur')
          .setRequired(true)
      )
      .addStringOption(o =>
        o.setName('joueur2')
          .setDescription('Deuxième joueur')
          .setRequired(true)
      ),
  ].map(c => c.toJSON());
// fintableau//

  const rest = new REST({ version: '10' }).setToken(TOKEN);

  await rest.put(
    Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
    { body: commands }
  );

  console.log("✅ Commands OK");
}
// =========================
// FETCH SHEET DATA WITH CACHE
// =========================
async function getSheetData() {
  const now = Date.now();

  // ✅ cache encore valide
  if (SHEET_CACHE.data && (now - SHEET_CACHE.lastFetch < CACHE_TTL)) {
    return SHEET_CACHE.data;
  }

  // ❌ sinon refresh API
  const res = await fetch(
    `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&gid=307583676`
  );

  const text = await res.text();

  const json = JSON.parse(
    text.substring(text.indexOf("{"), text.lastIndexOf("}") + 1)
  );

  const players = json.table.rows.map(r => ({
    pseudo: r.c[0]?.v || "Inconnu",
    mons: [r.c[1]?.v, r.c[2]?.v, r.c[3]?.v, r.c[4]?.v].filter(Boolean)
  }));

  SHEET_CACHE = {
    data: players,
    lastFetch: now
  };

  return players;
}

let ATTR_CACHE = {
  data: null,
  lastFetch: 0
};

const ATTR_CACHE_TTL = 60 * 1000;

async function getAttributesData() {
  const now = Date.now();

  if (ATTR_CACHE.data && (now - ATTR_CACHE.lastFetch < ATTR_CACHE_TTL)) {
    return ATTR_CACHE.data;
  }

  const res = await fetch(
    `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&gid=${ATTR_GID}`
  );

  const text = await res.text();

  const json = JSON.parse(
    text.substring(text.indexOf("{"), text.lastIndexOf("}") + 1)
  );

  // ⚠️ adapte selon ton sheet attributs
  const attributes = json.table.rows.map(r => ({
    name: r.c[0]?.v || "Inconnu",
    data: r.c.slice(1).map(c => c?.v)
  }));

  ATTR_CACHE = {
    data: attributes,
    lastFetch: now
  };

  return attributes;
}
// =========================
client.once("ready", () => {
  console.log(`🤖 connecté ${client.user.tag}`);
  registerCommands();
});

// =========================
// HANDLER SAFE
// =========================
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const cmd = interaction.commandName;

  try {

    const name = interaction.options.getString("name");

    // =========================
    // ADD PLAYER
    // =========================
    if (cmd === "addplayer") {
      await interaction.deferReply();

      const res = await fetch(SHEET_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "addplayer",
          name,
          t1: interaction.options.getNumber("t1") ?? 0,
          t2: interaction.options.getNumber("t2") ?? 0,
          t3: interaction.options.getNumber("t3") ?? 0,
          t4: interaction.options.getNumber("t4") ?? 0
        })
      });

      const data = await res.json().catch(() => ({}));
      return interaction.editReply(data.success ? `✅ ${name} ajouté` : `❌ erreur API`);
    }

    // =========================
    // UPGRADE
    // =========================
    if (cmd === "upgrade") {
      await interaction.deferReply();

      const res = await fetch(SHEET_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "upgrade",
          name,
          t1: interaction.options.getNumber("t1") ?? null,
          t2: interaction.options.getNumber("t2") ?? null,
          t3: interaction.options.getNumber("t3") ?? null,
          t4: interaction.options.getNumber("t4") ?? null
        })
      });

      const data = await res.json().catch(() => ({}));
      return interaction.editReply(data.success ? `🔥 ${name} mis à jour` : `❌ erreur`);
    }

    // =========================
    // STATS
    // =========================
    if (cmd === "stats") {
      await interaction.deferReply();

      const res = await fetch(SHEET_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "getplayers" })
      });

      const data = await res.json().catch(() => null);

      if (!data?.success) return interaction.editReply("❌ API error");

      const embed = new EmbedBuilder()
        .setTitle("📊 Stats")
        .setColor(0x00AE86)
        .setDescription(
          data.players.map(p =>
            `👤 **${p.name}**
T1:${p.t1} | T2:${p.t2} | T3:${p.t3} | T4:${p.t4}`
          ).join("\n\n")
        );

      return interaction.editReply({ embeds: [embed] });
    }

    // =========================
    // HISTORY
    // =========================
    if (cmd === "history") {
    await interaction.deferReply();

    const res = await fetch(SHEET_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "history", name })
    });

    const data = await res.json().catch(() => ({}));

    if (!data.success || !data.history?.length) {
      return interaction.editReply("❌ Aucun historique");
    }

    const formatLine = (h, prev) => {
      const date = new Date(h.date).toLocaleString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
      });

      const diff = (a, b) =>
        prev ? (a - b !== 0 ? `(${(a - b > 0 ? "+" : "") + (a - b).toFixed(1)})` : "") : "";

      return `📅 ${date} → T1:${h.t1}${diff(h.t1, prev?.t1)} | T2:${h.t2}${diff(h.t2, prev?.t2)} | T3:${h.t3}${diff(h.t3, prev?.t3)} | T4:${h.t4}${diff(h.t4, prev?.t4)}`;
    };

    const lines = data.history.map((h, i) =>
      formatLine(h, i > 0 ? data.history[i - 1] : null)
    );

    // 🔥 PAGINATION
    const perPage = 5;
    let page = 0;
    const maxPage = Math.ceil(lines.length / perPage) - 1;

    const generateEmbed = (page) => {
      const start = page * perPage;
      const current = lines.slice(start, start + perPage);

      return new EmbedBuilder()
        .setTitle(`📜 Historique de ${data.name} (page ${page + 1}/${maxPage + 1})`)
        .setColor(0x00AE86)
        .setDescription(current.join("\n"));
    };

    const getRow = () => new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("prev")
        .setLabel("⬅️")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(page === 0),

      new ButtonBuilder()
        .setCustomId("next")
        .setLabel("➡️")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(page === maxPage)
    );
    const msg = await interaction.editReply({
      embeds: [generateEmbed(page)],
      components: [getRow()]
    });
 

    const collector = msg.createMessageComponentCollector({ time: 60000 });

    collector.on("collect", async (i) => {
      if (i.user.id !== interaction.user.id) {
        return i.reply({ content: "❌ Pas pour toi", ephemeral: true });
      }

      if (i.customId === "prev") page--;
      if (i.customId === "next") page++;

      const maxPage = Math.ceil(lines.length / perPage) - 1;
      if (page < 0) page = 0;
      if (page > maxPage) page = maxPage;

      await i.update({
        embeds: [generateEmbed(page)],
        components: [getRow()]
      });
    });

    collector.on("end", () => {
      msg.edit({ components: [] });
    });
  }

    // =========================
    // SEARCH PALMON
    // =========================
// =========================
// SEARCH PALMON
// =========================
if (cmd === "searchpalmon") {
  await interaction.deferReply();

  const args = interaction.options.getString("id")
    .trim()
    .split(/\s+/)
    .map(id => id.padStart(3, "0"));

  const players = await getSheetData();

  // 🔎 FILTER
  const results = players.filter(p =>
    args.every(id =>
      p.mons.some(m => m.includes(id))
    )
  );

  if (!results.length) {
    return interaction.editReply("❌ Aucun résultat");
  }

  // =========================
  // FORMAT LINES (DISPLAY EXACT STYLE)
  // =========================
const attributes = await getAttributesData();

const normalizeId = (v) =>
  String(v)
    .replace(/\D/g, "")   // enlève tout sauf chiffres
    .padStart(3, "0");

const lines = results.map(p => {
  const mons = p.mons.map(m => {
    const id = normalizeId(m);

    const attr = attributes.find(a =>
      normalizeId(a.data?.[0]) === id
    );

    if (!attr) {
      return `• 🟡 ${id}`;
    }

    const [nameFR, nameEN, nameES, nameDE, rank] = attr.data || [];

    return `• 🟡 ${id} [${rank || "?"}] (${nameFR || "?"}/${nameEN || "?"}/${nameES || "?"}/${nameDE || "?"})`;
  }).join("\n");

  return `👤 ${p.pseudo}\n${mons}`;
});

    const [nameFR, nameEN, nameES, nameDE, rank] = attr.data || [];

    return `• 🟡 ${id} [${rank || "?"}] (${nameFR || "?"}/${nameEN || "?"}/${nameES || "?"}/${nameDE || "?"})`;
  }).join("\n");

  return `👤 ${p.pseudo}\n${mons}`;
});

  // =========================
  // PAGINATION
  // =========================
  const perPage = 3;
  let page = 0;
  const maxPage = Math.ceil(lines.length / perPage) - 1;

  const generateEmbed = () => {
    const start = page * perPage;
    const current = lines.slice(start, start + perPage);

    // 🔥 HEADER STYLE EXACT DEMANDE
    return new EmbedBuilder()
      .setTitle(`🔎 ${args.join(" ")} (${results.length} résultats)`)
      .setColor(0xFFD700)
      .setDescription(current.join("\n\n"))
      .setFooter({ text: `Page ${page + 1}/${maxPage + 1}` });
  };

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("prev")
      .setLabel("⬅️")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(page === 0),

    new ButtonBuilder()
      .setCustomId("next")
      .setLabel("➡️")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(page === maxPage)
  );

  const msg = await interaction.editReply({
    embeds: [generateEmbed()],
    components: [row]
  });

  const collector = msg.createMessageComponentCollector({
    time: 60000
  });

  collector.on("collect", async (i) => {
    if (i.user.id !== interaction.user.id) {
      return i.reply({ content: "❌ Pas pour toi", ephemeral: true });
    }

    if (i.customId === "prev") page--;
    if (i.customId === "next") page++;

    if (page < 0) page = 0;
    if (page > maxPage) page = maxPage;

    await i.update({
      embeds: [generateEmbed()],
      components: [row]
    });
  });

  collector.on("end", () => {
    msg.edit({ components: [] });
  });
}
// =========================
// TOP
// =========================
if (cmd === "top") {
  await interaction.deferReply();

  const res = await fetch(SHEET_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "getplayers" })
  });

  const data = await res.json().catch(() => null);

  if (!data?.success) {
    return interaction.editReply("❌ API error");
  }

  // TRI
  const players = data.players.sort((a, b) => (b.t1 || 0) - (a.t1 || 0));

  const pageSize = 10;
  let page = 0;
  const maxPage = Math.ceil(players.length / pageSize) - 1;

  const medals = ["🥇", "🥈", "🥉"];

  function generateEmbed(page) {
    const start = page * pageSize;
    const current = players.slice(start, start + pageSize);

    const lines = current.map((p, i) => {
      const rank = start + i;
      const medal = medals[rank] || `🏅 #${rank + 1}`;

      return `${medal} **${p.name}**
T1: ${p.t1} | T2: ${p.t2} | T3: ${p.t3} | T4: ${p.t4}`;
    });

    return new EmbedBuilder()
      .setTitle("🏆 Leaderboard - T1 Ranking")
      .setColor(0xFFD700)
      .setDescription(lines.join("\n\n"))
      .setFooter({ text: `Page ${page + 1} / ${maxPage + 1}` });
  }

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("prev")
      .setLabel("⬅️")
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId("next")
      .setLabel("➡️")
      .setStyle(ButtonStyle.Primary)
  );

  const message = await interaction.editReply({
    embeds: [generateEmbed(page)],
    components: [row]
  });

  const collector = message.createMessageComponentCollector({
    time: 60000
  });

  collector.on("collect", async (i) => {
    if (i.user.id !== interaction.user.id) {
      return i.reply({ content: "❌ Pas pour toi", ephemeral: true });
    }

    if (i.customId === "prev") {
      page = page > 0 ? page - 1 : maxPage;
    }

    if (i.customId === "next") {
      page = page < maxPage ? page + 1 : 0;
    }

    await i.update({
      embeds: [generateEmbed(page)],
      components: [row]
    });
  });

  collector.on("end", () => {
    message.edit({ components: [] });
  });
}
// ========================= 
// CONCOURS TEUB
// =========================
if (cmd === "concours-teub") {
  await interaction.deferReply();

  const j1 = interaction.options.getString("joueur1");
  const j2 = interaction.options.getString("joueur2");

  const res = await fetch(SHEET_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "getplayers" })
  });

  const data = await res.json().catch(() => null);
  if (!data?.success) return interaction.editReply("❌ API error");

  const p1 = data.players.find(p => p.name.toLowerCase() === j1.toLowerCase());
  const p2 = data.players.find(p => p.name.toLowerCase() === j2.toLowerCase());

  if (!p1 || !p2) {
    return interaction.editReply("❌ Joueur introuvable");
  }

  const stats = ["t1", "t2", "t3", "t4"];

  let score1 = 0;
  let score2 = 0;

  const lines = stats.map(stat => {
  const v1 = p1[stat] || 0;
  const v2 = p2[stat] || 0;

  let left = `${p1.name}: ${v1}`;
  let right = `${p2.name}: ${v2}`;

  if (v1 > v2) {
    left = `🟢 ${left}`;
    right = `🔴 ${right}`;
  } else if (v2 > v1) {
    left = `🔴 ${left}`;
    right = `🟢 ${right}`;
  } else {
    left = `⚖️ ${left}`;
    right = `⚖️ ${right}`;
  }

  return `• **${stat.toUpperCase()}** → ${left} ⚔️ ${right}`;
});

  const total1 = stats.reduce((acc, s) => acc + (p1[s] || 0), 0);
  const total2 = stats.reduce((acc, s) => acc + (p2[s] || 0), 0);
  const rawClash = clashs[Math.floor(Math.random() * clashs.length)];

  const winnerDynamic =
    total1 > total2 ? p1.name :
    total2 > total1 ? p2.name :
    null;

  const loserDynamic =
    total1 > total2 ? p2.name :
    total2 > total1 ? p1.name :
    null;

  const finalClash = rawClash
    .replace("{winner}", winnerDynamic ?? "personne")
    .replace("{loser}", loserDynamic ?? "personne");

  const winnerName =
  total1 > total2 ? p1.name :
  total2 > total1 ? p2.name :
  "ÉGALITÉ PARFAITE";

  const winnerEmoji =
    total1 > total2 ? "🟥" :
    total2 > total1 ? "🟦" :
    "⚖️";

  const embed = new EmbedBuilder()
    .setTitle("⚔️ ARENA MATCH : CONCOURS DE TEUB")
    .setColor(0xFF00FF)
    .setDescription(
`🟥 **${p1.name}**  VS  🟦 **${p2.name}**

🎮 *Bienvenue dans ce nouveau concours de teub où les cerveaux s'affrontent!*
## 🎯 Sortez vos armes ...

🤛*READY...FIGHT*🤜

${lines.join("\n")}
--- 
## 📊 FINAL SCORE

🟥 **${p1.name}** → ${total1} pts  
🟦 **${p2.name}** → ${total2} pts  
---
## 🏆 WINNER

${winnerEmoji} **${winnerName}**

## 🎙️ LIVE COMMENTATOR
💬 *${finalClash}*

📡 *“Ce match vient d’entrer dans les annales du serveur…”*
`
  );

  return interaction.editReply({ embeds: [embed] });
}
      } catch (err) {
        console.error(err);
        if (interaction.deferred)
          return interaction.editReply("❌ erreur serveur");
      }
    });

client.login(TOKEN);