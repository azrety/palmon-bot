const { Client, GatewayIntentBits } = require("discord.js");
const config = require("./src/config");
const { registerCommands } = require("./src/commands/definitions");
const { setupCommandHandler } = require("./src/commands");
const { setupAutoTranslation } = require("./src/translation");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.once("ready", async () => {
  console.log("Bot ready");
  await registerCommands();
});

setupAutoTranslation(client);
setupCommandHandler(client);

console.log("🚀 Bot start...");
console.log("TOKEN exists:", !!config.token);
console.log("Bot ready !");

client.login(config.token)
  .then(() => console.log("✅ Connecté à Discord"))
  .catch(err => console.error("❌ Login error:", err));
