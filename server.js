const Discord = require('discord.js');
const client = new Discord.Client();
const ayarlar = require('./ayarlar.json');
const chalk = require('chalk');
const fs = require('fs');
const moment = require('moment');
const db = require ('quick.db')
require('./util/eventLoader')(client);


var prefix = ayarlar.prefix;

const log = message => {
  console.log(`[${moment().format('YYYY-MM-DD HH:mm:ss')}] ${message}`);
};

client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();
fs.readdir('./komutlar/', (err, files) => {
  if (err) console.error(err);
  log(`${files.length} komut yüklenecek.`);
  files.forEach(f => {
    let props = require(`./komutlar/${f}`);
    log(`Yüklenen komut: ${props.help.name}.`);
    client.commands.set(props.help.name, props);
    props.conf.aliases.forEach(alias => {
      client.aliases.set(alias, props.help.name);
    });
  });
});

client.reload = command => {
  return new Promise((resolve, reject) => {
    try {
      delete require.cache[require.resolve(`./komutlar/${command}`)];
      let cmd = require(`./komutlar/${command}`);
      client.commands.delete(command);
      client.aliases.forEach((cmd, alias) => {
        if (cmd === command) client.aliases.delete(alias);
      });
      client.commands.set(command, cmd);
      cmd.conf.aliases.forEach(alias => {
        client.aliases.set(alias, cmd.help.name);
      });
      resolve();
    } catch (e){
      reject(e);
    }
  });
};

client.load = command => {
  return new Promise((resolve, reject) => {
    try {
      let cmd = require(`./komutlar/${command}`);
      client.commands.set(command, cmd);
      cmd.conf.aliases.forEach(alias => {
        client.aliases.set(alias, cmd.help.name);
      });
      resolve();
    } catch (e){
      reject(e);
    }
  });
};

client.unload = command => {
  return new Promise((resolve, reject) => {
    try {
      delete require.cache[require.resolve(`./komutlar/${command}`)];
      let cmd = require(`./komutlar/${command}`);
      client.commands.delete(command);
      client.aliases.forEach((cmd, alias) => {
        if (cmd === command) client.aliases.delete(alias);
      });
      resolve();
    } catch (e){
      reject(e);
    }
  });
};


client.on('message', msg => {
  if (msg.content.toLowerCase() === 'sa') {
    msg.reply('Aleyküm selam,  hoş geldin ');
  }
});

client.elevation = message => {
  if(!message.guild) {
	return; }
  let permlvl = 0;
  if (message.member.hasPermission("BAN_MEMBERS")) permlvl = 2;
  if (message.member.hasPermission("ADMINISTRATOR")) permlvl = 3;
  if (message.author.id === ayarlar.sahip) permlvl = 4;
  return permlvl;
};

var regToken = /[\w\d]{24}\.[\w\d]{6}\.[\w\d-_]{27}/g;
// client.on('debug', e => {
//   console.log(chalk.bgBlue.green(e.replace(regToken, 'that was redacted')));
// });

client.on('warn', e => {
  console.log(chalk.bgYellow(e.replace(regToken, 'that was redacted')));
});

client.on('error', e => {
  console.log(chalk.bgRed(e.replace(regToken, 'that was redacted')));
});

client.login(ayarlar.token);

client.on("roleDelete", async role => {
  let kanal = await db.fetch(`rolk_${role.guild.id}`);
  if (!kanal) return;
  const entry = await role.guild
    .fetchAuditLogs({ type: "ROLE_DELETE" })
    .then(audit => audit.entries.first());
  if (entry.executor.id == client.user.id) return;
  if (entry.executor.hasPermission("ADMINISTRATOR")) return;
  role.guild.createRole({
    name: role.name,
    color: role.hexColor,
    permissions: role.permissions
  });

  const embed = new Discord.RichEmbed()
    .setTitle(`Bir rol silindi!`)
    .addField(`Silen`, entry.executor.tag)
    .addField(`Silinen Rol`, role.name);
  client.channels.get(kanal).send(embed);
});

client.on("roleCreate", async role => {
  let kanal = await db.fetch(`rolk_${role.guild.id}`);
  if (!kanal) return;
  const entry = await role.guild
    .fetchAuditLogs({ type: "ROLE_CREATE" })
    .then(audit => audit.entries.first());
  if (entry.executor.id == client.user.id) return;
  if (entry.executor.hasPermission("ADMINISTRATOR")) return;
  role.delete();
  const embed = new Discord.RichEmbed()
    .setTitle(`Bir rol açıldı!`)
    .addField(`Açan`, entry.executor.tag)
    .addField(`Açılan Rol`, role.name);
  client.channels.get(kanal).send(embed);
});
client.on("channelCreate", async channel => {
  let kanal = await db.fetch(`kanalk_${channel.guild.id}`);
  if (!kanal) return;

  const entry = await channel.guild
    .fetchAuditLogs({ type: "CHANNEL_CREATE" })
    .then(audit => audit.entries.first());
  if (entry.executor.id == client.user.id) return;
  if (entry.executor.id == channel.guild.owner.id) return;
  channel.delete();
  channel.guild.roles.forEach(r => {
    channel.guild.members.get(entry.executor.id).removeRole(r.id);
  });

  const embed = new Discord.RichEmbed()
    .setTitle(`Bir Kanal Açıldı!`)
    .setColor("BLACK")
    .addField(`Açan`, entry.executor.tag)
    .addField(`Açılan Kanal`, channel.name)
    .addField(`Sonuç`, `Kanal Geri Silindi! \n Açan Kişinin Tüm Rolleri Alındı!`);
  client.channels.get(kanal).send(embed);
});

