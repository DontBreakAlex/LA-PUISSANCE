import Calc from './calc';
import { Goodenough, Rick, Urss } from './simple_mp3';
import { Play } from './player';
import Pause from './pause';
import Skip from './skip';
import Stop from './stop';
import Queue from './queue';
import Service from './service';

export default [
	new Play(),
	Skip,
	Stop,
	Pause,
	Calc,
	Queue,
	new Rick(),
	new Urss(),
	new Goodenough(),
	Service
];
