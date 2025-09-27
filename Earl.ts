import request from 'request';
import * as winston from 'winston';
import { Client, Message, GuildMember } from 'discord.js';
import { JSDOM } from 'jsdom';
import * as dotenv from 'dotenv';
dotenv.config();

// Winston v2 API for compatibility
const logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({
      colorize: true
    })
  ]
});
logger.level = 'debug';

class Command {
  message: Message;
  args: string[];
  cmd: string;

  constructor(message: Message) {
    this.message = message;
    this.args = this.message.content.split(' ');
    this.cmd = this.args[0].substring(1);
    this.args = this.args.slice(1);
  }

  Userinfo() {
    const idMatch = this.args[0]?.match(/\d+/g);
    if (!idMatch) return;
    const id = idMatch[0];
  const member = this.message.guild?.members.get(id);
    if (!member) return;
    const joinedDate = new Date(member.joinedAt!);
    let hrole = member.highestRole.name;
    if (hrole.includes('@')) {
      hrole = hrole.replace('@', '');
    }
    const output = `\n**Username:** ${member.user.username}\n**Nickname:** ${member.nickname}\n**Member since:** ${joinedDate}\n**Highest role:** ${hrole}\n**Status:** ${member.presence.status}\n**Avatar:** ${member.user.avatarURL}`;
    this.message.reply(output);
  }

  Urban() {
    const self = this;
    const query = this.args.join(' ');
    const uri = `http://api.urbandictionary.com/v0/define?term=${query}`;
    request(uri, function (error: any, response: any, body: any) {
      if (error) return;
      const result = JSON.parse(body);
      if (result.result_type === 'no_results') {
        self.message.reply(`I'm afraid our archives do not contain any record of the word or phrase: ${query}`);
      } else {
        const definition = result.list[0].definition;
        self.message.reply(`__**${query}**__\n${result.tags.join(',')}\n\n**Definition:** ${definition}\n\n**Example:** ${result.list[0].example}`);
      }
    });
  }

  Google() {
    const query = this.args.join('+');
    if (/jake\+paul|logan\+paul/i.test(query)) {
      this.message.reply('I politely refuse!');
    } else {
      this.message.reply(`https://www.google.com/search?btnI=1&q=${query}`);
    }
  }

  Weather() {
    try {
      const self = this;
      const args = this.args.join(' ').split(',');
      let city = args[1];
      let country = args[2];
      let units = args[0];
      let uri = '';
      if (args.length >= 3) {
        if (country && country.startsWith(' ')) country = country.trim();
        if (city && city.startsWith(' ')) city = city.trim();
        if (units && units.startsWith(' ')) units = units.trim();
        uri = `http://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)},${encodeURIComponent(country)}&appid=fb5b18870aa0056982adc2de9a8d4b55&units=${units}`;
      } else {
        if (city && city.startsWith(' ')) city = city.trim();
        if (units && units.startsWith(' ')) units = units.trim();
        uri = `http://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=fb5b18870aa0056982adc2de9a8d4b55&units=${units}`;
      }
      const tempunit: Record<string, string> = { imperial: '°F', metric: '°C', other: '°K' };
      const speedunit: Record<string, string> = { imperial: 'mph', metric: 'km/h', other: '' };
      const pressureunit: Record<string, string> = { imperial: 'bar', metric: 'bar', other: 'bar' };
      if (!units) units = 'other';
      request(uri, function (error: any, response: any, body: any) {
        if (!error) {
          const r = JSON.parse(body);
          if (r.cod === 200) {
            const output = `\n**Weather:** ${r.weather[0].description}\n**Temperature: **${r.main.temp}${tempunit[units]}\n**Pressure:** ${r.main.pressure} ${pressureunit[units]}\n**Humidity:** ${r.main.humidity}%\n**Temp min:** ${r.main.temp}${tempunit[units]}\n**Temp max:** ${r.main.temp}${tempunit[units]}\n**Wind speed:** ${r.wind.speed} ${speedunit[units]} at ${r.wind.deg}deg\n`;
            self.message.reply(output);
          } else {
            self.message.reply("Sorry buddy I don't know that place, maybe if you tell me in which country it is by adding , CountryCode __example__: !weather [metric/imperial], New York, US");
          }
        }
      });
    } catch (error) {
      console.log(error);
    }
  }

  Evo() {
    const uri = 'https://www.evo.com';
    const input = encodeURIComponent(this.args.join(' '));
    const self = this;
    request(`${uri}/shop?text=${input}`, function (error: any, response: any, body: any) {
      if (error) return;
      const dom = new JSDOM(body);
      const result = dom.window.document.querySelector('.results-products .results-product-thumbs a');
      if (result) {
        self.message.reply(uri + result.getAttribute('href'));
      } else {
        self.message.reply("Sorry buddy, I'm afraid I can't find that.");
      }
    });
  }

  Tomato() {
    const uri = 'https://www.blue-tomato.com';
    const input = encodeURIComponent(this.args.join(' '));
    const self = this;
    request(`${uri}/products/categories/Snowboard-00000000/?q=${encodeURI(input)}`, function (error: any, response: any, body: any) {
      if (error) return;
      const dom = new JSDOM(body);
      const result = dom.window.document.querySelector('#productList ul li#p0 a');
      if (result) {
        self.message.reply(uri + result.getAttribute('href'));
      } else {
        self.message.reply("Sorry buddy, I'm afraid I can't find that.");
      }
    });
  }

  Help() {
    const help = [
      '',
      '**!google:** returns the first result from a google search',
      '**!weather:** shows weather info for a location __example:__ !weather imperial/metric, New York, US',
      '**!urban:** returns a definition for a word or phrase from urban dictionary',
      '**!userinfo:** shows some cool user information',
    ];
    const output = help.join('\n');
    this.message.reply(output);
  }
}

const bot = new Client();

bot.on('ready', () => {
  logger.info('Connected');
  logger.info('Logged in as: ' + bot.user?.username);
});

bot.on('message', (message: Message) => {
  logger.info(message.content);
  if (message.content.startsWith('!')) {
    const command = new Command(message);
    switch (command.cmd) {
      case 'userinfo':
        command.Userinfo();
        break;
      case 'google':
        command.Google();
        break;
      case 'urban':
        command.Urban();
        break;
      case 'weather':
        command.Weather();
        break;
      case 'help':
        command.Help();
        break;
      case 'evo':
        command.Evo();
        break;
      case 'bt':
        command.Tomato();
        break;
    }
  }
  if (message.content.toLowerCase().includes('hey earl')) {
    message.channel.send(`Hey ${message.member}`);
  }
});

const token = process.env.DISCORD_TOKEN;
if (!token) {
  throw new Error('DISCORD_TOKEN not set in .env');
}
bot.login(token);
