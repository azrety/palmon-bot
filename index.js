const { Client, GatewayIntentBits } = require('discord.js');
const fetch = require('node-fetch');

const TOKEN = process.env.TOKEN;
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

// 🔥 GET ATTR MAP
async function getAttributesMap() {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&gid=${GID_ATTR}`;
  const res = await fetch(url);
  const text = await res.text();

  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");

  if (start === -1 || end === -1) {
    console.log("❌ ATTR SHEET ERROR");
    return {};
  }

  let json;
  try {
    json = JSON.parse(text.substring(start, end + 1));
  } catch {
    console.log("❌ ATTR JSON PARSE ERROR");
    return {};
  }

  const rows = json.table.rows;
  const map = {};

  rows.forEach(r => {
    const id = String(r.c[0]?.v).padStart(3, "0");
    const fr = r.c[2]?.v || "";
    const en = r.c[3]?.v || "";
    const es = r.c[4]?.v || "";

    map[id] = `${fr}/${en}/${es}`;
  });

  console.log("✅ ATTR MAP LOADED:", Object.keys(map).length);
  return map;
}

// 🔥 GET PLAYERS
async function getData() {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&gid=${GID_PLAYERS}`;
  const res = await fetch(url);
  const text = await res.text();

  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");

  if (start === -1 || end === -1) {
    console.log("❌ PLAYER SHEET ERROR");
    return [];
  }

  let json;
  try {
    json = JSON.parse(text.substring(start, end + 1));
  } catch {
    console.log("❌ PLAYER JSON PARSE ERROR");
    return [];
  }

  const rows = json.table.rows;

  return rows.map((r, i) => {
    const attr1 = format(r.c[1]);
    const attr2 = format(r.c[2]);
    const attr3 = format(r.c[3]);
    const attr4 = format(r.c[4]);

    const ids = [attr1, attr2, attr3, attr4]
      .filter(x => x && x !== "000");

    console.log(`ROW ${i}:`, ids);

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

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  const content = message.content.trim();
  if (!content.startsWith("/searchpalmon ")) return;

  console.log("RAW CONTENT:", content);

  const args = content
    .replace("/searchpalmon", "")
    .trim()
    .split(/\s+/)
    .map(id => id.padStart(3, "0"));

  console.log("SEARCH:", args);

  // 🔥 LOAD DATA
  const [data, attrMap] = await Promise.all([
    getData(),
    getAttributesMap()
  ]);

  const formatAttr = (id) => {
    if (!id) return "-";
    return `${id} (${attrMap[id] || "?"})`;
  };

  const results = data.filter(p =>
    args.every(id => p.ids.includes(id))
  );

  console.log("RESULTS:", results);

  if (results.length === 0) {
    return message.reply("❌ Aucun résultat");
  }

  let msg = "✅ Résultats :\n\n";

  results.forEach(p => {
    msg += `👤 ${p.pseudo}\n`;
    msg += `Attr1: ${formatAttr(p.attr1)}\n`;
    msg += `Attr2: ${formatAttr(p.attr2)}\n`;
    msg += `Attr3: ${formatAttr(p.attr3)}\n`;
    msg += `Attr4: ${formatAttr(p.attr4)}\n`;
    msg += `----------------\n`;
  });

  const { EmbedBuilder } = require('discord.js');

const embed = new EmbedBuilder()
  .setTitle("🔎 Résultats Palmon")
  .setColor(0x00AE86)
  .setDescription(results.map(p => {
    return `👤 **${p.pseudo}**
⚔️ Attributs:
• ${formatAttr(p.attr1)}
• ${formatAttr(p.attr2)}
• ${formatAttr(p.attr3)}
• ${formatAttr(p.attr4)}
`;
  }).join("\n"));

message.reply({ embeds: [embed] });
});

client.login(TOKEN);