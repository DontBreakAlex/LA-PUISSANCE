import express from 'express';
import cookieParser from 'cookie-parser';
import { v4 as uuid } from 'uuid';
import bodyParser from 'body-parser';
import { BotReceived, Commands, ServerReceived } from './messages';
import { Collection, MongoClient, ObjectId } from 'mongodb';
import { fileStoragePath, mongoDatabase, mongoUri } from '../../config.json';
import multer from 'multer';
import { mkdirSync } from 'fs';
import { join, parse } from 'path';
import type { File, User } from './serverTypes';

try {
	mkdirSync(fileStoragePath, { recursive: true });
} catch {}
const app = express();
const client = new MongoClient(mongoUri, { useUnifiedTopology: true });
// This map holds the user that are waiting to log in
const userMap = new Map<string, User>();
const storage = multer.diskStorage({
	destination: (req, file, callback) => callback(null, fileStoragePath),
	filename: (req, file, callback) => {
		if (file.mimetype !== 'audio/mpeg')
			callback(new Error('Wrong file type'), '');
		else {
			const parsed = parse(file.originalname);
			const filename = `${parsed.name}-${req.user!.uid}${parsed.ext}`;
			callback(null, filename);
		}
	}
});
const upload = multer({ storage, limits: { fileSize: 1024 * 1024 } });

client.connect().then(async () => {
	console.log('Connected to database !');

	const db = client.db(mongoDatabase);
	const Users: Collection<User> = db.collection('Users');
	const Files: Collection<File> = db.collection('Files');

	app.use(cookieParser());
	app.use(bodyParser.urlencoded({ extended: false }));

	app.get('/login', async (req, res) => {
		if (!req.query.p) {
			res.status(400).send('<h1>401 Unauthorized</h1>');
			return;
		}
		const user = userMap.get(req.query.p.toString());
		if (!user) {
			res.status(500).send('<h1>Internal error</h1>');
			return;
		}
		const result = await Users.insertOne(user);
		userMap.delete(req.query.p.toString());
		if (result.result.ok) {
			res.cookie('lp', result.insertedId.toString(), {
				// secure: true,
				httpOnly: true,
				sameSite: 'strict'
			}).redirect('/');
		} else {
			res.status(500).send('<h1>Internal error</h1>');
		}
	});

	app.use(async (req, res, next) => {
		if (!req.cookies.lp) {
			res.status(401).send('<h1>401 Unauthorized</h1>');
			return;
		}

		const id = new ObjectId(req.cookies.lp);
		const user = await Users.findOne(id);
		if (user) {
			req.user = user;
			next();
		} else {
			res.status(401).send('<h1>401 Unauthorized</h1>');
		}
	});

	app.use(express.static(join(__dirname, '../../../static')));

	app.post('/upload', upload.single('sound'), async (req, res) => {
		await Files.insertOne({ filename: req.file.filename, uid: req.user!.uid, name: req.body.name });
		res.send('OK');
	});

	app.get('/list', async (req, res) => {
		const files = await Files.aggregate([
			{
				$match: {
					uid: req.user!.uid
				}
			}, {
				$project: {
					name: true
				}
			}
		]);
		const array = await files.toArray();
		res.json(array);
	});

	app.post('/play', async (req, res) => {
		const id = req.query.p;
		if (typeof id != 'string') {
			res.status(400).send();
			return;
		}
		const file = await Files.findOne(new ObjectId(id));
		if (file) {
			sendMessage({ message: {
				cmd: Commands.PlaySound,
				filename: file.filename,
				user: req.user!
			} });
			res.status(200).send();
		}
		res.status(404).send();
	});

	function buildLoginUrl(user: User) {
		const id = uuid();
		userMap.set(id, user);
		return `http://127.0.0.1:3000/login?p=${id}`;
	}

	app.listen(3000, () => {
		process.on('message', (message: ServerReceived) => {
			switch (message.message.cmd) {
				case Commands.ProduceUrl:
					sendMessage({
						cnt: message.cnt,
						message: {
							cmd: Commands.ProducedUrl,
							url: buildLoginUrl(message.message.user)
						}
					});
					break;
			}
		});
		console.log('Server UP !');
	});
});

function sendMessage(message: BotReceived) {
	process.send!(message);
}

declare global {
	namespace Express {
		interface Request {
			user?: User
		}
	}
}
