const translate = require("google-translate-api-x");

const translationGroups = {
  r4: {
    fr: "1491514382860156928",
    en: "1504214531033796709",
    es: "1504215963514441858"
  }
};

const webhookCache = {};

async function getWebhook(channel) {
  if (webhookCache[channel.id]) {
    return webhookCache[channel.id];
  }

  const hooks = await channel.fetchWebhooks();
  let hook = hooks.find(h => h.name === "GuildTranslator");

  if (!hook) {
    hook = await channel.createWebhook({
      name: "GuildTranslator"
    });
  }

  webhookCache[channel.id] = hook;
  return hook;
}

function findTranslationGroup(channelId) {
  for (const [groupName, langs] of Object.entries(translationGroups)) {
    for (const [lang, id] of Object.entries(langs)) {
      if (id === channelId) {
        return {
          groupName,
          sourceLang: lang,
          channels: langs
        };
      }
    }
  }

  return null;
}

function setupAutoTranslation(client) {
  client.on("messageCreate", async (message) => {
    try {
      if (message.author.bot) return;
      if (message.webhookId) return;

      const translationData = findTranslationGroup(message.channel.id);
      if (!translationData) return;
      if (!message.content) return;
      if (message.content.length < 2) return;

      const { sourceLang, channels } = translationData;

      for (const [targetLang, targetChannelId] of Object.entries(channels)) {
        if (targetLang === sourceLang) continue;

        try {
          const translated = await translate(message.content, {
            from: sourceLang,
            to: targetLang
          });

          const targetChannel = await client.channels.fetch(targetChannelId);
          if (!targetChannel) continue;

          const webhook = await getWebhook(targetChannel);

          await webhook.send({
            content: translated.text,
            username: message.member?.displayName || message.author.username,
            avatarURL: message.author.displayAvatarURL(),
            allowedMentions: {
              parse: []
            }
          });
        } catch (err) {
          console.error("Erreur traduction :", err);
        }
      }
    } catch (err) {
      console.error(err);
    }
  });
}

module.exports = {
  setupAutoTranslation
};
