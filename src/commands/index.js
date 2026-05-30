const { MessageFlags } = require("discord.js");

const commands = [
  require("./addplayer"),
  require("./concours-teub"),
  require("./history"),
  require("./perefloflo"),
  require("./players"),
  require("./searchpalmon"),
  require("./spammedia"),
  require("./stats"),
  require("./top"),
  require("./upgrade"),
  require("./arctique")
];

const commandMap = new Map(commands.map(command => [command.name, command]));

function setupCommandHandler(client) {
  client.on("interactionCreate", async (interaction) => {

    // COMMANDES
    if (interaction.isChatInputCommand()) {

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
          return interaction.reply({
            content: "❌ erreur serveur",
            ephemeral: true
          });
        }
      }
    }

    // BOUTONS
    if (interaction.isButton()) {

      if (interaction.customId === "add_base") {
        return interaction.reply({
          content: "📝 Bouton Ajouter détecté !",
          ephemeral: true
        });
      }

      if (interaction.customId === "view_base") {
        return interaction.reply({
          content: "🔍 Bouton Consulter détecté !",
          ephemeral: true
        });
      }

    }

  });
}

module.exports = {
  setupCommandHandler
};
