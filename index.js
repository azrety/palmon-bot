const { Client, GatewayIntentBits } = require('discord.js');
const fetch = require('node-fetch');

const TOKEN = process.env.TOKEN;
const SHEET_ID = process.env.SHEET_ID;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// 🔥 FORMAT SAFE
const format = (cell) => {
  if (!cell) return null;

  const value = cell.v ?? cell.f;
  if (value == null) return null;

  return String(value).trim().padStart(3, "0");
};

async function getData() {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`;
  const res = await fetch(url);
  const text = await res.text();
  console.log("GOOGLE RAW:", text.slice(0, 200));

  const match = text.match(/setResponse\(([\s\S]*)\);/);
  if (!match) {
    console.log("❌ Réponse Google invalide");
    return [];
  }

  const json = JSON.parse(match[1]);
  const rows = json.table.rows;

  return rows.map((r, i) => {
    const attr1 = format(r.c[1]);
    const attr2 = format(r.c[2]);
    const attr3 = format(r.c[3]);
    const attr4 = format(r.c[4]);

    // 🔥 on enlève les null + "000"
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

  // 🔒 commande unique
  if (!content.startsWith("/searchpalmon ")) return;

  console.log("RAW CONTENT:", content);

  const args = content
    .replace("/searchpalmon", "")
    .trim()
    .split(/\s+/)
    .map(id => id.trim().padStart(3, "0"));

  console.log("SEARCH:", args);

  const data = await getData();

  // 🔥 DEBUG IDS
  data.forEach(p => {
    console.log("IDS:", p.ids);
  });

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
    msg += `Attr1: ${p.attr1 || "-"}\n`;
    msg += `Attr2: ${p.attr2 || "-"}\n`;
    msg += `Attr3: ${p.attr3 || "-"}\n`;
    msg += `Attr4: ${p.attr4 || "-"}\n`;
    msg += `----------------\n`;
  });

  message.reply(msg);
});

client.login(TOKEN);
