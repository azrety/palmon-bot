const fs = require("fs");

function loadData() {
  try {
    return JSON.parse(fs.readFileSync("./src/data/arctique.json", "utf8"));
  } catch (e) {
    return { current: {}, archive: [] };
  }
}

function saveData(data) {
  fs.writeFileSync("./src/data/arctique.json", JSON.stringify(data, null, 2));
}

// ---------------- COMMANDS ----------------
const commands = [
  require("./addplayer"),
  require("./concours-teub"),
  require("./history"),
  require("./perefloflo"),
  require("./penguin"),
  require("./players"),
  require("./searchpalmon"),
  require("./spammedia"),
  require("./stats"),
  require("./top"),
  require("./upgrade"),
  require("./arctique")
];

const commandMap = new Map(commands.map(c => [c.name, c]));

const { createAddModal } = require("./arctiqueModal");
const arctique = require("./arctique");

function setupCommandHandler(client) {

  client.on("interactionCreate", async (interaction) => {

    // ================= COMMANDES =================
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

    // ================= BOUTONS =================
    if (interaction.isButton()) {

      if (interaction.customId === "add_base") {
        return interaction.showModal(createAddModal());
      }

      if (interaction.customId === "view_base") {
        return arctique.arctiqueView(interaction, 0);
      }

      if (interaction.customId.startsWith("next_page_")) {
        return arctique.arctiqueNext(interaction);
      }

      if (interaction.customId.startsWith("prev_page_")) {
        return arctique.arctiquePrev(interaction);
      }

      // ✅ ARCHIVE PROPRE
      if (interaction.customId === "archiveArctique") {
        return arctique.archiveArctique(interaction);
      }

      if (interaction.customId === "reset_data") {
        const data = loadData();

        data.current = {};
        saveData(data);

        return interaction.reply({
          content: "🔄 Reset OK",
        });
      }
    }

    // ================= MODALS =================
    if (interaction.isModalSubmit()) {

      if (interaction.customId === "add_base_modal") {

        const base = interaction.fields.getTextInputValue("base");
        const equipe1 = interaction.fields.getTextInputValue("equipe1");
        const equipe2 = interaction.fields.getTextInputValue("equipe2");
        const equipe3 = interaction.fields.getTextInputValue("equipe3");
        const commentaire = interaction.fields.getTextInputValue("commentaire");

        const data = loadData();

        data.current[base] = {
          equipe1: equipe1 || null,
          equipe2: equipe2 || null,
          equipe3: equipe3 || null,
          commentaire: commentaire || null,
          notes: []
        };

        saveData(data);

        return interaction.reply({
          content: `✅ Base ${base} enregistrée`,
        });
      }
    }
  });
}

module.exports = {
  setupCommandHandler
};
