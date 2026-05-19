const commands = [
  require("./addplayer"),
  require("./concours-teub"),
  require("./history"),
  require("./perefloflo"),
  require("./players"),
  require("./searchpalmon"),
  require("./stats"),
  require("./top"),
  require("./upgrade")
];

const commandMap = new Map(commands.map(command => [command.name, command]));

function setupCommandHandler(client) {
  client.on("interactionCreate", async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const command = commandMap.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute(interaction);
    } catch (err) {
      console.error(err);

      if (interaction.deferred) {
        return interaction.editReply("❌ erreur serveur");
      }

      if (!interaction.replied) {
        return interaction.reply({ content: "❌ erreur serveur", ephemeral: true });
      }
    }
  });
}

module.exports = {
  setupCommandHandler
};
