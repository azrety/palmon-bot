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

async function getData() {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`;
  const res = await fetch(url);
  const text = await res.text();

  const match = text.match(/setResponse\(([\s\S]*)\);/);
  if (!match) {
    console.log("❌ Réponse Google invalide");
    return [];
  }

  const json = JSON.parse(match[1]);
  const rows = json.table.rows;

  return rows.map((r, i) => {
    const format = (x) => {
      if (x === null || x === undefined) return null;
      return String(x).padStart(3, "0"); // 🔥 force 033
    };

    const attr1 = format(r.c[1]?.v);
    const attr2 = format(r.c[2]?.v);
    const attr3 = format(r.c[3]?.v);
    const attr4 = format(r.c[4]?.v);

    const ids = [attr1, attr2, attr3, attr4].filter(Boolean);

    console.log(`ROW ${i}:`, ids); // debug

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

  // 🔒 UNIQUEMENT cette commande
  if (!content.startsWith("/searchpalmon ")) return;

  const args = content
    .replace("/searchpalmon", "")
    .trim()
    .split(" ")
    .map(id => id.padStart(3, "0")); // 🔥 normalisation

  console.log("SEARCH:", args);

  const data = await getData();

  console.log("DATA:", data);

  const results = data.filter(p =>
    args.every(id =>
      p.ids.map(x => x.padStart(3, "0")).includes(id)
    )
  );

  console.log("RESULTS:", results);

  if (results.length === 0) {
    return message.reply("❌ Aucun résultat");
  }

  let msg = "✅ Résultats :\n\n";

  results.forEach(p => {
    msg += `👤 ${p.pseudo}\n`;
    msg += `Attr1: ${p.attr1}\n`;
    msg += `Attr2: ${p.attr2}\n`;
    msg += `Attr3: ${p.attr3}\n`;
    msg += `Attr4: ${p.attr4}\n`;
    msg += `----------------\n`;
  });

  message.reply(msg);
});

client.login(TOKEN);