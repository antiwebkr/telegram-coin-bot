"use strict";
import telegrambot from 'node-telegram-bot-api';
import { get, post } from 'request';

export class coinBOT {
	constructor() {
		this.bot = new telegrambot("YOUR TELEGRAM BOT API KEY", {polling: true}); // Telegram Bot key setting	
		this.alertTimeOut = 60 * 1000; // Alert delay time setting
		this.user_agent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36"; // User-Agent setting
	}
	CurrentCoinParse(coin) {
		return new Promise((resolve) => {
			get({
				url: "https://poloniex.com/public?command=returnTicker",
				headers: this.user_agent
			}, (err, res, html) => {
				if(err) throw err;
				else {
					let data = JSON.parse(html);
					if(typeof data["BTC_" + coin.toUpperCase()] === "object") resolve(data["BTC_" + coin.toUpperCase()]);
					else resolve(0);					
				}
			})
		});
	}
	alert() {
		this.bot.onText(/\/alert (.+)/, (msg, match) => {
			this.CurrentCoinParse(match[1])
				.then((coinData) => {
					if(coinData === 0) this.bot.sendMessage(msg["chat"]["id"], "coin not found...");
					else this.bot.sendMessage(msg["chat"]["id"], match[1].toUpperCase() + " 현재가(BTC): " + coinData["last"]);
				});
			let repeat = setInterval(() => {
				this.CurrentCoinParse(match[1])
					.then((coinData) => {
						if(coinData === 0) clearInterval(repeat);
						else this.bot.sendMessage(msg["chat"]["id"], match[1].toUpperCase() + " 현재가(BTC): " + coinData["last"]);
					});
			}, this.alertTimeOut);
			this.bot.on('message', (message) => {
				if(message["text"] === "stop" && message["chat"]["id"] === msg["chat"]["id"]) clearInterval(repeat);
			});
		});
	}
}