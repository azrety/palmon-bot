const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
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

// 🔥 COULEUR PAR RARETÉ
const getColor = (ids, attrMap) => {
  for (let id of ids) {
    const attr = attrMap[id];
    if (!attr) continue;

    switch (attr.category) {
      case "S": return 0xFFD700; // jaune
      case "A": return 0x800080; // violet
      case "B": return 0x0000FF; // bleu
      case "C": return 0x808080; // gris
    }
  }
  return 0x00AE86;
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
    const category = r.c[1]?.v || "C";

    map[id] = {
      name: `${fr}/${en}/${es}`,
      category
    };
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

  const args = content
    .replace("/searchpalmon", "")
    .trim()
    .split(/\s+/)
    .map(id => id.padStart(3, "0"));

  console.log("SEARCH:", args);

  const [data, attrMap] = await Promise.all([
    getData(),
    getAttributesMap()
  ]);

  const formatAttr = (id) => {
    if (!id) return "-";

    const attr = attrMap[id];
    if (!attr) return id;

    return `${id} (${attr.name})`;
  };

  const results = data.filter(p =>
    args.every(id => p.ids.includes(id))
  );

  if (results.length === 0) {
    return message.reply("❌ Aucun résultat");
  }

  // 🔥 EMBED
  const embed = new EmbedBuilder()
    .setTitle("🔎 Résultats Palmon")
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

  message.reply({ embeds: [embed] });
});

client.login(TOKEN);