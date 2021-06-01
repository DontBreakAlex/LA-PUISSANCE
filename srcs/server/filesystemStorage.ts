import fs from 'fs';
import { Request } from 'express';
import { fileStoragePath } from '../../config.json';
import path from 'path';
import HashTrough from 'hash-through';
import crypto from 'crypto';
import { v4 as uuid } from 'uuid';
import sharp from 'sharp';
import type { Cb, Storage } from './storageTypes';


export class CustomStorage implements Storage {
	public _handleFile (req: Request, file: Express.Multer.File, cb: Cb): void {
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
				// We wait for both ht and outStream to finish
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

	public _removeFile (req: Request, file: Express.Multer.File, cb: fs.NoParamCallback): void {
		// Untested
		console.warn('_removeFile called !');
		fs.unlink(file.path, cb);
	}

	public getFile(filename: string): string {
		return path.join(fileStoragePath, filename);
	}

	public getFileStream(filename: string): fs.ReadStream {
		return fs.createReadStream(path.join(fileStoragePath, filename));
	}

	public removeFile(filename: string): void {
		fs.unlink(path.join(fileStoragePath, filename), () => {});
	}
}
