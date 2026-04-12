const { Client, GatewayIntentBits, EmbedBuilder, REST, Routes, SlashCommandBuilder } = require('discord.js');
const fetch = require('node-fetch');

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const SHEET_ID = process.env.SHEET_ID;

// 🔥 GID
const GID_PLAYERS = "307583676";
const GID_ATTR = "1049184729";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// 🔥 REGISTER SLASH COMMAND AUTO
async function registerCommands() {
    console.log("CLIENT_ID:", CLIENT_ID);
    console.log("TOKEN:", TOKEN ? "OK" : "MISSING");
  const commands = [
    new SlashCommandBuilder()
      .setName('searchpalmon')
      .setDescription('Recherche un Palmon par ID')
      .addStringOption(option =>
        option.setName('id')
          .setDescription('Ex: 033 ou 033 027')
          .setRequired(true)
      )
  ].map(cmd => cmd.toJSON());

  const rest = new REST({ version: '10' }).setToken(TOKEN);

  try {
    console.log("🚀 Enregistrement des slash commands...");
    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, "1491506781245931563"),
      { body: commands }
    );
    console.log("✅ Slash command prête !");
  } catch (err) {
    console.error("❌ Erreur register:", err);
  }
}

// 🔥 évite crash
process.on("unhandledRejection", (err) => {
  console.error("❌ UNHANDLED:", err);
});

// 🔥 extrait seulement les 3 chiffres
const format = (cell) => {
  if (!cell) return null;

  const value = cell.v ?? cell.f;
  if (!value) return null;

  const match = String(value).match(/\d{3}/);
  return match ? match[0] : null;
};

// 🔥 COULEUR PAR RARETÉ
const getColor = (ids, attrMap) => {
  for (let id of ids) {
    const attr = attrMap[id];
    if (!attr) continue;

    switch (attr.category) {
      case "S": return 0xFFD700;
      case "A": return 0x800080;
      case "B": return 0x0000FF;
      case "C": return 0x808080;
    }
  }
  return 0x00AE86;
};

const getEmoji = (category) => {
  switch (category) {
    case "S": return "🟡";
    case "A": return "🟣";
    case "B": return "🔵";
    case "C": return "⚪";
    default: return "❔";
  }
};

// 🔥 GET ATTR MAP
async function getAttributesMap() {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&gid=${GID_ATTR}`;
  const res = await fetch(url);
  const text = await res.text();

  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");

  if (start === -1 || end === -1) return {};

  let json;
  try {
    json = JSON.parse(text.substring(start, end + 1));
  } catch {
    return {};
  }

  const rows = json.table.rows;
  const map = {};

  rows.forEach(r => {
    const id = String(r.c[0]?.v).padStart(3, "0");
    const fr = r.c[2]?.v || "";
    const en = r.c[3]?.v || "";
    const es = r.c[4]?.v || "";
    const de = r.c[5]?.v || "";
    const category = r.c[1]?.v || "C";

    map[id] = {
      name: `${fr}/${en}/${es}/${de}`,
      category
    };
  });

  return map;
}

// 🔥 GET PLAYERS
async function getData() {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&gid=${GID_PLAYERS}`;
  const res = await fetch(url);
  const text = await res.text();

  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");

  if (start === -1 || end === -1) return [];

  let json;
  try {
    json = JSON.parse(text.substring(start, end + 1));
  } catch {
    return [];
  }

  const rows = json.table.rows;

  return rows.map(r => {
    const attr1 = format(r.c[1]);
    const attr2 = format(r.c[2]);
    const attr3 = format(r.c[3]);
    const attr4 = format(r.c[4]);

    const ids = [attr1, attr2, attr3, attr4]
      .filter(x => x && x !== "000");

    return {
      pseudo: r.c[0]?.v || "Inconnu",
      attr1,
      attr2,
      attr3,
      attr4,
      ids
    };
  });
}

// 🔥 SLASH COMMAND
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "searchpalmon") {

    const input = interaction.options.getString("id");

    const args = input.trim().split(/\s+/).map(id => id.padStart(3, "0"));

    const [data, attrMap] = await Promise.all([
      getData(),
      getAttributesMap()
    ]);

    const formatAttr = (id) => {
  if (!id) return "-";

  const attr = attrMap[id];
    if (!attr) return `**${id}**`;

    const emoji = getEmoji(attr.category);

    return `${emoji} **${id}** [${attr.category}] (${attr.name})`;
  };

    const results = data.filter(p =>
      args.every(id => p.ids.includes(id))
    );

    if (results.length === 0) {
      return interaction.reply("❌ Aucun résultat");
    }

    const embed = new EmbedBuilder()
  .setTitle(`🔎 Search for : ${args.join(" ")}`)
  .setColor(getColor(results[0].ids, attrMap))
  .setDescription(
    results.map(p => {
      return `👤 **${p.pseudo}**
⚔️ Attributs:
• ${formatAttr(p.attr1)}
• ${formatAttr(p.attr2)}
• ${formatAttr(p.attr3)}
• ${formatAttr(p.attr4)}
`;
    }).join("\n")
  )
  .setFooter({ text: "Palmon Bot 🔍" })
  .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
});

// 🔥 READY
client.once("ready", async () => {
  console.log(`✅ Connecté en tant que ${client.user.tag}`);
  await registerCommands();
});

client.login(TOKEN);