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
// SLASH COMMANDS
// =========================
async function registerCommands() {
  const commands = [

    // 🔎 SEARCH PALMON
    new SlashCommandBuilder()
      .setName('searchpalmon')
      .setDescription('Recherche un Palmon par ID')
      .addStringOption(option =>
        option.setName('id')
          .setDescription('Ex: 033 ou 033 027')
          .setRequired(true)
      ),

    // 📅 EVENT
    new SlashCommandBuilder()
      .setName('event')
      .setDescription('Créer un événement')
      .addStringOption(option =>
        option.setName('nom')
          .setDescription('Nom de l’événement')
          .setRequired(true)
      )
      .addStringOption(option =>
        option.setName('heure')
          .setDescription('Format HH:MM')
          .setRequired(true)
      )
      .addIntegerOption(option =>
        option.setName('rappel')
          .setDescription('Minutes avant rappel (optionnel)')
          .setRequired(false)
      ),

    // ➕ ADD PLAYER
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
          .setDescription('Team 1')
          .setRequired(false)
      )
      .addNumberOption(o =>
        o.setName('t2')
          .setDescription('Team 2')
          .setRequired(false)
      )
      .addNumberOption(o =>
        o.setName('t3')
          .setDescription('Team 3')
          .setRequired(false)
      )
      .addNumberOption(o =>
        o.setName('t4')
          .setDescription('Team 4')
          .setRequired(false)
      ),

    // ⚡ UPGRADE PLAYER
    new SlashCommandBuilder()
      .setName('upgrade')
      .setDescription('Modifier puissance joueur')
      .addStringOption(o =>
        o.setName('name')
          .setDescription('Nom du joueur')
          .setRequired(true)
      )
      .addNumberOption(o =>
        o.setName('t1')
          .setDescription('Team 1')
          .setRequired(false)
      )
      .addNumberOption(o =>
        o.setName('t2')
          .setDescription('Team 2')
          .setRequired(false)
      )
      .addNumberOption(o =>
        o.setName('t3')
          .setDescription('Team 3')
          .setRequired(false)
      )
      .addNumberOption(o =>
        o.setName('t4')
          .setDescription('Team 4')
          .setRequired(false)
      ),
      // 📊 STATS//
      new SlashCommandBuilder()
        .setName('stats')
        .setDescription('Afficher les stats de tous les joueurs')

  ].map(cmd => cmd.toJSON());

  const rest = new REST({ version: '10' }).setToken(TOKEN);

  await rest.put(
    Routes.applicationGuildCommands(CLIENT_ID, "1491506781245931563"),
    { body: commands }
  );

  console.log("✅ Slash commands enregistrées !");
}

process.on("unhandledRejection", (err) => {
  console.error("❌ UNHANDLED:", err);
});

// 🔥 utils
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

// 🔥 ATTR
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

// 🔥 PLAYERS
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

// 🔥 LOGIQUE COMMUNE
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

// 🔥 INTERACTIONS
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  // 🔎 SEARCH
  if (interaction.commandName === "searchpalmon") {

    await interaction.deferReply({ ephemeral: true });

    const args = interaction.options.getString("id")
      .trim()
      .split(/\s+/)
      .map(id => id.padStart(3, "0"));

    const { results, attrMap, formatAttr } = await runSearch(args);

    if (!results.length) {
      return interaction.editReply("❌ Aucun résultat");
    }

    const pageSize = 5;
    let page = 0;
    const totalPages = Math.ceil(results.length / pageSize);

    const generateEmbed = () => {
      const slice = results.slice(page * pageSize, (page + 1) * pageSize);

      return new EmbedBuilder()
        .setTitle(`🔎 ${args.join(" ")} (${results.length} résultats)`)
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

    if (interaction.commandName === "stats") {

  await interaction.deferReply();

  try {
    const res = await fetch(SHEET_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "getplayers"
      })
    });

    const data = await res.json();

    if (!data.success) {
      return interaction.editReply("❌ Erreur API");
    }

    const players = data.players;

    if (!players.length) {
      return interaction.editReply("❌ Aucun joueur");
    }

    const text = players.map(p => {
      return `👤 **${p.name}**
• T1: ${p.t1} | T2: ${p.t2} | T3: ${p.t3} | T4: ${p.t4}`;
    }).join("\n\n");

    const embed = new EmbedBuilder()
      .setTitle("📊 Stats des joueurs")
      .setDescription(text)
      .setColor(0x00AE86);

    return interaction.editReply({ embeds: [embed] });

  } catch (err) {
    console.error(err);
    return interaction.editReply("❌ Erreur serveur");
  }
}
  }

  // 📅 EVENT
  if (interaction.commandName === "event") {

    const nom = interaction.options.getString("nom");
    const heure = interaction.options.getString("heure");
    const rappel = interaction.options.getInteger("rappel");

    const [h, m] = heure.split(':').map(Number);

    if (isNaN(h) || isNaN(m)) {
      return interaction.reply("❌ Format invalide (HH:MM)");
    }

    const now = DateTime.now().setZone("Europe/Paris");

    let target = now.set({
      hour: h,
      minute: m,
      second: 0,
      millisecond: 0
    });

    if (target < now) {
      target = target.plus({ days: 1 });
    }

    const timestamp = Math.floor(target.toSeconds());
    const channelId = interaction.channelId;

    await interaction.reply(
      `@everyone 📅 **${nom}**\n🕒 <t:${timestamp}:F>\n⏳ <t:${timestamp}:R>`
    );

    // 🔔 rappel
    if (rappel) {
      const delay = target.toMillis() - Date.now() - (rappel * 60000);

      if (delay > 0) {
        setTimeout(async () => {
          try {
            const channel = await client.channels.fetch(channelId);
            if (!channel) return;

            await channel.send(
              `@everyone ⏳ **${nom}** dans ${rappel} minutes ! (<t:${timestamp}:R>)`
            );
          } catch (err) {
            console.error("❌ ERREUR RAPPEL:", err.message);
          }
        }, delay);
      }
    }

    // ⚔️ final
    const finalDelay = target.toMillis() - Date.now();

    if (finalDelay > 0) {
      setTimeout(async () => {
        try {
          const channel = await client.channels.fetch(channelId);
          if (!channel) return;

          await channel.send(
            `@everyone ⚔️ **${nom}** MAINTENANT !`
          );
        } catch (err) {
          console.error("❌ ERREUR FINAL:", err.message);
        }
      }, finalDelay);
    }
  }

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
    console.log("RAW RESPONSE:", text);

    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.log("❌ JSON invalide:", text);
      return interaction.editReply("❌ API invalide");
    }

    if (data.success) {
      await interaction.editReply(`✅ Joueur ajouté : **${name}**`);
    } else {
      await interaction.editReply(`❌ Erreur : ${data.error}`);
    }

  } catch (err) {
    console.error("❌ ADDPLAYER ERROR:", err);
    return interaction.editReply("❌ Erreur lors de l'ajout du joueur");
  }
  } // fin addplayer
}); // ✅ FERMETURE DU client.on("interactionCreate")

console.log("SHEET_API =", SHEET_API);

// READY
client.once("ready", async () => {
  console.log(`✅ ${client.user.tag}`);
  await registerCommands();
});

client.login(TOKEN);