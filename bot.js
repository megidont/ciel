var Discord = require('discord.js');
var auth = require('./auth.json');
var fs = require('fs');
var servers;
var helpMessages;

var evilGlobal;														//refactor code completely at 3am or have it a bit messy?

try{

	servers = require('./servers.json');

}catch(e){

	servers = {};

}

function saveServers(){

	fs.writeFile('./servers.json',JSON.stringify(servers), 'utf8', function (err){if(err != null){console.log(err)}});

}

function createServerJson(guild){

	servers[guild.id] = {

		roleMessage: null,
		roleMessageChannel: null,
		roles: {}

	};

	saveServers();

}

async function checkCompatible(message, idCandidate){

	var compatibleCandidate = false;

	for(let c of message.guild.channels.cache){

		if(c[1].type == "text"){
			await c[1].messages.fetch(idCandidate[0]).then(message => {compatibleCandidate = true; evilGlobal = c[1].id;}).catch(()=>{});
		}

	}

	if(idCandidate[0] == null){ return false; }

	return compatibleCandidate;

}

try{

	helpMessages = require('./helpMessages.json');

}catch(e){

	console.error("Could not load help messages. These are troubled waters." + e);
	helpMessages = {

		"ciel":{

			"color":0x882299,
			"title":"Troubled Waters",
			"description":"Troubled Waters",
			"fields":{

				"field1":{

					"name":"Troubled Waters",
					"description":"Troubled Waters"

				},
				"field2":{

					"name":"Troubled Waters",
					"description":"Troubled Waters"

				},
				"field3":{

					"name":"Troubled Waters",
					"description":"Troubled Waters"

				}

			}

		},
		"penny":{

			"color":0x882299,
			"title":"Troubled Waters",
			"description":"Troubled Waters",
			"fields":{

				"field1":{

					"name":"Troubled Waters",
					"description":"Troubled Waters"

				},
				"field2":{

					"name":"Troubled Waters",
					"description":"Troubled Waters"

				},
				"field3":{

					"name":"Troubled Waters",
					"description":"Troubled Waters"

				}

			}

		}
	};

}

var bot = new Discord.Client({partials: ['MESSAGE', 'CHANNEL', 'REACTION']});

var ciel = true;

var events = {

	MESSAGE_REACTION_ADD: 'messageReactionAdd',
	MESSAGE_REACTION_REMOVE: 'messageReactionRemove'

};

bot.once('ready', function(evt){

	console.log("Connected as " + bot.user.username + " (" + bot.user.id + ")");

	if(ciel == false){

		bot.user.setActivity("the part she needs to play.", {type: "PLAYING" });

	}else{

		bot.user.setActivity(null);

	}

});

