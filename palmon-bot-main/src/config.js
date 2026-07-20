require("dotenv").config();

module.exports = {
  token: process.env.TOKEN,
  clientId: process.env.CLIENT_ID,
  sheetId: process.env.SHEET_ID,
  sheetApi: process.env.SHEET_API,
  gidPlayers: process.env.GID_PLAYERS,
  gidAttr: process.env.GID_ATTR,
  guildId: process.env.GUILD_ID,
  spamChannelId: process.env.SPAM_CHANNEL_ID
};
