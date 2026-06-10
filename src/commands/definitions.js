const { REST, Routes, SlashCommandBuilder } = require("discord.js");
const config = require("../config");

function buildCommands() {
  return [
    new SlashCommandBuilder()
      .setName("searchpalmon")
      .setDescription("Recherche un Palmon par ID")
      .addStringOption(o =>
        o.setName("id")
          .setDescription("Ex: 033 027")
          .setRequired(true)
      ),

    new SlashCommandBuilder()
      .setName("addplayer")
      .setDescription("Ajouter un joueur")
      .addStringOption(o =>
        o.setName("name")
          .setDescription("Nom du joueur")
          .setRequired(true)
      )
      .addNumberOption(o =>
        o.setName("t1")
          .setDescription("Score T1")
          .setRequired(true)
      )
      .addNumberOption(o =>
        o.setName("t2")
          .setDescription("Score T2")
          .setRequired(true)
      )
      .addNumberOption(o =>
        o.setName("t3")
          .setDescription("Score T3")
          .setRequired(false)
      )
      .addNumberOption(o =>
        o.setName("t4")
          .setDescription("Score T4")
          .setRequired(false)
      ),

    new SlashCommandBuilder()
      .setName("upgrade")
      .setDescription("Améliorer les stats d’un joueur")
      .addStringOption(o =>
        o.setName("name")
          .setDescription("Nom du joueur")
          .setRequired(true)
      )
      .addNumberOption(o => o.setName("t1").setDescription("Bonus T1"))
      .addNumberOption(o => o.setName("t2").setDescription("Bonus T2"))
      .addNumberOption(o => o.setName("t3").setDescription("Bonus T3"))
      .addNumberOption(o => o.setName("t4").setDescription("Bonus T4")),

    new SlashCommandBuilder()
      .setName("stats")
      .setDescription("Voir stats"),

    new SlashCommandBuilder()
      .setName("history")
      .setDescription("Voir historique")
      .addStringOption(o =>
        o.setName("name")
          .setDescription("Nom du joueur")
          .setRequired(true)
      ),

    new SlashCommandBuilder()
      .setName("top")
      .setDescription("Classement des joueurs (T1)"),

    new SlashCommandBuilder()
      .setName("players")
      .setDescription("Liste des joueurs (sans stats)"),

    new SlashCommandBuilder()
      .setName("perefloflo")
      .setDescription("Introduction du Père Floflo"),

    new SlashCommandBuilder()
      .setName("penguin")
      .setDescription("Alerter un membre pour un pingouin roi spectral")
      .addUserOption(o =>
        o.setName("membre")
          .setDescription("Membre à prévenir")
          .setRequired(true)
      ),

    new SlashCommandBuilder()
      .setName("spammedia")
      .setDescription("Envoie plusieurs fois une image/gif ou un media aléatoire local")
      .addIntegerOption(o =>
        o.setName("nombre")
          .setDescription("Nombre d'envois, entre 1 et 10")
          .setMinValue(1)
          .setMaxValue(10)
          .setRequired(true)
      )
      .addAttachmentOption(o =>
        o.setName("media")
          .setDescription("Image ou gif à envoyer")
          .setRequired(false)
      )
      .addStringOption(o =>
        o.setName("texte")
          .setDescription("Texte optionnel avec le media")
          .setRequired(false)
      ),
    
      new SlashCommandBuilder()
        .setName("arctique")
        .setDescription("Gestion des bases de arctique"),
    
    new SlashCommandBuilder()
      .setName("archivearctique")
      .setDescription("Créer une archive des bases arctique")
      .addStringOption(o =>
        o.setName("nom")
          .setDescription("Nom de la guilde adverse pour archive arctique")
          .setRequired(true)
      ),

    new SlashCommandBuilder()
      .setName("concours-teub")
      .setDescription("Comparer 2 joueurs")
      .addStringOption(o =>
        o.setName("joueur1")
          .setDescription("Premier joueur")
          .setRequired(true)
      )
      .addStringOption(o =>
        o.setName("joueur2")
          .setDescription("Deuxième joueur")
          .setRequired(true)
      )
  ].map(command => command.toJSON());
}

async function registerCommands() {
  const rest = new REST({ version: "10" }).setToken(config.token);

  await rest.put(
    Routes.applicationGuildCommands(config.clientId, config.guildId),
    { body: buildCommands() }
  );

  console.log("✅ Commands OK");
}

module.exports = {
  registerCommands
};
