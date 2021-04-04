import express from 'express';
import cookieParser from 'cookie-parser';
import { v4 as uuid } from 'uuid';
import bodyParser from 'body-parser';
import { CryptographyKey, SodiumPlus } from 'sodium-plus';

SodiumPlus.auto().then(async sodium => {
	const app = express();
	const Users = new Map();
	const key = new CryptographyKey(Buffer.from('CIqtYHFFZoeg6RHN8Y4rgQi8wNbcSlszabpApvlExz0=', 'base64'));
	const nonceLength = 24;
	
	const userId = uuid();
	Users.set(userId, { value: 1 });
	
	app.use(cookieParser());
	app.use(bodyParser.urlencoded({ extended: false }));
	
	app.get('/login', async (req, res) => {
		console.time('Cookie generation');
		const value = Users.get(req.query.p);
		const nonce = await sodium.randombytes_buf(nonceLength);
		const encrypted = await sodium.crypto_secretbox(JSON.stringify(value), nonce, key);
		const joined = Buffer.concat([nonce, encrypted]).toString('base64');

		console.log(`Cookie is ${joined.length} bytes long`);

		Users.delete(req.query.p);
		console.timeEnd('Cookie generation');
		res.cookie('lp', joined, {
			secure: true,
			httpOnly: true,
			sameSite: 'strict'
		}).redirect('/');
	});
	
	app.get('/', async (req, res) => {
		console.time('Cookie decryption');
		if (!req.cookies.lp)
			res.status(401).send();
		const buff = Buffer.from(req.cookies.lp, 'base64');
		const nonce = buff.slice(0, nonceLength);
		const data = buff.slice(nonceLength);
		const payload = JSON.parse((await sodium.crypto_secretbox_open(data, nonce, key)).toString('utf8'));
		console.log(`Decoded payload ${JSON.stringify(payload)}`);
		console.timeEnd('Cookie decryption');
		res.send('OK');
	});
	
	
	console.log(`http://127.0.0.1:3000/login?p=${userId}`);
	app.listen(3000, () => { console.log('Server UP !');});
});