bot.on('message', function(message){

	var at = "<@" + bot.user.id + ">";
	var nickat = "<@!" + bot.user.id + ">";

	if(message.content.startsWith(at) || message.content.startsWith(nickat) || (message.guild == null && message.author.bot != true)){

		if(message.guild == null){

			if(ciel == true){

				helpMessage = new Discord.MessageEmbed()
					.setColor(helpMessages.ciel.color)
					.setTitle(helpMessages.ciel.title)
					.setDescription(helpMessages.ciel.description);

				for(field in helpMessages.ciel.fields){
					helpMessage.addField(helpMessages.ciel.fields[field].name, helpMessages.ciel.fields[field].description);
				};

				message.channel.send({embed: helpMessage == null? new Discord.RichEmbed.setDescription("Troubled Waters") : helpMessage});

			}else{

				helpMessage = new Discord.MessageEmbed()
					.setColor(helpMessages.penny.color)
					.setTitle(helpMessages.penny.title)
					.setDescription(helpMessages.penny.description);

				for(field in helpMessages.penny.fields){
					helpMessage.addField(helpMessages.penny.fields[field].name, helpMessages.penny.fields[field].description);
				};

				message.channel.send({embed: helpMessage == null? new Discord.RichEmbed.setDescription("Troubled Waters") : helpMessage});

			}

			return;

		}

		var perms = message.member.permissions;

		var a = message.content.toLowerCase().split(" ");
		var server = message.guild;
		var mess;
		var submess = "";

		if(a[1] == "usemessage"){

			var idCandidate = a.length > 2 ? (a[2].match(/\d\d?\d?\d?\d?\d?\d?\d?\d?\d?\d?\d?\d?\d?\d?\d?\d?\d?\d?\d?/) == null? [ null, null, null ] : a[2].match(/\d\d?\d?\d?\d?\d?\d?\d?\d?\d?\d?\d?\d?\d?\d?\d?\d?\d?\d?\d?/)) : [ null, null, null ];

			checkCompatible(message,idCandidate).then(result => {

				if(a.length != 3){

					if(ciel == true){

						mess = "<@" + message.author.id + ">, please send the ID of exactly one message to be watched.";

					}else{

						mess = "<@" + message.author.id + ">, please specify exactly one message for me to watch!";

					}

				}else{

					if(idCandidate[0] == null || a[2].length > 20){

						if(ciel == true){

							mess = "<@" + message.author.id + ">, that doesn't look like it has a message ID.";

						}else{

							mess = "<@" + message.author.id + ">, that doesn't look like a message ID to me.";

						}


					}else{

						if(result == true){

							if(typeof servers[message.guild.id] === undefined){ createServerJson(message.guild); }
							servers[message.guild.id].roleMessage = idCandidate[0];
							servers[message.guild.id].roleMessageChannel = evilGlobal;
							saveServers();

							if(ciel == true){
								mess = "<@" + message.author.id + ">, that message will be watched for role reactions.";
							}else{
								mess = "<@" + message.author.id + ">, I will watch that message!";
							}

						}else{

							if(ciel == true){
								mess = "<@" + message.author.id + ">, that message ID could not be found in this server.";
							}else{
								mess = "<@" + message.author.id + ">, I couldn't find a message that matched that ID.";
							}

						}

					}

				}

				message.channel.send(mess);

			}).catch(console.error);

		}else if(a[1] == "setrole"){
			if(typeof servers[message.guild.id] === undefined){
				if(ciel == true){
					mess = "<@" + message.author.id + ">, please ensure you have set the role message.";
				}else{
					mess = "<@" + message.author.id + ">, please make sure to set the role message first!";
				}
			}else if(servers[message.guild.id].roleMessage == null || typeof servers[message.guild.id].rolemessage === undefined){
				if(ciel == true){
					mess = "<@" + message.author.id + ">, please ensure you have set the role message.";
				}else{
					mess = "<@" + message.author.id + ">, please make sure to set the role message first!";
				}
			}else if(a.length != 4){
				if(ciel == true){
					mess = "<@" + message.author.id + ">, please use <@" + bot.user.id + "> setrole [role mention] [emoji].";
				}else{
					mess = "<@" + message.author.id + ">, please use <@" + bot.user.id + "> setrole [role mention] [emoji] to add an emoji for a role!";
				}
			}else{

				var roleIdCandidate = a[2].match(/\d\d\d\d\d\d\d\d\d\d\d?\d?\d?\d?\d?\d?\d?\d?\d?\d?/)[0];

				var roleExists = false;

				for(let r of message.guild.roles.cache){
					if(r[1].id == roleIdCandidate){
						roleExists = true;
					}
				}

				if(roleExists){
					var prevRole = servers[message.guild.id].roles[roleIdCandidate];
					if(prevRole != null){
						if(prevRole.startsWith("<")){
							prevRole = prevRole.match(/\d\d\d\d\d\d\d\d\d\d\d?\d?\d?\d?\d?\d?\d?\d?\d?\d?/)[0];
						}
					}
					if(typeof servers[message.guild.id].roles[roleIdCandidate] !== undefined && servers[message.guild.id].roles[roleIdCandidate] != null){
						message.guild.channels.cache.get(servers[message.guild.id].roleMessageChannel).messages.fetch({around: servers[message.guild.id].roleMessage, limit: 1}).then(messages => {

							messages.first().reactions.resolve(prevRole).remove();

						}).catch(error => console.error);
					}
					servers[message.guild.id].roles[roleIdCandidate] = a[3];
					var reacted = true;
					if(servers[message.guild.id].roles[roleIdCandidate].startsWith("<")){
						var emojiId = servers[message.guild.id].roles[roleIdCandidate].match(/\d\d\d\d\d\d\d\d\d\d\d?\d?\d?\d?\d?\d?\d?\d?\d?\d?/)[0];
						message.guild.channels.cache.get(servers[message.guild.id].roleMessageChannel).messages.fetch({around: servers[message.guild.id].roleMessage, limit: 1}).then(messages => messages.first().react(emojiId).catch(error => {console.error; reacted = false;})).catch(error => {console.error; reacted = false;});
					}else{
						message.guild.channels.cache.get(servers[message.guild.id].roleMessageChannel).messages.fetch({around: servers[message.guild.id].roleMessage, limit: 1}).then(messages => messages.first().react(servers[message.guild.id].roles[roleIdCandidate]).catch(error => {console.error; reacted = false;})).catch(error => {console.error; reacted = false;});
					}
					if(ciel == true){
						mess = "<@" + message.author.id + ">, we will try to use " + servers[message.guild.id].roles[roleIdCandidate] + " for that role. Please be advised that checking if it is an emoji is unfeasible right now.";
					}else{
						mess = "<@" + message.author.id + ">, I'll try use " + servers[message.guild.id].roles[roleIdCandidate] + " for that role! Please be advised that I cannot check for sure if that is an emoji right now!";
					}
					saveServers();
				}else{
					if(ciel == true){
						mess = "<@" + message.author.id + ">, that doesn't seem to be a role.";
					}else{
						mess = "<@" + message.author.id + ">, I couldn't find that role!";
					}
				}

			}

			message.channel.send(mess);

		}else{

			if(ciel == true){

				helpMessage = new Discord.MessageEmbed()
					.setColor(helpMessages.ciel.color)
					.setTitle(helpMessages.ciel.title)
					.setDescription(helpMessages.ciel.description);

				for(field in helpMessages.ciel.fields){
					helpMessage.addField(helpMessages.ciel.fields[field].name, helpMessages.ciel.fields[field].description);
				};

				message.author.send({embed: helpMessage == null? new Discord.RichEmbed.setDescription("Troubled Waters") : helpMessage});

				mess = "<@" + message.author.id + ">, I have sent you an explanation for setting me up.";

			}else{

				helpMessage = new Discord.MessageEmbed()
					.setColor(helpMessages.penny.color)
					.setTitle(helpMessages.penny.title)
					.setDescription(helpMessages.penny.description);

				for(field in helpMessages.penny.fields){
					helpMessage.addField(helpMessages.penny.fields[field].name, helpMessages.penny.fields[field].description);
				};

				message.author.send({embed: helpMessage == null? new Discord.RichEmbed.setDescription("Troubled Waters") : helpMessage});

				mess = "<@" + message.author.id + ">, I've DMed you a message explaining how to set me up!";

			}

			message.channel.send(mess);

		}

	}

});

