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

// 🔥 GOOGLE SCRIPT API
const SHEET_API = "https://script.google.com/macros/s/AKfycbw60BEwx1byiUpcJ-inREfrR5aFRVBvU569F7qQEC0BUcI5cMx5q8MqaNj3TlqQHydEnQ/exec";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// =========================
// SLASH COMMANDS
// =========================
async function registerCommands() {

  const commands = [
    new SlashCommandBuilder()
      .setName('searchpalmon')
      .setDescription('Recherche un Palmon par ID')
      .addStringOption(option =>
        option.setName('id')
          .setRequired(true)
      ),

    new SlashCommandBuilder()
      .setName('event')
      .setDescription('Créer un événement')
      .addStringOption(o => o.setName('nom').setRequired(true))
      .addStringOption(o => o.setName('heure').setRequired(true))
      .addIntegerOption(o => o.setName('rappel')),

    // ➕ ADD PLAYER
    new SlashCommandBuilder()
      .setName('addplayer')
      .setDescription('Ajouter un joueur')
      .addStringOption(o => o.setName('name').setRequired(true))
      .addNumberOption(o => o.setName('t1'))
      .addNumberOption(o => o.setName('t2'))
      .addNumberOption(o => o.setName('t3'))
      .addNumberOption(o => o.setName('t4')),

    // ⚡ UPGRADE PLAYER
    new SlashCommandBuilder()
      .setName('upgrade')
      .setDescription('Modifier puissance joueur')
      .addStringOption(o => o.setName('name').setRequired(true))
      .addNumberOption(o => o.setName('t1'))
      .addNumberOption(o => o.setName('t2'))
      .addNumberOption(o => o.setName('t3'))
      .addNumberOption(o => o.setName('t4'))

  ].map(cmd => cmd.toJSON());

  const rest = new REST({ version: '10' }).setToken(TOKEN);

  await rest.put(
    Routes.applicationGuildCommands(CLIENT_ID, "1491506781245931563"),
    { body: commands }
  );

  console.log("✅ Slash commands OK");
}

// =========================
// ERROR HANDLING
// =========================
process.on("unhandledRejection", (err) => {
  console.error("❌ ERROR:", err);
});

// =========================
// UTILS
// =========================
const formatAll = (cell) => {
  if (!cell) return [];
  const value = cell.v ?? cell.f;
  if (!value) return [];
  return String(value).match(/\d{3}/g) || [];
};

const getEmoji = (category) => {
  return { S: "🟡", A: "🟣", B: "🔵", C: "⚪" }[category] || "❔";
};

const getColor = (ids, attrMap) => {
  for (let id of ids) {
    const c = attrMap[id]?.category;
    if (c === "S") return 0xFFD700;
    if (c === "A") return 0x800080;
    if (c === "B") return 0x0000FF;
    if (c === "C") return 0x808080;
  }
  return 0x00AE86;
};

// =========================
// SHEETS
// =========================
async function getAttributesMap() {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&gid=${GID_ATTR}`;
  const res = await fetch(url);
  const text = await res.text();

  const json = JSON.parse(text.substring(text.indexOf("{"), text.lastIndexOf("}") + 1));

  const map = {};
  json.table.rows.forEach(r => {
    const id = String(r.c[0]?.v).padStart(3, "0");

    map[id] = {
      name: `${r.c[2]?.v || ""}/${r.c[3]?.v || ""}/${r.c[4]?.v || ""}/${r.c[5]?.v || ""}`,
      category: r.c[1]?.v || "C"
    };
  });

  return map;
}

async function getData() {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&gid=${GID_PLAYERS}`;
  const res = await fetch(url);
  const text = await res.text();

  const json = JSON.parse(text.substring(text.indexOf("{"), text.lastIndexOf("}") + 1));

  return json.table.rows.map(r => ({
    pseudo: r.c[0]?.v || "Inconnu",
    ids: [
      ...formatAll(r.c[1]),
      ...formatAll(r.c[2]),
      ...formatAll(r.c[3]),
      ...formatAll(r.c[4])
    ]
  }));
}

// =========================
// SEARCH LOGIC
// =========================
async function runSearch(args) {
  const [data, attrMap] = await Promise.all([
    getData(),
    getAttributesMap()
  ]);

  const formatAttr = (id) => {
    const attr = attrMap[id];
    if (!attr) return `**${id}**`;
    return `${getEmoji(attr.category)} **${id}** [${attr.category}] (${attr.name})`;
  };

  const results = data.filter(p =>
    args.every(id => p.ids.includes(id))
  );

  return { results, attrMap, formatAttr };
}

