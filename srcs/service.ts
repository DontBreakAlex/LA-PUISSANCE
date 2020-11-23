import Command from './command'
import { Message } from "discord.js"
import { services } from "../config.json"
import { spawn } from 'child_process'

export default new class Service extends Command {
	constructor() {
		super();
	}

	test(command: string): boolean {
		return command == 'start' || command == 'stop';
	}

	execute(message: Message, array: string[]): void {
		const service = services.find(elem => elem.name == array[1]);
		let process;
		if (!service) {
			message.channel.send(`Il n'y a pas de serveur ${array[1]} !`);
			return;
		}
		if (array[0] == 'start') {
			process = spawn(service.start, { shell: true, stdio: "ignore" });
		} else if (array[0] == 'stop') {
			process = spawn(service.stop, { shell: true, stdio: "ignore" });
		}

		if (!process) {
			message.channel.send(`Erreur interne: spawn failure`);
			return;
		} else {
			process.once('exit', (code, signal) => {
				if (code == 0) {
					message.channel.send(`Serveur ${array[1]} ${array[0] == 'start' ? 'démaré' : 'arrêté'}`);
				} else {
					message.channel.send(`Erreur interne: ${code}`);
				}
			})
		}
	}

	helpSummary = {
		text: "Démarre ou stoppe un serveur",
		prefix: "start / stop"
	};

	help = {
		title: "Server",
		fields: [
			{
				name: "Exemple",
				value: "lp start astroneer"
			}
		]
	}
}
