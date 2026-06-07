const fs = require("fs");
const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

const DATA_PATH = "./src/data/arctique.json";
const PAGE_SIZE = 10;

// ---------------- DATA ----------------
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

// ---------------- TABLE ----------------
function formatTable(entries) {
  let text = "```\nBase | E1   | E2   | E3   | Notes\n";
  text += "-----+------+-------+------+----------------\n";

  for (const [base, info] of entries) {
    const e1 = info.equipe1 ?? "-";
    const e2 = info.equipe2 ?? "-";
    const e3 = info.equipe3 ?? "-";
    const note = (info.commentaire || "").slice(0, 20);

    text += `${base.toString().padEnd(4)} | ${e1.toString().padEnd(4)} | ${e2.toString().padEnd(5)} | ${e3.toString().padEnd(4)} | ${note}\n`;
  }

  text += "```";
  return text;
}

// ---------------- PAGINATION ----------------
function getPage(entries, page) {
  const start = page * PAGE_SIZE;
  return entries.slice(start, start + PAGE_SIZE);
}

function getMaxPage(entries) {
  return Math.max(0, Math.ceil(entries.length / PAGE_SIZE) - 1);
}

// ---------------- VIEW ----------------
async function arctiqueView(interaction, page = 0) {
  const data = loadData();
  const entries = Object.entries(data.current || {});
  const maxPage = getMaxPage(entries);

  const pageData = getPage(entries, page);
  const text = formatTable(pageData);

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`prev_page_${page}`)
      .setLabel("⬅")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(page <= 0),

    new ButtonBuilder()
      .setCustomId(`next_page_${page}`)
      .setLabel("➡")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(page >= maxPage)
  );

  return interaction.reply({
    content: `📊 **Bases Arctique (page ${page + 1}/${maxPage + 1})**\n\n${text}`,
    components: [row],
    flags: 0
  });
}

// ---------------- PAGINATION ----------------
async function arctiqueNext(interaction) {
  const page = parseInt(interaction.customId.split("_")[2]);
  return arctiqueView(interaction, page + 1);
}

async function arctiquePrev(interaction) {
  const page = parseInt(interaction.customId.split("_")[2]);
  return arctiqueView(interaction, page - 1);
}

// ---------------- ARCHIVE PROPRE ----------------
async function archiveArctique(interaction) {
  const data = loadData();

  const name = new Date().toISOString().split("T")[0]; // date auto

  data.archive.push({
    name,
    date: new Date().toISOString(),
    data: data.current
  });

  data.current = {};
  saveData(data);

  return interaction.reply({
    content: `📦 Archive créée : **${name}**`,
    flags: 64
  });
}

// ---------------- EXPORT ----------------
module.exports = {
  name: "arctique",

  async execute(interaction) {
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("add_base")
        .setLabel("📝 Ajouter")
        .setStyle(ButtonStyle.Success),

      new ButtonBuilder()
        .setCustomId("view_base")
        .setLabel("🔍 Consulter")
        .setStyle(ButtonStyle.Primary),

      new ButtonBuilder()
        .setCustomId("archiveArctique")
        .setLabel("📦 Archiver")
        .setStyle(ButtonStyle.Secondary),

      new ButtonBuilder()
        .setCustomId("reset_data")
        .setLabel("🔄 Reset")
        .setStyle(ButtonStyle.Danger)
    );

    return interaction.reply({
      content: "📊 Gestion Arctique",
      components: [row]
    });
  },

  arctiqueView,
  arctiqueNext,
  arctiquePrev,
  archiveArctique
};
