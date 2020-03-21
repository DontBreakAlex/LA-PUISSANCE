"use strict";
exports.__esModule = true;
var discord_js_1 = require("discord.js");
var config = require("./config.json");
var bot = new discord_js_1.Client();
bot.on('ready', function () {
    console.log('Bot is UP !');
});
bot.login(config.discordToken);
