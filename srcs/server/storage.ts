import fs from 'fs';
import { Request } from 'express';
import { fileStoragePath } from '../../config.json';
import * as path from 'path';
import HashTrough from 'hash-through';
import crypto from 'crypto';
import { v4 as uuid } from 'uuid';
import sharp from 'sharp';

type Cb = { (arg0: null, arg1: { filename: string; size: number; }): void; (err: Error): void; };

class CustomStorage {
	public _handleFile (req: Request, file: Express.Multer.File, cb: Cb) {
		const ht = HashTrough(() => crypto.createHash('md5'));
		const destination = path.join(fileStoragePath, uuid());
		const outStream = fs.createWriteStream(destination);
		var ext: string;

		switch (file.fieldname) {
			case 'sound': {
				if (file.mimetype != 'audio/mpeg') {
					cb(new Error ('Wrong file type'));
					return;
				}
				file.stream.pipe(ht).pipe(outStream);
				ext = 'mp3';
				break;
			}
			case 'image': {
				if (!file.mimetype.startsWith('image/')) {
					cb(new Error ('Wrong file type'));
					return;
				}
				const resizer = sharp().resize(500, 500).webp();
				file.stream.pipe(resizer).pipe(ht).pipe(outStream);
				ext = 'webp';
				break;
			}
			default:
				cb(new Error('Malformed form'));
				return;
		}

		let firstCall = true;
		const callback = () => {
			if (firstCall) {
				firstCall = false;
				return;
			}
			const filename = `${ht.digest('hex')}.${ext}`;
			const newDestination = path.join(fileStoragePath, filename);
			fs.renameSync(destination, newDestination);
			cb(null, {
				size: outStream.bytesWritten,
				filename
			});
		};
		outStream.on('error', cb);
		outStream.on('close', callback);
		ht.on('finish', callback);
	}

	public _removeFile (req: Request, file: Express.Multer.File, cb: fs.NoParamCallback) {
		fs.unlink(file.path, cb);
	}
}

export default function (): CustomStorage {
	return new CustomStorage();
}
