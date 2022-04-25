import "./env.js";

import { Client } from "revolt.js";
import { config } from "./config.js";
import { BotFramework } from "./modules/framework.js";

class Remix extends Client {
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

let remixClient = new Remix();

remixClient.loginBot(process.env.TOKEN!);

export { remixClient as extClient };

import express from 'express';

const app = express();

app.get('/', (req, res) => {
  res.send('Remix')
});

app.listen(8080, () => {
  console.log('server started');
});
