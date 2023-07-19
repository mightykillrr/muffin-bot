export const createMessageURL = (
  guildID: string,
  channelID: string,
  messageID: string,
) => {
  return `https://discord.com/channels/${guildID}/${channelID}/${messageID}`;
};
