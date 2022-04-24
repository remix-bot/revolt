import "./env.js";

import { Client } from "revolt.js";
import { config } from "./config.js";
import { BotFramework } from "./modules/framework.js";

class RexBot extends Client {
	framework: BotFramework;

	constructor(...args: undefined[]) {
		super({ apiURL: process.env.API_URL ?? "https://api.revolt.chat" });
		this.framework = new BotFramework(
			this,
			config.developers,
			config.prefix
		);
	}
}

let client = new RexBot();

client.loginBot(process.env.TOKEN!);

import express from 'express';

const app = express();

app.get('/', (req, res) => {
  res.send('Hello Express app!')
});

app.listen(3000, () => {
  console.log('server started');
});