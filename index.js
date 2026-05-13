require('dotenv').config();

const {
  Client,
  GatewayIntentBits,
 EmbedBuilder,
  REST,
  Routes,
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require('discord.js');

// 🔥 FIX node-fetch (compatible v3)
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const { DateTime } = require('luxon');

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID; //1499887179936305303
const SHEET_ID = process.env.SHEET_ID;
const SHEET_API = process.env.SHEET_API;

const GID_PLAYERS = process.env.GID_PLAYERS; // 307583676
const GID_ATTR = process.env.GID_ATTR; // 1049184729;
const GUILD_ID = process.env.GUILD_ID; //1499887179936305303

//TRADUCTION r4 //
const translate = require('google-translate-api-x');

const translationGroups = {

  r4: {
    fr: '1491514382860156928',
    en: '1504214531033796709',
    es: '1504215963514441858'
  }

};

const webhookCache = {};
const path = require('path');

const getEmoji = (category) => {
  return { S: "🟡", A: "🟣", B: "🔵", C: "⚪" }[category] || "❔";
};
// BOT LANGUAGE (for attributes names)
const BOT_LANG = "en"; // change ici pour test

const getName = (attr) => {
  if (!attr) return "?";

  return `${attr.fr} / ${attr.en} / ${attr.es} / ${attr.de}`;
};



// =========================
// DISCORD CLIENT
// =========================

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.once("ready", async () => {
  console.log("Bot ready");
  await registerCommands();
});

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
            .setRequired(true)
        )
        .addNumberOption(o =>
          o.setName('t2')
            .setDescription('Score T2')
            .setRequired(true)
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
// PLAYERS //
    new SlashCommandBuilder()
      .setName('players')
      .setDescription('Liste des joueurs (sans stats)'),
// PEREFLOFLO //
    new SlashCommandBuilder()
      .setName('perefloflo')
      .setDescription('Introduction du Père Floflo'),
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
  map: null,
  lastFetch: 0
};

const ATTR_CACHE_TTL = 60 * 1000;

async function getAttributesMap() {
  const now = Date.now();

  if (ATTR_CACHE.map && (now - ATTR_CACHE.lastFetch < ATTR_CACHE_TTL)) {
    return ATTR_CACHE.map;
  }

  const res = await fetch(
    `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&gid=${GID_ATTR}`
  );

  const text = await res.text();

  const json = JSON.parse(
    text.substring(text.indexOf("{"), text.lastIndexOf("}") + 1)
  );

  const map = {};

  json.table.rows.forEach(r => {
    const id = String(r.c[0]?.v).trim().padStart(3, "0");

    map[id] = {
      id,
      category: r.c[1]?.v || "?",
      fr: r.c[2]?.v || "?",
      en: r.c[3]?.v || "?",
      es: r.c[4]?.v || "?",
      de: r.c[5]?.v || "?"
    };
  });

  ATTR_CACHE = {
    map,
    lastFetch: now
  };

  return map;
}

//WEBHOOKS // (pour les traductions, éviter de créer un webhook à chaque message)
async function getWebhook(channel) {

  if (webhookCache[channel.id]) {
    return webhookCache[channel.id];
  }

  const hooks = await channel.fetchWebhooks();

  let hook = hooks.find(h => h.name === 'GuildTranslator');

  if (!hook) {

    hook = await channel.createWebhook({
      name: 'GuildTranslator'
    });

  }

  webhookCache[channel.id] = hook;

  return hook;
}

/*
━━━━━━━━━━━━━━━━━━━━━━
FIND TRANSLATION GROUP
━━━━━━━━━━━━━━━━━━━━━━
*/

function findTranslationGroup(channelId) {

  for (const [groupName, langs] of Object.entries(translationGroups)) {

    for (const [lang, id] of Object.entries(langs)) {

      if (id === channelId) {

        return {
          groupName,
          sourceLang: lang,
          channels: langs
        };

      }
    }
  }

  return null;
}

// =========================
// HANDLER SAFE
// =========================

// =========================
// AUTO TRANSLATION
// =========================

