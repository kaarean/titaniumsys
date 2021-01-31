const Discord = require("discord.js"),
  db = require("quick.db");

module.exports.run = async (client, message, args) => {
  let prefix = (await db.fetch(`prefix_${message.guild.id}`)) || "!";

  let kanal = await db.fetch(`kanalk_${message.guild.id}`);
  if (!kanal) {
    const embed = new Discord.RichEmbed()
      .setColor("BLACK")
      .setFooter(client.user.username, client.user.avatarURL)
      .setDescription(`Kanal koruma zaten ayarlanmamış!`);
    message.channel.send(embed);
    return;
  }
  db.delete(`kanalk_${message.guild.id}`);
  const embed = new Discord.RichEmbed()
    .setColor("BLACK")
    .setFooter(client.user.username, client.user.avatarURL)
    .setDescription(`Kanal koruma sistemi sıfırlandı!`);
  message.channel.send(embed);
  return;
};

exports.conf = {
  enabled: true,
  guildOnly: true,
  aliases: ["channel-protection-reset"],
  permLevel: 3
};

exports.help = {
  name: "kanal-koruma-sıfırla",
  description: "kanal-koruma-sıfırla",
  usage: "kanal-koruma-sıfırla"
};