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

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// =========================
// COMMANDS
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
        o.setName('nom')
          .setDescription("Nom de l'event")
          .setRequired(true)
      )
      .addStringOption(o =>
        o.setName('heure')
          .setDescription('HH:MM')
          .setRequired(true)
      )
      .addIntegerOption(o =>
        o.setName('rappel')
          .setDescription('Rappel en minutes')
      ),

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

    new SlashCommandBuilder()
      .setName('stats')
      .setDescription('Stats des joueurs'),

     new SlashCommandBuilder()
    .setName('history')
    .setDescription('Afficher l’historique d’un joueur')
    .addStringOption(o =>
      o.setName('name')
        .setDescription('Nom du joueur')
        .setRequired(true)
    ), 

  ].map(c => c.toJSON());

  const rest = new REST({ version: '10' }).setToken(TOKEN);

  await rest.put(
    Routes.applicationGuildCommands(CLIENT_ID, "1491506781245931563"),
    { body: commands }
  );

  console.log("✅ Slash commands enregistrées !");
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

const getEmoji = (c) => ({ S: "🟡", A: "🟣", B: "🔵", C: "⚪" }[c] || "❔");

const getColor = (ids, map) => {
  for (const id of ids) {
    const c = map[id]?.category;
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

async function runSearch(args) {
  const [data, map] = await Promise.all([getData(), getAttributesMap()]);

  const formatAttr = (id) => {
    const a = map[id];
    if (!a) return `**${id}**`;
    return `${getEmoji(a.category)} **${id}** [${a.category}] (${a.name})`;
  };

  const results = data.filter(p => args.every(id => p.ids.includes(id)));

  return { results, map, formatAttr };
}

// =========================
// INTERACTIONS
// =========================
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName } = interaction;

  try {
    switch (commandName) {

      // =========================
      // SEARCH PALMON
      // =========================
      case "searchpalmon": {
        await interaction.deferReply({ ephemeral: true });

        const args = interaction.options.getString("id")
          .trim()
          .split(/\s+/)
          .map(i => i.padStart(3, "0"));

        const { results, map, formatAttr } = await runSearch(args);

        if (!results.length)
          return interaction.editReply("❌ Aucun résultat");

        let page = 0;
        const pageSize = 5;
        const total = Math.ceil(results.length / pageSize);

        const build = () => {
          const slice = results.slice(page * pageSize, (page + 1) * pageSize);

          return new EmbedBuilder()
            .setTitle(`🔎 ${args.join(" ")} (${results.length})`)
            .setColor(getColor(slice[0].ids, map))
            .setDescription(
              slice.map(p =>
                `👤 **${p.pseudo}**
${p.ids.map(id => `• ${formatAttr(id)}`).join("\n")}`
              ).join("\n\n")
            )
            .setFooter({ text: `Page ${page + 1}/${total}` });
        };

        const row = () =>
          new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId("prev")
              .setLabel("⬅️")
              .setStyle(ButtonStyle.Secondary)
              .setDisabled(page === 0),

            new ButtonBuilder()
              .setCustomId("next")
              .setLabel("➡️")
              .setStyle(ButtonStyle.Secondary)
              .setDisabled(page === total - 1)
          );

        const msg = await interaction.editReply({
          embeds: [build()],
          components: [row()]
        });

        const collector = msg.createMessageComponentCollector({ time: 60000 });

        collector.on("collect", async i => {
          if (i.user.id !== interaction.user.id)
            return i.reply({ content: "❌ Pas ta commande", ephemeral: true });

          if (i.customId === "prev") page--;
          if (i.customId === "next") page++;

          await i.update({
            embeds: [build()],
            components: [row()]
          });
        });

        break;
      }

      // =========================
      // STATS
      // =========================
      case "stats": {
        await interaction.deferReply();

        const res = await fetch(SHEET_API, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "getplayers" })
        });

        const data = await res.json();

        if (!data.success)
          return interaction.editReply("❌ API error");

        const embed = new EmbedBuilder()
          .setTitle("📊 Stats")
          .setDescription(
            data.players.map(p =>
              `👤 **${p.name}**
T1:${p.t1} | T2:${p.t2} | T3:${p.t3} | T4:${p.t4}`
            ).join("\n\n")
          )
          .setColor(0x00AE86);

        return interaction.editReply({ embeds: [embed] });
      }

      // =========================
      // EVENT
      // =========================
      case "event": {
        const nom = interaction.options.getString("nom");
        const heure = interaction.options.getString("heure");

        const [h, m] = heure.split(":").map(Number);
        if (isNaN(h) || isNaN(m))
          return interaction.reply("❌ HH:MM invalide");

        const now = DateTime.now().setZone("Europe/Paris");

        let target = now.set({ hour: h, minute: m, second: 0 });
        if (target < now) target = target.plus({ days: 1 });

        const ts = Math.floor(target.toSeconds());

        return interaction.reply(
          `@everyone 📅 ${nom}\n<t:${ts}:F>\n<t:${ts}:R>`
        );
      }

      // =========================
      // ADD + UPGRADE
      // =========================
      case "addplayer":
      case "upgrade": {
        await interaction.deferReply();

        const name = interaction.options.getString("name");
        const t1 = interaction.options.getNumber("t1") ?? 0;
        const t2 = interaction.options.getNumber("t2") ?? 0;
        const t3 = interaction.options.getNumber("t3") ?? 0;
        const t4 = interaction.options.getNumber("t4") ?? 0;

        const action = commandName;

        const res = await fetch(SHEET_API, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action, name, t1, t2, t3, t4 })
        });

        const data = await res.json();

        if (!data.success)
          return interaction.editReply(`❌ ${data.error || "Erreur"}`);

        return interaction.editReply(`✅ ${name} mis à jour`);
      }

      // =========================
      // HISTORY 📜
      // =========================
      case "history": {
        await interaction.deferReply();

        const name = interaction.options.getString("name");

        const res = await fetch(SHEET_API, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "history",
            name
          })
        });

        const data = await res.json();

        if (!data.success)
          return interaction.editReply(`❌ ${data.error || "Erreur"}`);

        return interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setTitle(`📜 Historique de ${data.name}`)
              .setDescription(data.history || "Aucun historique")
              .setColor(0x00AE86)
          ]
        });
      }

    }

  } catch (err) {
    console.error(err);

    if (interaction.deferred) {
      return interaction.editReply("❌ Erreur serveur");
    }
  }
});

client.login(TOKEN);