client.on("messageCreate", async (message) => {

  try {

    if (message.author.bot) return;
    if (message.webhookId) return;

    const translationData = findTranslationGroup(message.channel.id);

    if (!translationData) return;

    if (!message.content) return;
    if (message.content.length < 2) return;

    const {
      sourceLang,
      channels
    } = translationData;

    for (const [targetLang, targetChannelId] of Object.entries(channels)) {

      // ignore même langue
      if (targetLang === sourceLang) continue;

      try {

        const translated = await translate(message.content, {
          from: sourceLang,
          to: targetLang
        });

        const targetChannel = await client.channels.fetch(targetChannelId);

        if (!targetChannel) continue;

        const webhook = await getWebhook(targetChannel);

        await webhook.send({
          content: translated.text,
          username: message.member?.displayName || message.author.username,
          avatarURL: message.author.displayAvatarURL(),
          allowedMentions: {
            parse: []
          }
        });

      } catch (err) {

        console.error("Erreur traduction :", err);

      }
    }

  } catch (err) {

    console.error(err);

  }
});

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
    const perPage = 6;
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
if (cmd === "searchpalmon") {
  await interaction.deferReply();

  const args = interaction.options.getString("id")
    .trim()
    .split(/\s+/)
    .map(id => id.padStart(3, "0"));

  const players = await getSheetData();
  const attributes = await getAttributesMap();

  const results = players.filter(p =>
    args.every(id => p.mons.includes(id))
  );

  if (!results.length) {
    return interaction.editReply("❌ Aucun résultat");
  }

  const formatMons = (p) => {
    return p.mons.map(m => {
      const id = String(m).padStart(3, "0");
      const attr = attributes[id];

      if (!attr) return `• ❔ ${id} [inconnu]`;

      return `• ${getEmoji(attr.category)} ${attr.id} [${attr.category}] (${getName(attr)})`;
    }).join("\n");
  };

  const lines = results.map(p =>
    `👤 **${p.pseudo}**\n${formatMons(p)}`
  );

  const perPage = 6;
  let page = 0;
  const maxPage = Math.ceil(lines.length / perPage) - 1;

  const generateEmbed = () => {
    const slice = lines.slice(page * perPage, (page + 1) * perPage);

    return new EmbedBuilder()
      .setTitle(`🔎 ${args.join(" ")} (${results.length} résultats)`)
      .setColor(0xFFD700)
      .setDescription(slice.join("\n\n"))
      .setFooter({ text: `Page ${page + 1}/${maxPage + 1}` });
  };

  const row = () => new ActionRowBuilder().addComponents(
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
    components: [row()]
  });

  const collector = msg.createMessageComponentCollector({ time: 60000 });

  collector.on("collect", async (i) => {
    if (i.user.id !== interaction.user.id)
      return i.reply({ content: "❌ Pas pour toi", ephemeral: true });

    if (i.customId === "prev") page--;
    if (i.customId === "next") page++;

    if (page < 0) page = 0;
    if (page > maxPage) page = maxPage;

    await i.update({
      embeds: [generateEmbed()],
      components: [row()]
    });
  });

  collector.on("end", () => {
    interaction.editReply({ components: [] }).catch(() => {});
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
// PLAYERS
// =========================
if (cmd === "players") {
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

  const names = data.players
    .map(p => p.name || p.pseudo)
    .filter(Boolean)
    .sort((a, b) =>
      a.localeCompare(b, "fr", { sensitivity: "base" })
    );

  const perPage = 20;
  let page = 0;
  const maxPage = Math.ceil(names.length / perPage) - 1;

  const generateEmbed = () => {
    const slice = names.slice(page * perPage, (page + 1) * perPage);

    return new EmbedBuilder()
      .setTitle("👥 Liste des joueurs")
      .setColor(0x00AE86)
      .setDescription(slice.map(n => `👤 ${n}`).join("\n"))
      .setFooter({ text: `Page ${page + 1}/${maxPage + 1}` });
  };

const row = () => new ActionRowBuilder().addComponents(
  new ButtonBuilder()
    .setCustomId(`players_prev_${interaction.id}`)
    .setLabel("⬅️")
    .setStyle(ButtonStyle.Primary)
    .setDisabled(page === 0),

  new ButtonBuilder()
    .setCustomId(`players_next_${interaction.id}`)
    .setLabel("➡️")
    .setStyle(ButtonStyle.Primary)
    .setDisabled(page === maxPage)
);

  const msg = await interaction.editReply({
    embeds: [generateEmbed()],
    components: [row()]
  });

  const collector = msg.createMessageComponentCollector({ time: 60000 });

  collector.on("collect", async (i) => {
    if (i.user.id !== interaction.user.id) {
      return i.reply({ content: "❌ Pas pour toi", ephemeral: true });
    }

    if (i.customId === `players_prev_${interaction.id}`) page--;
    if (i.customId === `players_next_${interaction.id}`) page++;

    if (page < 0) page = 0;
    if (page > maxPage) page = maxPage;

    await i.update({
      embeds: [generateEmbed()],
      components: [row()]
    });
  });

  collector.on("end", () => {
    msg.edit({ components: [] }).catch(() => {});
  });
}
// =========================
// PEREFLOFLO
// =========================
if (cmd === "perefloflo") {

  const intros = [
    "📖 Père Floflo s’avance vers le feu...",
    "🐉 Père Floflo descend de son dragon...",
    "🍺 Père Floflo vide sa chope avant de parler...",
    "🔥 Le vieux sage prépare son histoire...",
    "📚 Père Floflo ouvre un vieux livre qui sent la bière et le drame...",
    "🔥 Le feu crépite… et Père Floflo réclame le silence.",
    "🍺 Après 12 chopes et 3 défaites, Père Floflo revient raconter son histoire...",
    "🐉 Le dragon de Père Floflo se gare difficilement devant la taverne, mais il arrive...",
    "🌙 La nuit tombe sur le serveur… Père Floflo commence son récit sur le serveur 150.",
    "⚔️ Les guerriers se taisent. Même les plus débiles écoutent Père Floflo.",
    "🧙 Père Floflo ajuste sa robe magique tachée de sauce, avant de se lancer dans son récit.",
    "📜 Un vieux parchemin interdit vient d’être déroulé par père floflo…",
    "🪑 Père Floflo tire une chaise qui grince beaucoup trop fort.",
    "🍖 Père Floflo termine son sanglier rôti avant de parler.",
    "🕯️ Les bougies vacillent… quelque chose d’absurde se prépare.",
    "🎺 Les trompettes du chaos annoncent l’arrivée de Père Floflo !",
    "👴 Père Floflo tousse violemment avant de commencer son histoire.",
    "🍷 Père Floflo prétend être sobre aujourd’hui. Personne ne le croit, mais tout le monde l'écoute...",
    "🐀 Même les rats de la taverne arrêtent de bouger pour écouter le gland père floflo.",
    "🌪️ Une odeur de dragon humide et de parchemin envahit soudainement la pièce…",
    "📖 Père Floflo revient du serveur 150 avec un récit inquiétant.",
    "⚰️ Père Floflo affirme que cette histoire est “totalement vraie”.",
    "🧠 Père Floflo a eu une idée. C’est rarement bon signe. Mais écoutons le tout de même!",
    "🔔 Le grand moment est venu… Père Floflo raconte ENCORE une histoire.",
    "🍺 Père Floflo frappe la table si fort qu’une chope explose.",
    "🐉 Le dragon de Père Floflo refuse d’écouter cette histoire. Mais empêche qui que ce soit d'autres de ne pas l'écouter!!",
    "🎭 Personne n’était prêt pour ce qui va être raconté.",
    "📡 Transmission directe depuis la taverne des dégénérés.",
    "🪦 Certains disent que cette histoire a déjà détruit une guilde entière…",
    "🤏 Père Floflo regarde l’assemblée avec une sagesse douteuse.",
    "💀 Une histoire maudite est sur le point d’être racontée…",
    "🍗 Père Floflo parle la bouche pleine. Comme toujours...",
    "🧻 Le récit commence… et le respect disparaît immédiatement.",
    "🎙️ Père Floflo monte sur scène avec la grâce d’un sanglier bourré.",
    "📚 Père Floflo referme un livre qui aurait clairement dû rester fermé...",
    "🔥 Le silence devient gênant… Père Floflo prend la parole malgré tout.",
    "🍺 Père Floflo trébuche en arrivant, mais affirme que c’était prévu.",
    "🐉 Le dragon de Père Floflo dort encore… heureusement pour nous.",
    "🌙 Sous la lune du serveur, une légende douteuse commence.",
    "⚔️ Même les armes s’arrêtent de briller pour écouter cette histoire.",
    "📜 Un parchemin tremble… il ne veut pas être lu.",
    "🪑 Père Floflo s’assoit… la chaise regrette immédiatement.",
    "🍖 Il mâche encore. Mais il commence quand même.",
    "🕯️ Une bougie s’éteint toute seule… signe inquiétant, n'envisageant pas un bon présage pour le serveur 150 !",
    "🎺 Une fanfare inexistante annonce Père Floflo.",
    "👴 Père Floflo dit “j’ai déjà raconté pire”… personne ne le croit.",
    "🍷 Il assure être sobre. L’assemblée rit déjà.",
    "🌪️ L’air devient bizarrement alcoolisé.",
    "📖 Père Floflo annonce : “c’est une petite histoire”… mensonge.",
    "⚰️ Cette histoire a été classée niveau danger 5/5 par personne.",
    "🧠 Une idée dangereuse vient d’apparaître dans l’esprit de Floflo.",
    "🔔 Le serveur sent qu’il va regretter ce moment.",
    "🍺 Une table a déjà été frappée. On ne sait pas pourquoi.",
    "🎭 Le public est prêt… ou pas du tout en fait.",
    "📡 Diffusion illégale d’une histoire douteuse en cours.",
    "🪦 Une ancienne guilde a déjà disparu à cause de ce récit.",
    "🤏 Père Floflo dit que “ça va être rapide”… mensonge confirmé.",
    "💀 Le niveau de crédibilité est proche de zéro.",
    "🍗 Il continue de parler entre deux bouchées.",
    "🧻 Le respect du lore est officiellement annulé.",
    "🎙️ Père Floflo ajuste sa voix… ça ne va pas rassurer.",
    "🍺 Père Floflo débarque sur son dragon rouillé, choppe à la main, prêt à raconter une histoire aussi douteuse qu’incroyable.",
    "🐉 Le feu crépite, les tavernes ferment… et Père Floflo ouvre enfin son grand livre des légendes alcoolisées.",
    "⚔️ Père Floflo ajuste sa robe, vide sa chope d’une traite et s’apprête à vous conter l’histoire du soir.",
    "🌙 Dans les terres oubliées du pastis sacré, Père Floflo revient une fois de plus pour partager son récit.",
    "🍖 Père Floflo sort des buissons avec son dragon et un saucisson entier pour vous narrer une aventure mémorable.",
    "🔥 Attention… quand Père Floflo s’approche avec sa choppe fumante, c’est qu’une histoire va commencer.",
    "🍻 Après 12 pintes et 3 bagarres de taverne, Père Floflo est enfin prêt à raconter son histoire.",
    "🏰 Les anciens l’attendaient, les bardes le craignaient… Père Floflo est là pour conter les légendes du royaume.",
    "🐲 Père Floflo descend du ciel sur son dragon asthmatique pour vous livrer le récit du soir.",
    "📜 Père Floflo ouvre un vieux parchemin taché de bière… préparez-vous à entendre une histoire légendaire.",
    "⚡ Le tonnerre gronde, les chopes s’entrechoquent… Père Floflo prend la parole.",
    "🍗 Père Floflo arrive à moitié perdu, une aile de poulet dans une main et une histoire dans l’autre.",
    "🧙 Père Floflo, grand sage des tavernes et maître du houblon, revient pour illuminer votre soirée.",
    "🪓 Père Floflo plante sa hache dans la table, réclame le silence… et commence son récit.",
    "🍺 Quand Père Floflo apparaît au coin du feu, même les dragons ferment leur gueule pour écouter.",
    "🍺 Père Floflo débarque sur son dragon rouillé, choppe à la main, prêt à raconter une histoire aussi douteuse qu’incroyable.",
    "🐉 Le feu crépite, les tavernes ferment… et Père Floflo ouvre enfin son grand livre des légendes alcoolisées.",
    "⚔️ Père Floflo ajuste sa robe, vide sa chope d’une traite et s’apprête à vous conter l’histoire du soir.",
    "🌙 Dans les terres oubliées du pastis sacré, Père Floflo revient une fois de plus pour partager son récit.",
    "🍖 Père Floflo sort des buissons avec son dragon et un saucisson entier pour vous narrer une aventure mémorable.",
    "🔥 Attention… quand Père Floflo s’approche avec sa choppe fumante, c’est qu’une histoire va commencer.",
    "🍻 Après 12 pintes et 3 bagarres de taverne, Père Floflo est enfin prêt à raconter son histoire.",
    "🏰 Les anciens l’attendaient, les bardes le craignaient… Père Floflo est là pour conter les légendes du royaume.",
    "🐲 Père Floflo descend du ciel sur son dragon asthmatique pour vous livrer le récit du soir.",
    "📜 Père Floflo ouvre un vieux parchemin taché de bière… préparez-vous à entendre une histoire légendaire.",
    "⚡ Le tonnerre gronde, les chopes s’entrechoquent… Père Floflo prend la parole.",
    "🍗 Père Floflo arrive à moitié perdu, une aile de poulet dans une main et une histoire dans l’autre.",
    "🧙 Père Floflo, grand sage des tavernes et maître du houblon, revient pour illuminer votre soirée.",
    "🪓 Père Floflo plante sa hache dans la table, réclame le silence… et commence son récit.",
    "🍺 Quand Père Floflo apparaît au coin du feu, même les dragons ferment leur gueule pour écouter."
  ];

  const sounds = [
    "floflo.mp3",
    "floflo1.mp3",
    "floflo2.mp3",
    "floflo3.mp3",
    "floflo4.mp3",
    "floflo6.mp3",
  ];

  const intro =
    intros[Math.floor(Math.random() * intros.length)];

  const sound =
    sounds[Math.floor(Math.random() * sounds.length)];

  await interaction.reply({
    content: intro,
    files: [{
      attachment: path.join(
        __dirname,
        'sounds',
        sound
      ),
      name: 'pere-floflo-intro.mp3'
    }]
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

   
console.log("🚀 Bot start...");
console.log("TOKEN exists:", !!TOKEN);
console.log("Bot ready !");

client.login(TOKEN)
  .then(() => console.log("✅ Connecté à Discord"))
  .catch(err => console.error("❌ Login error:", err));