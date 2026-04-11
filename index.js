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
  if (!match) return [];

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
      .map(x => String(x).padStart(3, "0")); // 🔥 conversion FORCÉE

    return {
      pseudo: r.c[0]?.v || "Inconnu",
      ids
    };
  });
}

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  console.log("RECU :", message.content);

  // accepte /search OU juste 033
  let args = [];

  if (message.content.startsWith("/search")) {
    args = message.content.split(" ").slice(1);
  } else {
    args = message.content.split(" ");
  }

  // 🔥 normalise les entrées utilisateur aussi
  args = args.map(x => String(x).padStart(3, "0"));

  const data = await getData();

  console.log("DATA:", data);
  console.log("ARGS:", args);

  const results = data.filter(p =>
    args.every(id => p.ids.includes(id))
  );

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