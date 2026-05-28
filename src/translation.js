const fs = require("fs");
const path = require("path");
const translate = require("google-translate-api-x");

const translationGroups = {
  r4: {
    fr: "1491514382860156928",
    en: "1504214531033796709",
    es: "1504215963514441858"
  }
};

const webhookCache = {};
const linksFile = path.join(__dirname, "..", "storage", "translation-links.json");
let translationLinks = loadTranslationLinks();
let syncingReactions = false;

function loadTranslationLinks() {
  try {
    if (!fs.existsSync(linksFile)) return [];
    return JSON.parse(fs.readFileSync(linksFile, "utf8"));
  } catch (err) {
    console.error("Erreur lecture liens traduction :", err);
    return [];
  }
}

function saveTranslationLinks() {
  try {
    fs.mkdirSync(path.dirname(linksFile), { recursive: true });
    fs.writeFileSync(linksFile, JSON.stringify(translationLinks, null, 2));
  } catch (err) {
    console.error("Erreur sauvegarde liens traduction :", err);
  }
}

function findLinkByMessage(channelId, messageId) {
  return translationLinks.find(link =>
    (link.source.channelId === channelId && link.source.messageId === messageId) ||
    link.translations.some(t => t.channelId === channelId && t.messageId === messageId)
  );
}

function removeLinkBySource(channelId, messageId) {
  translationLinks = translationLinks.filter(link =>
    !(link.source.channelId === channelId && link.source.messageId === messageId)
  );
  saveTranslationLinks();
}

function getLinkedMessages(link) {
  return [
    link.source,
    ...link.translations
  ];
}

function emojiKey(emoji) {
  return emoji.id ? `${emoji.name}:${emoji.id}` : emoji.name;
}

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
      const translations = [];

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

          const sent = await webhook.send({
              content: translated.text || message.content || "‎",
              username: message.member?.displayName || message.author.username,
              avatarURL: message.author.displayAvatarURL(),

              files: [...message.attachments.values()].map(att => ({
                attachment: att.url,
                name: att.name
              })),

              allowedMentions: {
                parse: []
              }
            });

          translations.push({
            lang: targetLang,
            channelId: targetChannelId,
            messageId: sent.id
          });
        } catch (err) {
          console.error("Erreur traduction :", err);
        }
      }

      if (translations.length) {
        translationLinks.push({
          source: {
            lang: sourceLang,
            channelId: message.channel.id,
            messageId: message.id
          },
          translations
        });
        saveTranslationLinks();
      }
    } catch (err) {
      console.error(err);
    }
  });

  client.on("messageDelete", async (message) => {
    try {
      const link = findLinkByMessage(message.channelId, message.id);
      if (!link) return;

      const deletedSource =
        link.source.channelId === message.channelId &&
        link.source.messageId === message.id;

      if (deletedSource) {
        for (const translated of link.translations) {
          try {
            const channel = await client.channels.fetch(translated.channelId);
            const webhook = await getWebhook(channel);
            await webhook.deleteMessage(translated.messageId);
          } catch (err) {
            console.error("Erreur suppression traduction :", err);
          }
        }

        removeLinkBySource(message.channelId, message.id);
        return;
      }

      link.translations = link.translations.filter(t =>
        !(t.channelId === message.channelId && t.messageId === message.id)
      );
      saveTranslationLinks();
    } catch (err) {
      console.error(err);
    }
  });

  client.on("messageUpdate", async (oldMessage, newMessage) => {
    try {
      const message = newMessage.partial ? await newMessage.fetch() : newMessage;

      if (message.author?.bot) return;
      if (message.webhookId) return;
      if (!message.content || message.content.length < 2) return;

      const link = findLinkByMessage(message.channelId, message.id);
      if (!link) return;

      const updatedSource =
        link.source.channelId === message.channelId &&
        link.source.messageId === message.id;

      if (!updatedSource) return;

      for (const translated of link.translations) {
        try {
          const translatedText = await translate(message.content, {
            from: link.source.lang,
            to: translated.lang
          });

          const channel = await client.channels.fetch(translated.channelId);
          const webhook = await getWebhook(channel);

          await webhook.editMessage(translated.messageId, {
            content: translatedText.text,
            allowedMentions: {
              parse: []
            }
          });
        } catch (err) {
          console.error("Erreur modification traduction :", err);
        }
      }
    } catch (err) {
      console.error(err);
    }
  });

  client.on("messageReactionAdd", async (reaction, user) => {
    try {
      if (user.bot || syncingReactions) return;
      if (reaction.partial) await reaction.fetch();

      const message = reaction.message;
      const link = findLinkByMessage(message.channelId, message.id);
      if (!link) return;

      syncingReactions = true;
      const linkedMessages = getLinkedMessages(link);

      for (const target of linkedMessages) {
        if (target.channelId === message.channelId && target.messageId === message.id) continue;

        try {
          const channel = await client.channels.fetch(target.channelId);
          const targetMessage = await channel.messages.fetch(target.messageId);
          await targetMessage.react(reaction.emoji);
        } catch (err) {
          console.error("Erreur copie réaction :", err);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      syncingReactions = false;
    }
  });

  client.on("messageReactionRemove", async (reaction, user) => {
    try {
      if (user.bot || syncingReactions) return;
      if (reaction.partial) await reaction.fetch();

      const users = await reaction.users.fetch();
      const hasRemainingUsers = users.some(reactionUser => !reactionUser.bot);
      if (hasRemainingUsers) return;

      const message = reaction.message;
      const link = findLinkByMessage(message.channelId, message.id);
      if (!link) return;

      syncingReactions = true;
      const key = emojiKey(reaction.emoji);
      const linkedMessages = getLinkedMessages(link);

      for (const target of linkedMessages) {
        if (target.channelId === message.channelId && target.messageId === message.id) continue;

        try {
          const channel = await client.channels.fetch(target.channelId);
          const targetMessage = await channel.messages.fetch(target.messageId);
          const targetReaction = targetMessage.reactions.cache.find(r => emojiKey(r.emoji) === key);

          if (targetReaction) {
            await targetReaction.users.remove(client.user.id);
          }
        } catch (err) {
          console.error("Erreur retrait réaction :", err);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      syncingReactions = false;
    }
  });
}

module.exports = {
  setupAutoTranslation
};
