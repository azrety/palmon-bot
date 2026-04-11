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

  // Extraction plus safe
  const jsonString = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]*)\)/)[1];
  const json = JSON.parse(jsonString);

  const rows = json.table.rows;

  return rows.map(r => ({
    pseudo: r.c[0]?.v,
    ids: r.c[5]?.v
  }));
}

client.on("messageCreate", async (message) => {
  console.log("RECU :", message.content);

  if (!message.content.startsWith("/search")) return;

  const args = message.content.split(" ").slice(1);

  const data = await getData();

  const results = data.filter(p => {
    if (!p.ids) return false;
    return args.every(id => p.ids.includes(id));
  });

  if (results.length === 0) {
    return message.reply("❌ Aucun résultat");
  }

  let msg = "✅ Résultats :\n";

  results.forEach(p => {
    msg += `- ${p.pseudo} (${p.ids})\n`;
  });

  message.reply(msg);
});

client.login(TOKEN);