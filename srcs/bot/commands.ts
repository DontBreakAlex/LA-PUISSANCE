import { Goodenough, Rick, Urss } from './simple_mp3';
import { Play } from './player';
import Pause from './pause';
import Skip from './skip';
import Stop from './stop';
import Queue from './queue';
import Service from './service';
import Login from './login';

const commands = [
	new Play(),
	Skip,
	Stop,
	Pause,
	Queue,
	new Rick(),
	new Urss(),
	new Goodenough(),
	Service,
	new Login()
];
export default commands;
