const fs = require("fs");

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

const { createAddModal } = require("./arctique");

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
        return interaction.showModal(createAddModal());
      }

      if (interaction.customId === "view_base") {
  
        return interaction.reply({
          content: "🔍 Envoie le numéro de la base à consulter (fonction à venir)",
          ephemeral: true
        });
      }

      if (interaction.customId === "archive_data") {
        const data = JSON.parse(fs.readFileSync("./data/arctique.json", "utf8"));
        const archiveEntry = {
          date: new Date().toISOString().split("T")[0],
          data: data.current || {}
        };
        data.archive = data.archive || [];
        data.archive.push(archiveEntry);
        data.current = {}; // reset journalier
        fs.writeFileSync("./data/arctique.json", JSON.stringify(data, null, 2));
        
        return interaction.reply({
          content: "📦 Données archivées avec succès !",
          ephemeral: true
        });
      }

      if (interaction.customId === "reset_data") {
        const data = JSON.parse(fs.readFileSync("./data/arctique.json", "utf8"));
        data.current = {};
        fs.writeFileSync("./data/arctique.json", JSON.stringify(data, null, 2));
      
        return interaction.reply({
          content: "🔄 Données réinitialisées !",
          ephemeral: true
        });
      }
    }

    // MODALS
    if (interaction.isModalSubmit()) {

      if (interaction.customId === "add_base_modal") {

        const base = interaction.fields.getTextInputValue("base");
        const equipe1 = interaction.fields.getTextInputValue("equipe1");
        const commentaire = interaction.fields.getTextInputValue("commentaire");

        console.log("📥 Données reçues :", {
          base,
          equipe1,
          commentaire
        });

        return interaction.reply({
          content: `✅ Base ${base} enregistrée`,
          ephemeral: true
        });
      }
    }

  });
}

module.exports = {
  setupCommandHandler
};
