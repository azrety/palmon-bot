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

  ].map(c => c.toJSON());

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

      const lines = data.history.map(h => {
        const date = new Date(h.date).toLocaleString("fr-FR");

        return `📅 **${date}**
    T1: ${h.t1} | T2: ${h.t2} | T3: ${h.t3} | T4: ${h.t4}`;
      });

  const embed = new EmbedBuilder()
    .setTitle(`📜 Historique de ${data.name}`)
    .setColor(0x00AE86)
    .setDescription(lines.join("\n\n").slice(0, 4000)); // limite Discord

  return interaction.editReply({ embeds: [embed] });
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

      try {
        const res = await fetch(SHEET_API, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "getplayers" })
        });

        const text = await res.text();

        let data;
        try {
          data = JSON.parse(text);
        } catch (e) {
          console.log("RAW SHEET RESPONSE:", text);
          return interaction.editReply("❌ API renvoie du texte invalide");
        }

        if (!data?.success) {
          return interaction.editReply("❌ API error (backend)");
        }

        const sorted = data.players
          .sort((a, b) => (b.t1 || 0) - (a.t1 || 0))
          .slice(0, 10);

        const medals = ["🥇", "🥈", "🥉"];

        const lines = sorted.map((p, i) => {
          const medal = medals[i] || `🏅 #${i + 1}`;

          return `${medal} **${p.name}** — T1: ${p.t1} | T2: ${p.t2} | T3: ${p.t3} | T4: ${p.t4}`;
        });

        const embed = new EmbedBuilder()
          .setTitle("🏆 Leaderboard - T1 Ranking")
          .setColor(0xFFD700)
          .setDescription(lines.join("\n\n"));

        return interaction.editReply({ embeds: [embed] });

      } catch (err) {
        console.error(err);
        return interaction.editReply("❌ erreur réseau API");
      }
    }

client.login(TOKEN);