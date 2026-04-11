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

  return rows.map(r => {
    const ids = [
      r.c[1]?.v,
      r.c[2]?.v,
      r.c[3]?.v,
      r.c[4]?.v
    ]
      .filter(x => x !== null && x !== undefined)
      .map(x => String(x).padStart(3, "0")); // 🔥 FIX 033

    return {
      pseudo: r.c[0]?.v || "Inconnu",
      ids
    };
  });
}

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  console.log("RECU :", message.content);

  // 🔥 accepte plusieurs formats
  let args = [];

  if (message.content.startsWith("/search")) {
    args = message.content.split(" ").slice(1);
  } else {
    // 👉 permet juste "033"
    args = message.content.split(" ");
  }

  // nettoyage (important)
  args = args.map(x => x.trim()).filter(Boolean);

  const data = await getData();

  const results = data.filter(p => {
    return args.every(id => p.ids.includes(id));
  });

  if (results.length === 0) {
    return message.reply("❌ Aucun résultat");
  }

  let msg = "✅ Résultats :\n";

  results.forEach(p => {
    msg += `- ${p.pseudo} (${p.ids.join(", ")})\n`;
  });

  message.reply(msg);
});

client.login(TOKEN);