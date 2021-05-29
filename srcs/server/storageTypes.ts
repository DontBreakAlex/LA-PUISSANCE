import { Request } from 'express';
import type { Readable } from 'stream';

export interface Storage {
	_handleFile(req: Request, file: Express.Multer.File, cb: Cb): void;
	_removeFile(req: Request, file: Express.Multer.File, cb: any): void;
	getFile(filename: string, expiresIn?: number): Promise<string> | string;
	getFileStream(filename: string): Promise<Readable> | Readable
}

export type Cb = { (arg0: null, arg1: { filename: string; size: number; }): void; (err: Error): void; };
