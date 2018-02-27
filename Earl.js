var http = require('request'); 
var logger = require('winston');
var auth = require('./auth.json');
const Discord = require("discord.js");
const bot = new Discord.Client();

logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, {
    colorize: true
});
logger.level = 'debug';

class Command{
    constructor(message){
        this.message = message;
        this.args = this.message.content.split(' ');
        this.cmd = this.args[0].substring(1,this.args[0].length);
        this.args = this.args.splice(1);
    }

    Test(){
        this.message.reply("Test test");
    }
    Userinfo(){
        var id = this.args[0].match(/\d+/g)[0];
        var member = this.message.guild.members.get(id);
        var joinedDate = new Date(member.joinedAt); 
        var output = 
            "\n**Username:** "+ member.user.username +
            "\n**Nickname:** "+ member.nickname +
            "\n**Member since:** "+ joinedDate + 
            "\n**Highest role:** "+member.highestRole.name +
            "\n**Status:** "+member.presence.status +
            "\n**Avatar:** "+member.user.avatarURL;
        this.message.reply(output);
    }
    Urban(){
        var self = this;
        var query = this.args.join(' ');
        var uri = "http://api.urbandictionary.com/v0/define?term="+query;
        http(uri, function(error, response,body){
            var result = JSON.parse(body);
            if(result.result_type == "no_results"){
                self.message.reply("I'm afraid our archives do not contain any record of the word or phrase: "+query);
            }else{
                var definition = result.list[0].definition;
                self.message.reply("__**"+query+"**__\n"+result.tags.join(",")+"\n\n**Definition:** "+definition+"\n\n**Example:** " + result.list[0].example);
            }             
        });
    }
    Google(){
        var query = this.args.join("+");
        if(query.toLowerCase().includes("jake+paul") || query.toLowerCase().includes("logan+paul")){
            this.message.reply("I politely refuse!");
        }else{
            this.message.reply("https://www.google.com/search?btnI=1&q="+query);
        }
    }
}

bot.on("ready", () => {
    logger.info("Connected");
    logger.info("Logged in as: " + bot.user.username);
});

bot.on("message", function(message){
    logger.info(message.content);

    if(message.content.substring(0,1) == '!'){
        var command = new Command(message);

        switch(command.cmd){
            case "test":
                command.Test();
                break;
            case "userinfo":
                command.Userinfo();
                break;
            case "google":
                command.Google();
                break;
            case "urban":
                command.Urban();
                break;
        }
    }
});

bot.login(auth.token);