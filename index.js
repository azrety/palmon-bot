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
  "💀 HUMILIATION TOTALE.",
  "💀 Humiliation publique validée",
  "☠️ Catastrophique… on en parle plus.",
  "☠️ Niveau catastrophique... vraiment insupportable à regarder.",
  "🤡 T’as juste servi de sparring.",
  "🤡 Tu t'es fait écraser sans résistance",
  "🚮 Direction la poubelle des stats",
  "🪦 Ce joueur a quitté le jeu mentalement",
  "🔥 C’était un carnage sans défense.",
  "🏆 Victoire écrasante. Y a même pas eu match.",
  "🔥 Il est venu, il a vu… et il a humilié.",
  "👑 On appelle ça une démonstration.",
  "🎯 Merci d’être venu participer… enfin essayer.",
  "📊 Performance solide, validée par la science et le ridicule adverse.",
  "💀 Ouch… ça pique un peu là non ?",
  "😬 On va faire comme si t’avais pas essayé.",
  "🎭 T’as perdu avec dignité… enfin presque.",
  "🤏 C’est pas la taille qui compte… mais là ça aide pas.",
  "📉 On a connu des défaites, mais celle-là elle est collector.",
  "🔥 T’as réussi l’exploit de perdre avant même de commencer.",
  "🧠 Même le bot a hésité à afficher le résultat par respect.",
  "📚 C’est une défaite, mais surtout une leçon de vie.",
  "🗂️ On va archiver ça dans “fails historiques”.",
  "🥲 T’es pas dernier… ah si en fait.",
  "🤡 Analyse en cours… ah non pardon, c’était déjà fini.",
  "🧾 Résultat validé par un expert totalement impartial (moi).",
  "🎁 Le gagnant repart avec la gloire, le perdant avec… rien.",
  "💥 Tentative intéressante. Résultat catastrophique.",
  "🎟️ Le public demande un remboursement."
  
];
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

//  CREATE EVENT//
    new SlashCommandBuilder()
      .setName('event')
      .setDescription('Créer un événement')
      .addStringOption(o =>
        o.setName('nom')
          .setDescription('Nom de l\'event')
          .setRequired(true)
      )
      .addStringOption(o =>
        o.setName('heure')
          .setDescription('Heure format HH:MM')
          .setRequired(true)
      )
      .addIntegerOption(o =>
        o.setName('rappel')
          .setDescription('Rappel en minutes')
          .setRequired(false)
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
    // SEARCH PALMON (UNCHANGED)
    // =========================
    if (cmd === "searchpalmon") {
      await interaction.deferReply({ ephemeral: true });

      const args = interaction.options.getString("id")
        .trim()
        .split(/\s+/)
        .map(i => i.padStart(3, "0"));

      const res = await fetch(
        `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&gid=307583676`
      );

      const text = await res.text();
      const json = JSON.parse(text.substring(text.indexOf("{"), text.lastIndexOf("}") + 1));

      const players = json.table.rows.map(r => ({
        pseudo: r.c[0]?.v || "Inconnu",
        ids: [
          ...(r.c[1]?.v?.match(/\d{3}/g) || []),
          ...(r.c[2]?.v?.match(/\d{3}/g) || []),
          ...(r.c[3]?.v?.match(/\d{3}/g) || []),
          ...(r.c[4]?.v?.match(/\d{3}/g) || [])
        ]
      }));

      const results = players.filter(p =>
        args.every(id => p.ids.includes(id))
      );

      if (!results.length)
        return interaction.editReply("❌ Aucun résultat");

      const embed = new EmbedBuilder()
        .setTitle(`🔎 Résultats (${results.length})`)
        .setColor(0x00AE86)
        .setDescription(
          results.slice(0, 10).map(p =>
            `👤 **${p.pseudo}**
${p.ids.join(" ")}`
          ).join("\n\n")
        );

      return interaction.editReply({ embeds: [embed] });
    }

    // =========================
    // EVENT 
    // =========================
    if (cmd === "event") {
      const nom = interaction.options.getString("nom");
      const heure = interaction.options.getString("heure");

      const [h, m] = heure.split(":").map(Number);

      const now = DateTime.now().setZone("Europe/Paris");
      let target = now.set({ hour: h, minute: m, second: 0 });

      if (target < now) target = target.plus({ days: 1 });

      const ts = Math.floor(target.toSeconds());

      return interaction.reply(`📅 ${nom}\n<t:${ts}:F>\n<t:${ts}:R>`);
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

    let winner = "⚖️";
    if (v1 > v2) {
      winner = "🟢";
      score1++;
    } else if (v2 > v1) {
      winner = "🔴";
      score2++;
    }

    return `**${stat.toUpperCase()}** → ${p1.name}: ${v1} | ${p2.name}: ${v2} ${winner}`;
  });

  const total1 = stats.reduce((acc, s) => acc + (p1[s] || 0), 0);
  const total2 = stats.reduce((acc, s) => acc + (p2[s] || 0), 0);
  const randomClash = clashs[Math.floor(Math.random() * clashs.length)];

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

🎮 *Bienvenue dans ce nouveau concours de teub ou les cerveaux s'affrontent!"
## 🎯 Sortez vos armes ... ATTAQUEZ 

🔴 T1 → ${p1.name}: ${p1.t1} ⚔️ ${p2.name}: ${p2.t1}  
🔵 T2 → ${p1.name}: ${p1.t2} ⚔️ ${p2.name}: ${p2.t2}  
🟣 T3 → ${p1.name}: ${p1.t3} ⚔️ ${p2.name}: ${p2.t3}  
🟡 T4 → ${p1.name}: ${p1.t4} ⚔️ ${p2.name}: ${p2.t4}

## 📊 FINAL SCORE

🟥 **${p1.name}** → ${total1} pts  
🟦 **${p2.name}** → ${total2} pts  

---

## 🏆 WINNER

${winnerEmoji} **${winnerName}**

## 🎙️ LIVE COMMENTATOR
💬 *${randomClash}*

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