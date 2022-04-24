import fs from "fs";

const commandsFiles = fs.readdirSync("./src/commands"); // todo: make this work with both src and dist
let commandsLoad = [];
for (const file of commandsFiles) {
	if (
		(!file.endsWith(".js") && !file.endsWith(".ts")) ||
		file.endsWith(".d.ts")
	)
		continue;
	const fileName = file.split(".");
	try {
		commandsLoad.push(await import(`../commands/${fileName[0]}.ts`));
		console.log(`[commands] Loaded command file ${file}!`);
	} catch (error) {
		commandsLoad.push(await import(`../commands/${fileName[0]}.js`));
		console.log(`[commands] Loaded command file ${file}!`);
	}
}

export const commands = commandsLoad;