bot.on('messageReactionAdd', async function(messageReaction, user){

	if(messageReaction.partial){ try { await messageReaction.fetch(); } catch (error) { console.log(error); return; } }

	if(messageReaction.message.id == servers[messageReaction.message.guild.id].roleMessage && user.bot != true){

		var member = await messageReaction.message.guild.members.fetch(user);
		var emoji;

		if(messageReaction.emoji.toString().startsWith("<")){

			emoji = messageReaction.emoji.toString().match(/\d\d\d\d\d\d\d\d\d\d\d?\d?\d?\d?\d?\d?\d?\d?\d?\d?/)[0];

		}else{

			emoji = messageReaction.emoji.toString();

		}

		for(var role in servers[messageReaction.message.guild.id].roles){

			if(servers[messageReaction.message.guild.id].roles[role] == emoji){

				messageReaction.message.guild.roles.fetch(role).then(role => member.roles.add(role)).catch(error => console.error);

				messageReaction.message.channel.send("Added role.");

			}

		}

	}

});

bot.on('messageReactionRemove', async function(messageReaction, user){

	if(messageReaction.partial){ try { await messageReaction.fetch(); } catch (error) { console.log(error); return; } }

	if(messageReaction.message.id == servers[messageReaction.message.guild.id].roleMessage && user.bot != true){

		var member = await messageReaction.message.guild.members.fetch(user);
		var emoji;

		if(messageReaction.emoji.toString().startsWith("<")){

			emoji = messageReaction.emoji.toString().match(/\d\d\d\d\d\d\d\d\d\d\d?\d?\d?\d?\d?\d?\d?\d?\d?\d?/)[0];

		}else{

			emoji = messageReaction.emoji.toString();

		}

		for(var role in servers[messageReaction.message.guild.id].roles){

			if(servers[messageReaction.message.guild.id].roles[role] == emoji){

				member.roles.remove(messageReaction.message.guild.roles.fetch(role)).catch(error => console.error);

				messageReaction.message.channel.send("Removed role.");

			}

		}

	}

});

bot.on('guildCreate', function(guild){

	if(servers[guild.id] == null){

		createServerJson(guild);

	}

});

bot.login(auth.token);
