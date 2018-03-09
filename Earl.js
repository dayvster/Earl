var http = require('request'); 
var logger = require('winston');
var auth = require('./auth.json');
const Discord = require("discord.js");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
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
    Weather(){
        var self = this;
        var args    = this.args.join(" ").split(",");
        var city    = args[1];
        var country = args[2];
        var units   = args[0];
        logger.info(args.length);
        var uri     = "";
        if(args.length >= 3){
            logger.info("with country");
            if(country.indexOf(" ") == 0){
                country = country.replace(" ","");
            }
            if(city.indexOf(" ") == 0){
                city = city.replace(" ","");
            }
            if(units.indexOf(" ") == 0){
                units = units.replace(" ", "");
            }
            uri     = "http://api.openweathermap.org/data/2.5/weather?q="+encodeURIComponent(city)+","+encodeURIComponent(country)+"&appid=fb5b18870aa0056982adc2de9a8d4b55&units="+units;
        }else{
            if(city.indexOf(" ") == 0){
                city = city.replace(" ","");
            }
            if(units.indexOf(" ") == 0){
                units = units.replace(" ", "");
            }
            uri = "http://api.openweathermap.org/data/2.5/weather?q="+encodeURIComponent(city)+"&appid=fb5b18870aa0056982adc2de9a8d4b55&units="+units;
        }
        
        var tempunit = {imperial:"°F", metric:"°C", other:"°K"};
        var speedunit = {imperial:"mph", metric:"km/h",other: ""};
        var pressureunit = {imperial:"bar", metric:"bar",other: "bar"};
        if(units == "" || units == undefined || units == null){
            units = "other";
        }
        logger.info(uri);
        http(uri, function(error,response,body){
            if(error == null){
                var r = JSON.parse(body);
                if(r.cod == 200){
                    var sunrise = new Date(r.sys.sunrise);
                    var sunset = new Date(r.sys.sunset);
                    var output = "\n"+
                                 "**Weather:** "+r.weather[0].description + "\n" +
                                 "**Temperature: **" + r.main.temp + tempunit[units] + "\n"+ 
                                 "**Pressure:** " + r.main.pressure + " "+ pressureunit[units] +"\n" +
                                 "**Humidity:** " + r.main.humidity + "%" + "\n" +
                                 "**Temp min:** " + r.main.temp + tempunit[units] + "\n" +
                                 "**Temp max:** " + r.main.temp + tempunit[units] + "\n" +
                                 "**Wind speed:** "+ r.wind.speed + " " + speedunit[units] +" at "+r.wind.deg+"deg"+ "\n" +
                                 "**Sunrise**: "+ sunrise.getHours()+":"+sunrise.getMinutes() + "\n" +
                                 "**Sunset**: "+ sunset.getHours()+":"+sunset.getMinutes() + "\n" ;

                    self.message.reply(output);
                }else{
                    self.message.reply("Sorry buddy I don't know that place, maybe if you tell me in which country it is by adding , CountryCode __example__: !weather [metric/imperial], Bear Mountain, US");
                }
            }
        });
        
    }
    Evo(){
        var uri = "https://www.evo.com";
        var input = encodeURIComponent(this.args.join(" "));
        var self = this;

        http(uri+"/shop?text="+input,function(error, response, body){
            const dom = new JSDOM(body);
            var result = dom.window.document.querySelector(".results-products .results-product-thumbs a");
            if(result != null){
                self.message.reply(uri+result.href);
            }else{
                self.message.reply("Sorry buddy, I\'m afraid I can't find that.");
            }
        });
    }
    Help(){
        var help = [
            "",
            "**!google:** returns the first result from a google search",
            "**!weather:** shows weather info for a location __example:__ !weather imperial/metric, New York, US",
            "**!urban:** returns a definition for a word or phrase from urban dictionary",
            "**!userinfo:** shows some cool user information",

        ];
        var output = help.join("\n");
        this.message.reply(output);
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
            case "weather":
                command.Weather();
                break;
            case "help":
                command.Help();
                break;
            case "evo":
                command.Evo();
                break;
        }
    }
    if(message.content.toLowerCase().includes("hey earl")){
        message.channel.send(`Hey ${message.member}`);
    }
    
});

bot.login(auth.token);