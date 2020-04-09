import Calc from './calc';
import { Urss, Rick } from './simple_mp3';
import { Play } from './player';
import Pause from './pause';
import Skip from './skip';
import Stop from './stop';
import Queue from './queue';

export default [
	new Play(),
	Skip,
	Stop,
	Pause,
	Calc,
	Queue,
	new Rick(),
	new Urss()
]
