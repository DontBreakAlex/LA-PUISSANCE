import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import crypto from 'crypto';
import { s3bucket, s3endpoint, s3region, s3secret, s3user } from '../../config.json';
import sharp from 'sharp';
import { Request } from 'express';
import { Buffer } from 'buffer';
import type { Cb, Storage } from './storageTypes';
import type Stream from 'stream';

const client = new S3Client({
	endpoint: s3endpoint,
	credentials: {
		accessKeyId: s3user,
		secretAccessKey: s3secret
	},
	region: s3region,
	forcePathStyle: true
});

const Bucket = s3bucket ?? 'soundbox';

export class S3Storage implements Storage {
	async _handleFile(req: Request, file: Express.Multer.File, cb: Cb): Promise<void> {
		try {
			var ext: string;
			const chunks = [];
			// We exhaust the readable instead of forwarding to s3, because we need to compute the name of the file
			// prior to making the upload command
			for await (const chunk of file.stream)
				chunks.push(chunk);
			var buffer: Buffer = Buffer.concat(chunks);
			const hash = crypto.createHash('md5').update(buffer).digest('hex');

			switch (file.fieldname) {
				case 'sound': {
					if (file.mimetype != 'audio/mpeg') {
						cb(new Error('Wrong file type'));
						return;
					}
					ext = 'mp3';
					break;
				}
				case 'image': {
					if (!file.mimetype.startsWith('image/')) {
						cb(new Error('Wrong file type'));
						return;
					}
					ext = 'webp';
					buffer = await sharp(buffer).resize(500, 500).webp().toBuffer();
					break;
				}
				default:
					cb(new Error('Malformed form'));
					return;
			}


			const filename = `${hash}.${ext}`;
			await client.send(new PutObjectCommand({
				Bucket,
				Key: filename,
				Body: buffer
			}));
			cb(null, {
				size: buffer.length,
				filename
			});
		} catch (e) {
			cb(e);
		}
	}

	_removeFile(req: Request, file: Express.Multer.File, cb: any): void {
		// Untested
		console.warn('_removeFile called !');
		cb(null);
	}

	async getFile(filename: string, expiresIn = 900): Promise<string> {
		const command = new GetObjectCommand({
			Bucket,
			Key: filename
		});
		const url = await getSignedUrl(client, command, { expiresIn });
		console.log(url);
		return url;
	}

	public async getFileStream(filename: string): Promise<Stream.Readable> {
		const command = new GetObjectCommand({
			Bucket,
			Key: filename
		});
		const resp = await client.send(command);
		if (!resp.Body || !('pipe' in resp.Body)) {
			throw new Error('Error handling file');
		}
		return resp.Body;
	}
}
