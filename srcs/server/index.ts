import express from 'express';
import cookieParser from 'cookie-parser';
import { v4 as uuid } from 'uuid';
import bodyParser from 'body-parser';
import { CryptographyKey, SodiumPlus } from 'sodium-plus';
import { Commands, ServerReceived } from './messages';

SodiumPlus.auto().then(async sodium => {
	const app = express();
	const Users = new Map<string, string>();
	const key = new CryptographyKey(Buffer.from('CIqtYHFFZoeg6RHN8Y4rgQi8wNbcSlszabpApvlExz0=', 'base64'));
	const nonceLength = 24;
	
	app.use(cookieParser());
	app.use(bodyParser.urlencoded({ extended: false }));
	
	app.get('/login', async (req, res) => {
		if (!req.query.p) {
			res.status(400).send();
			return;
		}

		console.time('Cookie generation');
		const value = Users.get(req.query.p.toString());
		const nonce = await sodium.randombytes_buf(nonceLength);
		const encrypted = await sodium.crypto_secretbox(JSON.stringify(value), nonce, key);
		const joined = Buffer.concat([nonce, encrypted]).toString('base64');
		console.log(`Cookie is ${joined.length} bytes long`);

		Users.delete(req.query.p.toString());
		console.timeEnd('Cookie generation');

		res.cookie('lp', joined, {
			secure: true,
			httpOnly: true,
			sameSite: 'strict'
		}).redirect('/');
	});
	
	app.get('/', async (req, res) => {
		console.time('Cookie decryption');

		if (!req.cookies.lp) {
			console.log('Missing cookies !');
			res.status(401).send();
			return;
		}

		const buff = Buffer.from(req.cookies.lp, 'base64');
		const nonce = buff.slice(0, nonceLength);
		const data = buff.slice(nonceLength);
		const payload = JSON.parse((await sodium.crypto_secretbox_open(data, nonce, key)).toString('utf8'));

		console.log(`Decoded payload ${JSON.stringify(payload)}`);
		console.timeEnd('Cookie decryption');

		res.send('OK');
	});
	
	function buildLoginUrl(userId: string) {
		const id = uuid();
		Users.set(id, userId);
		return `http://127.0.0.1:3000/login?p=${id}`;
	}

	app.listen(3000, () => {
		process.on('message', (message: ServerReceived) => {
			switch (message.message.cmd) {
				case Commands.ProduceUrl:
					process.send!({
						cnt: message.cnt,
						message: {
							cmd: Commands.ProducedUrl,
							url: buildLoginUrl(message.message.uid)
						}
					});
					break;
			}
		});
		console.log('Server UP !');
	});
});
