import express from 'express';
import cookieParser from 'cookie-parser';
import { v4 as uuid } from 'uuid';
import bodyParser from 'body-parser';
import { Commands, ServerReceived } from './messages';
import { MongoClient, ObjectId } from 'mongodb';
import { mongoUri, mongoDatabase, fileStoragePath } from '../../config.json';
import multer from 'multer';
import { mkdirSync } from 'fs';
import { join, parse } from 'path';

try {
	mkdirSync(fileStoragePath);
} catch {}
const app = express();
const client = new MongoClient(mongoUri, { useUnifiedTopology: true });
// This map holds the user that are waiting to log in
const userMap = new Map<string, { uid: string; guid: string }>();
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

type User = { uid: string; guid: string }

client.connect().then(async () => {
	console.log('Connected to database !');

	const db = client.db(mongoDatabase);
	const Users = db.collection('Users');
	const Files = db.collection('Files');

	app.use(cookieParser());
	app.use(bodyParser.urlencoded({ extended: false }));
	
	app.get('/login', async (req, res) => {
		if (!req.query.p) {
			res.status(400).send('<h1>401 Unauthorized</h1>');
			return;
		}
		const user = userMap.get(req.query.p.toString());
		const result = await Users.insertOne(user);
		userMap.delete(req.query.p.toString());
		if (result.result.ok) {
			res.cookie('lp', result.insertedId.toString(), {
				secure: true,
				httpOnly: true,
				sameSite: 'strict'
			}).redirect('/');
		} else {
			res.status(500).send('<h1>Internal error</h1>');
		}
	});

	app.use(async (req, res, next) => {
		if (!req.cookies.lp) {
			res.status(401).send();
			return;
		}

		const id = new ObjectId(req.cookies.lp);
		const user: User = await Users.findOne(id);
		if (user) {
			req.user = user;
			next();
		} else {
			res.status(401).send();
		}
	});
	
	app.get('/', async (req, res) => {
		res.sendFile(join(__dirname, '../../../static/index.html'));
	});

	app.post('/upload', upload.single('sound'), async (req, res) => {
		await Files.insertOne({ filename: req.file.filename, uid: req.user!.uid, name: req.body.name });
		res.send('DONE !');
	});

	app.get('/list', async (req, res) => {
		const files = await Files.aggregate([
			{
				'$match': {
					'uid': '220843231607390208'
				}
			}, {
				'$project': {
					'name': true
				}
			}
		]);
		const array = await files.toArray();
		console.log(array);
		res.json(array);
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
					process.send!({
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

declare global {
	namespace Express {
		interface Request {
			user?: User
		}
	}
}