// =========================
// BOT
// =========================
client.on("interactionCreate", async (interaction) => {

  if (!interaction.isChatInputCommand()) return;

  // 🔎 SEARCH
  if (interaction.commandName === "searchpalmon") {

    await interaction.deferReply();

    const args = interaction.options.getString("id")
      .trim()
      .split(/\s+/)
      .map(id => id.padStart(3, "0"));

    const { results, attrMap, formatAttr } = await runSearch(args);

    if (!results.length) return interaction.editReply("❌ Aucun résultat");

    const pageSize = 5;
    let page = 0;
    const totalPages = Math.ceil(results.length / pageSize);

    const generateEmbed = () => {
      const slice = results.slice(page * pageSize, (page + 1) * pageSize);

      return new EmbedBuilder()
        .setTitle(`🔎 ${args.join(" ")} (${results.length})`)
        .setColor(getColor(slice[0].ids, attrMap))
        .setDescription(
          slice.map(p =>
            `👤 **${p.pseudo}**
${p.ids.map(id => `• ${formatAttr(id)}`).join("\n")}`
          ).join("\n\n")
        )
        .setFooter({ text: `Page ${page + 1}/${totalPages}` });
    };

    const getButtons = () =>
      new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId("prev").setLabel("⬅️").setStyle(ButtonStyle.Secondary).setDisabled(page === 0),
        new ButtonBuilder().setCustomId("next").setLabel("➡️").setStyle(ButtonStyle.Secondary).setDisabled(page === totalPages - 1)
      );

    const msg = await interaction.editReply({
      embeds: [generateEmbed()],
      components: [getButtons()]
    });

    const collector = msg.createMessageComponentCollector({ time: 60000 });

    collector.on("collect", async (i) => {
      if (i.user.id !== interaction.user.id)
        return i.reply({ content: "❌ Pas ta commande", ephemeral: true });

      if (i.customId === "prev") page--;
      if (i.customId === "next") page++;

      await i.update({
        embeds: [generateEmbed()],
        components: [getButtons()]
      });
    });
  }

  // 📅 EVENT
  if (interaction.commandName === "event") {

    const nom = interaction.options.getString("nom");
    const heure = interaction.options.getString("heure");
    const rappel = interaction.options.getInteger("rappel");

    const [h, m] = heure.split(':').map(Number);

    const now = DateTime.now().setZone("Europe/Paris");

    let target = now.set({ hour: h, minute: m, second: 0 });

    if (target < now) target = target.plus({ days: 1 });

    const timestamp = Math.floor(target.toSeconds());

    await interaction.reply(
      `@everyone 📅 **${nom}**\n🕒 <t:${timestamp}:F>\n⏳ <t:${timestamp}:R>`
    );
  }

  // ➕ ADD PLAYER
  if (interaction.commandName === "addplayer") {

    const name = interaction.options.getString("name");
    const t1 = interaction.options.getNumber("t1") || 0;
    const t2 = interaction.options.getNumber("t2") || 0;
    const t3 = interaction.options.getNumber("t3") || 0;
    const t4 = interaction.options.getNumber("t4") || 0;

    const url = `${SHEET_API}?cmd=add&name=${name}&team1=${t1}&team2=${t2}&team3=${t3}&team4=${t4}`;

    const res = await fetch(url);
    const text = await res.text();

    return interaction.reply(text);
  }

  // ⚡ UPGRADE PLAYER
  if (interaction.commandName === "upgrade") {

    const name = interaction.options.getString("name");
    const t1 = interaction.options.getNumber("t1");
    const t2 = interaction.options.getNumber("t2");
    const t3 = interaction.options.getNumber("t3");
    const t4 = interaction.options.getNumber("t4");

    let url = `${SHEET_API}?cmd=upgrade&name=${name}`;

    if (t1 !== null) url += `&team1=${t1}`;
    if (t2 !== null) url += `&team2=${t2}`;
    if (t3 !== null) url += `&team3=${t3}`;
    if (t4 !== null) url += `&team4=${t4}`;

    const res = await fetch(url);
    const text = await res.text();

    return interaction.reply(text);
  }

});

// =========================
client.once("ready", async () => {
  console.log(`✅ ${client.user.tag}`);
  await registerCommands();
});

client.login(TOKEN);