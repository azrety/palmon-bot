const fs = require("fs");

const DATA_PATH = "./src/data/arctique.json";

function loadData() {
  try {
    return JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
  } catch {
    return { current: {}, archive: [] };
  }
}

function saveData(data) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
}

module.exports = {
  name: "archivearctique",

  async execute(interaction) {
    const nom = interaction.options.getString("nom");
    const data = loadData();

    if (!data.archive) data.archive = [];

    data.archive.push({
      name: nom,
      date: new Date().toISOString(),
      data: JSON.parse(JSON.stringify(data.current))
    });

    data.current = {};
    saveData(data);

    return interaction.reply({
      content: `📦 Archive **${nom}** créée avec succès !`,
    });
  }
};
