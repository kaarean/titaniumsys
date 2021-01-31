exports.run = async (client, message) => { 
if(!message.member.roles.has("677963772836446234")) 
return message.channel.send(`Bu komutu kullanabilmek için <@&677963772836446234> rolüne sahip olmasınız.`); 
const voiceChannel = message.member.voiceChannel; 
if (!message.member.voiceChannel) {
 return message.channel.send("Bir Ses Kanalında Olman Gerekiyor!"); } 
const permissions = message.member.voiceChannel.permissionsFor(message.guild.me); 
if (permissions.has("CONNECT") === false) {
 return message.channel.send("Yeterli Yetkim Yok!"); } 
message.member.voiceChannel.join(); 
return message.channel.send(`${message.member.voiceChannel} İsimli Ses Kanalına Giriş Yaptım!`); }; 
exports.conf = { 
enabled: true,
 runIn: ["text"],
 aliases: ['katıl'], 
permLevel: 0,
 botPerms: [], 
requiredFuncs: [],
 }; 
exports.help = { 
name: "gir",
 description: "Bot ses kanalına giriş yapar.", 
usage: "gir",
 usageDelim: "", 
};