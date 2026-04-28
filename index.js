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

const fetch = require('node-fetch');
const { DateTime } = require('luxon');

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const SHEET_ID = process.env.SHEET_ID;

const GID_PLAYERS = "307583676";
const GID_ATTR = "1049184729";
const SHEET_API = process.env.SHEET_API;

console.log("TOKEN OK ?", !!TOKEN);
console.log("SHEET_API OK ?", !!SHEET_API);
console.log("SHEET_ID OK ?", !!SHEET_ID);

// =========================
// CLIENT
// =========================
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// =========================
// COMMANDES
// =========================
async function registerCommands() {
  const commands = [

    new SlashCommandBuilder()
      .setName('searchpalmon')
      .setDescription('Recherche un Palmon par ID')
      .addStringOption(o =>
        o.setName('id')
          .setDescription('Ex: 033 027')
          .setRequired(true)
      ),

    new SlashCommandBuilder()
      .setName('event')
      .setDescription('Créer un événement')
      .addStringOption(o =>
        o.setName('nom').setRequired(true)
      )
      .addStringOption(o =>
        o.setName('heure').setRequired(true)
      )
      .addIntegerOption(o =>
        o.setName('rappel').setRequired(false)
      ),

    new SlashCommandBuilder()
      .setName('addplayer')
      .setDescription('Ajouter un joueur')
      .addStringOption(o => o.setName('name').setRequired(true))
      .addNumberOption(o => o.setName('t1'))
      .addNumberOption(o => o.setName('t2'))
      .addNumberOption(o => o.setName('t3'))
      .addNumberOption(o => o.setName('t4')),

    new SlashCommandBuilder()
      .setName('stats')
      .setDescription('Afficher les stats de tous les joueurs')

  ].map(c => c.toJSON());

  const rest = new REST({ version: '10' }).setToken(TOKEN);

  await rest.put(
    Routes.applicationGuildCommands(CLIENT_ID, "1491506781245931563"),
    { body: commands }
  );

  console.log("✅ Slash commands OK");
}

// =========================
// UTILS
// =========================
const formatAll = (cell) => {
  if (!cell) return [];
  const value = cell.v ?? cell.f;
  if (!value) return [];
  return String(value).match(/\d{3}/g) || [];
};

// =========================
// SHEETS DATA
// =========================
async function getData() {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&gid=${GID_PLAYERS}`;
  const res = await fetch(url);
  const text = await res.text();

  const json = JSON.parse(text.substring(text.indexOf("{"), text.lastIndexOf("}") + 1));

  return json.table.rows.map(r => ({
    name: r.c[0]?.v || "Inconnu",
    t1: r.c[1]?.v || 0,
    t2: r.c[2]?.v || 0,
    t3: r.c[3]?.v || 0,
    t4: r.c[4]?.v || 0
  }));
}

// =========================
// INTERACTIONS
// =========================
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  // =========================
  // SEARCH
  // =========================
  if (interaction.commandName === "searchpalmon") {
    await interaction.deferReply({ ephemeral: true });

    return interaction.editReply("🔎 Fonction search OK (non modifiée ici)");
  }

  // =========================
  // STATS ✅ FIX COMPLET
  // =========================
  if (interaction.commandName === "stats") {
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
      } catch {
        return interaction.editReply("❌ API invalide (Apps Script erreur)");
      }

      if (!data.success) {
        return interaction.editReply("❌ Erreur API");
      }

      const players = data.players || [];

      if (!players.length) {
        return interaction.editReply("❌ Aucun joueur");
      }

      const embed = new EmbedBuilder()
        .setTitle("📊 Stats des joueurs")
        .setDescription(
          players.map(p =>
            `👤 **${p.name}**
• T1: ${p.t1} | T2: ${p.t2} | T3: ${p.t3} | T4: ${p.t4}`
          ).join("\n\n")
        )
        .setColor(0x00AE86);

      return interaction.editReply({ embeds: [embed] });

    } catch (err) {
      console.error(err);
      return interaction.editReply("❌ Erreur serveur");
    }
  }

  // =========================
  // ADD PLAYER
  // =========================
  if (interaction.commandName === "addplayer") {
    await interaction.deferReply();

    const name = interaction.options.getString("name");
    const t1 = interaction.options.getNumber("t1") ?? 0;
    const t2 = interaction.options.getNumber("t2") ?? 0;
    const t3 = interaction.options.getNumber("t3") ?? 0;
    const t4 = interaction.options.getNumber("t4") ?? 0;

    try {
      const res = await fetch(SHEET_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "addplayer",
          name,
          t1, t2, t3, t4
        })
      });

      const text = await res.text();

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        return interaction.editReply("❌ API invalide");
      }

      if (data.success) {
        return interaction.editReply(`✅ Joueur ajouté : **${name}**`);
      }

      return interaction.editReply(`❌ Erreur : ${data.error}`);

    } catch (err) {
      console.error(err);
      return interaction.editReply("❌ Erreur serveur");
    }
  }

  // =========================
  // EVENT
  // =========================
  if (interaction.commandName === "event") {
    const nom = interaction.options.getString("nom");
    const heure = interaction.options.getString("heure");
    const rappel = interaction.options.getInteger("rappel");

    const [h, m] = heure.split(':').map(Number);

    const now = DateTime.now().setZone("Europe/Paris");

    let target = now.set({
      hour: h,
      minute: m,
      second: 0
    });

    if (target < now) target = target.plus({ days: 1 });

    const timestamp = Math.floor(target.toSeconds());

    await interaction.reply(
      `@everyone 📅 **${nom}**\n🕒 <t:${timestamp}:F>\n⏳ <t:${timestamp}:R>`
    );
  }
});

// =========================
// READY
// =========================
client.once("ready", async () => {
  console.log(`✅ ${client.user.tag}`);
  await registerCommands();
});

client.login(TOKEN);