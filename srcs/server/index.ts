import express from 'express';
import cookieParser from 'cookie-parser';
import { v4 as uuid } from 'uuid';
import bodyParser from 'body-parser';
import { BotReceived, Commands, ServerReceived } from './messages';
import { Collection, MongoClient, ObjectId } from 'mongodb';
import { fileStorage, fileStoragePath, mongoDatabase, mongoUri, protocol, host } from '../../config.json';
import multer from 'multer';
import { mkdirSync } from 'fs';
import { join } from 'path';
import type { File, User } from './serverTypes';
import type { Storage } from './storageTypes';

try {
	mkdirSync(fileStoragePath, { recursive: true });
} catch {}
const app = express();
const client = new MongoClient(mongoUri, { useUnifiedTopology: true });
// This map holds the user that are waiting to log in
const userMap = new Map<string, User>();

client.connect().then(async () => {
	console.log('Connected to database !');

	let storage: Storage;
	if (fileStorage == 's3') {
		storage = new (await import('./s3storage')).S3Storage();
	} else {
		storage = new (await import('./filesystemStorage')).CustomStorage();
	}
	const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

	const db = client.db(mongoDatabase);
	const Users: Collection<User & {_id: ObjectId}> = db.collection('Users');
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
		const result = await Users.findOneAndUpdate(user, { $setOnInsert: user }, { upsert: true, returnDocument: 'after' });
		userMap.delete(req.query.p.toString());
		if (result.ok) {
			res.cookie('lp', result.value!._id.toString(), {
				secure: protocol == 'https',
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

	app.post('/upload', upload.fields([
		{ name: 'sound', maxCount: 1 },
		{ name: 'image', maxCount: 1 }
	]), async (req, res) => {
		if (Array.isArray(req.files)) {
			res.status(400).send();
			return;
		}
		const sound = req.files.sound?.[0]?.filename;
		const image = req.files.image?.[0]?.filename;
		if (!sound || !req.body.name) {
			res.status(400).send();
			return;
		}
		await Files.insertOne({
			filename: sound,
			image,
			uid: req.user!.uid,
			name: req.body.name
		}, { });
		res.send();
	});

	app.post('/delete', async (req, res) => {
		const id = req.query.p;
		if (typeof id != 'string') {
			res.status(400).send();
			return;
		}
		const deleted = await Files.findOneAndDelete({ _id: new ObjectId(id) });
		if (!deleted.value) {
			res.status(404).send();
			return;
		}
		const aggregation = aggregationBuilder(deleted.value);
		const result: any = await Files.aggregate(aggregation).next();
		if (!result) {
			res.status(500).send();
			return;
		}
		if (aggregation[0].$facet.filename && !result.filename)
			storage.removeFile(deleted.value.filename);
		if (aggregation[0].$facet.image && !result.image)
			storage.removeFile(deleted.value.image!);
		res.status(200).send();
	});

	app.get('/list', async (req, res) => {
		const files = await Files.aggregate([
			{
				$match: {
					uid: req.user!.uid
				}
			}, {
				$project: {
					name: true,
					image: true
				}
			}
		]);
		const array = await files.toArray();
		res.json(array);
	});

	app.get('/images/:image', async (req, res) => {
		const image = req.params.image;
		if (!image) {
			res.status(400).send();
			return;
		}
		const imageInDb = await Files.findOne({ image }, { projection: { uid: 1 } });
		if (imageInDb && imageInDb.uid == req.user!.uid) {
			try {
				const stream = await storage.getFileStream(image);
				res.set('Cache-Control', 'private, max-age=31536000, immutable');
				stream.pipe(res);
			} catch (e) {
				console.error(e.toString());
				res.status(500).send();
			}
		} else {
			res.status(404).send();
		}
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
				url: await storage.getFile(file.filename),
				user: req.user!
			} });
			res.status(200).send();
		}
		res.status(404).send();
	});

	function buildLoginUrl(user: User) {
		const id = uuid();
		userMap.set(id, user);
		return `${protocol}://${host}/login?p=${id}`;
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

function aggregationBuilder(deleted: File) {
	const agg: any = [{ $facet: {} }, { $project: {} }];
	if (deleted.filename) {
		agg[0].$facet.filename = [
			{
				$match: {
					filename: deleted.filename
				}
			}, {
				$count: 'filename'
			}
		];
		agg[1].$project.filename = {
			$arrayElemAt: [
				'$filename.filename', 0
			]
		};
	}
	if (deleted.image) {
		agg[0].$facet.image = [
			{
				$match: {
					image: deleted.image
				}
			}, {
				$count: 'image'
			}
		];
		agg[1].$project.image = {
			$arrayElemAt: [
				'$image.image', 0
			]
		};
	}
	return agg;
}

declare global {
	namespace Express {
		interface Request {
			user?: User
		}
	}
}
