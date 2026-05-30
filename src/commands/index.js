const fs = require("fs");
function loadData() {
  try {
    return JSON.parse(fs.readFileSync(".src/data/arctique.json", "utf8"));
  } catch (e) {
    return { current: {}, archive: [] };
  }
}

function saveData(data) {
  fs.writeFileSync(".src/data/arctique.json", JSON.stringify(data, null, 2));
}

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

const { createAddModal } = require("./arctiqueModal");
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
      
        const data = loadData();        
        const current = data.current || {};
        const bases = Object.entries(current);
      
        if (bases.length === 0) {
          return interaction.reply({
            content: "📭 Aucune base enregistrée",
            ephemeral: true
          });
        }
      
        let text = "📊 **TOUTES LES BASES ARCTIQUE**\n\n";
      
        for (const [base, info] of bases) {
      
          text += `📍 Base ${base}\n`;
      
          if (info.equipe1) text += `E1: ${info.equipe1}\n`;
          if (info.equipe2) text += `E2: ${info.equipe2}\n`;
          if (info.equipe3) text += `E3: ${info.equipe3}\n`;
      
          if (info.commentaire) {
            text += `📝 ${info.commentaire}\n`;
          }
      
          if (info.notes?.length) {
            text += "Notes:\n";
            info.notes.forEach(n => {
              text += `• ${n}\n`;
            });
          }
      
          text += "\n";
        }
      
        return interaction.reply({
          content: text,
          flags: 64
        });
      }

      if (interaction.customId === "archive_data") {
        const data = loadData();
        const archiveEntry = {
          date: new Date().toISOString().split("T")[0],
          data: data.current || {}
        };
        data.archive = data.archive || [];
        data.archive.push(archiveEntry);
        data.current = {}; // reset journalier
        saveData(data);
        
        return interaction.reply({
          content: "📦 Données archivées avec succès !",
          ephemeral: true
        });
      }

      if (interaction.customId === "reset_data") {
        const data = loadData();
        data.current = {};
        saveData(data);
      
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
        const equipe2 = interaction.fields.getTextInputValue("equipe2");
        const equipe3 = interaction.fields.getTextInputValue("equipe3");
        const commentaire = interaction.fields.getTextInputValue("commentaire");
        
        console.log("📥 Données reçues :", {
          base,
          equipe1,
          equipe2,
          equipe3,
          commentaire
        });

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
            ephemeral: true
          });
      }
    }

  });
}

module.exports = {
  setupCommandHandler
};