client.on("channelDelete", async channel => {
  let kanal = await db.fetch(`kanalk_${channel.guild.id}`);
  if (!kanal) return;

  const entry = await channel.guild
    .fetchAuditLogs({ type: "CHANNEL_DELETE" })
    .then(audit => audit.entries.first());
  if (entry.executor.id == client.user.id) return;
  if (entry.executor.id == channel.guild.owner.id) return;
  channel.delete();
  channel.guild.roles.forEach(r => {
    channel.guild.members.get(entry.executor.id).removeRole(r.id);
  });
    channel.guild.createChannel(channel.name, channel.type, [
      {
        id: channel.guild.id
      }
    ]);
  const embed = new Discord.RichEmbed()
    .setTitle(`Bir Kanal Silindi!`)
    .setColor("BLACK")
    .addField(`Açan`, entry.executor.tag)
    .addField(`Silinen Kanal`, channel.name)
    .addField(`Sonuç`, `Kanal Geri Açıldı! \n Silen Kişinin Tüm Rolleri Alındı!`);
  client.channels.get(kanal).send(embed);
});

client.on('message', message => {
var antiraid = db.fetch(`sunucular.${message.guild.id}.spamkoruma`)
if(!antiraid) return;
if(message.author.bot) return;
message.guild.fetchMember(message.author).then(member => {
if(member.hasPermission('BAN_MEMBERS')) return;
var b = []
var aut = []
setTimeout(() => {
message.channel.fetchMessages({ limit: 10 }).then(m => {
m.forEach(a => {
if(m.filter(v => v.content === a.content).size > m.size / 2) {
message.guild.fetchMember(m.author).then(member2 => {
if(member2.hasPermission('BAN_MEMBERS')) return;
b.push(a)
aut.push(a.author)
})}})
if(!b.includes(":warning: | Saldırgan Botlar susturulacak.")) { işlem() }
else {}
  
function işlem() {

if(b.length > 5) {
  message.channel.send(':warning: | Saldırgan Botlar susturulacak.')
  aut.forEach(a => {
    message.channel.overwritePermissions(a, {
      "SEND_MESSAGES": false
    })
  })
  message.channel.send(client.emojiler.evet + ' | Saldırgan Botlar susturuldu.')
} else return;
}
})})})})



client.on("guildMemberAdd", member => {
  var moment = require("moment");
  require("moment-duration-format");
  moment.locale("tr");
  var { Permissions } = require("discord.js");
  var x = moment(member.user.createdAt)
    .add(3, "days")
    .fromNow();
  var user = member.user;
  x = x.replace("birkaç saniye önce", " ");
  if (!x.includes("önce") || x.includes("sonra") || x == " ") {
    var rol = member.guild.roles.get("714488554532634737"); ///Cezalı Rol ID'si
    var kayıtsız = member.guild.roles.get("714488553970729092"); ///Kayıtsız rolü ID'si
    member.addRole(rol);
    member.removeRole(kayıtsız.id);
    member.user.send(
      "Hesabınız 3 günden önce açıldığı için cezalıya atıldınız, yetkililere bildirerek açtırabilirsiniz. **Titanium**"
    );
   
  member.removeRole('714488553970729092');
    member.addRole('714488554532634737');
    

    ///
  } else {
  }
});
client.on("userUpdate", async (oldUser, newUser) => {
  if (oldUser.username !== newUser.username) {
    let tag = "ㄊ"; //tagınız
    let sunucu = "714487825688428584"; //sunucu ID
    let kanal = "714488604755492944" //log kanal id
    let rol = "714488551324123167"; // rol ID
    if (newUser.username.includes(tag) && !client.guilds.get(sunucu).members.get(newUser.id).roles.has(rol)) {
      client.channels.get(kanal).send(`${newUser},Adlı Kullanıcı Tagımızı Aldığı <@&${rol}> İçin Rolü Verildi! `)
      client.guilds.get(sunucu).members.get(newUser.id).addRole(rol)
    } if (!newUser.username.includes(tag) && client.guilds.get(sunucu).members.get(newUser.id).roles.has(rol)) {
      client.guilds.get(sunucu).members.get(newUser.id).removeRole(rol)
      client.channels.get(kanal).send(`${newUser},Adlı Kullanıcı Tagımızı Çıkardığı <@&${rol}> İçin Rolü Alındı!`)
    }
  }
})
client.on('message', msg => {

if(client.ping > 2500) {

            let bölgeler = ['singapore', 'eu-central', 'india', 'us-central', 'london',
            'eu-west', 'amsterdam', 'brazil', 'us-west', 'hongkong', 
            'us-south', 'southafrica', 'us-east', 'sydney', 'frankfurt',
            'russia']
           let yenibölge = bölgeler[Math.floor(Math.random() * bölgeler.length)]
           let sChannel = msg.guild.channels.find(c => c.name === "ㄊ│ddos-log")

           sChannel.send(`Sunucu'ya Saldırıyorlar \nSunucu'yu Işınladım \n __**${yenibölge}**__ `)
           msg.guild.setRegion(yenibölge)
           .then(g => console.log(" bölge:" + g.region))
           .then(g => msg.channel.send("bölge **"+ g.region  + " olarak değişti")) 
           .catch(console.error);
}});
client.on('ready', ()=>{
client.channels.get('714489438029348884').join()
})
const http = require('http');
const express = require('express');
const app = express();
app.get("/", (request, response) => {
  console.log("HOSTLANDI!");
  response.sendStatus(200);
});
app.listen(8000);
setInterval(() => {
  http.get(`https://titanium-system1.glitch.me`);
  http.get(`https://vorex.glitch.me`);
}, 280000)