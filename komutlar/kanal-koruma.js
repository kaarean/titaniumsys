const Discord = require("discord.js"),
  db = require("quick.db");

module.exports.run = async (client, message, args) => {
  let prefix = (await db.fetch(`prefix_${message.guild.id}`)) || "!";

  let kanal = message.mentions.channels.first();
  if (!kanal) {
    const embed = new Discord.RichEmbed()
      .setColor("BLACK")
      .setFooter(client.user.username, client.user.avatarURL)
      .setDescription(`Lütfen log kanalını etiketleyiniz!`);
    message.channel.send(embed);
    return;
  }
  db.set(`kanalk_${message.guild.id}`, kanal.id);
  const embed = new Discord.RichEmbed()
    .setColor("BLACK")
    .setFooter(client.user.username, client.user.avatarURL)
    .setDescription(`Kanal koruma log kanalı; ${kanal} olarak ayarlandı!`);
  message.channel.send(embed);
  return;
};

exports.conf = {
  enabled: true,
  guildOnly: true,
  aliases: ["channel-protection"],
  permLevel: 3
};

exports.help = {
  name: "kanal-koruma",
  description: "kanal-koruma",
  usage: "kanal-koruma"
};