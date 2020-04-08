import Calc from './calc';
import { Urss, Rick } from './simple_mp3';
import { Play, Skip, Stop } from './player';
import Pause from './pause';

export default [
	new Play(),
	new Skip(),
	new Stop(),
	new Calc(),
	new Rick(),
	new Urss(),
	new Pause()
]
