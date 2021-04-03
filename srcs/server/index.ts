import express from 'express';
import cookieParser from 'cookie-parser';

const app = express();

app.use(cookieParser())

app.listen(3000, () => { console.log('Server UP !');});