import createError from 'http-errors';
import express, { json, urlencoded } from 'express';
import { URL } from 'url';
import path from 'path';
import fs from 'fs';
import FileStreamRotator from 'file-stream-rotator';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import Debug from 'debug';
import dotenv from 'dotenv';

dotenv.config();

import indexRouter from './routes/index.js';
// import usersRouter from './routes/users.js';
import notesRouter from './routes/notes.js';

let accessLogStream;
const error = Debug('notes-app:error');

process.on('uncaughtException', (err) => {
  error(`Oops! An unexpected error occurred - ${err.stack || err}`);
})

if (process.env.REQUEST_LOG_FILE) {
  let logDirectory = path.dirname(process.env.REQUEST_LOG_FILE);
  fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);
  accessLogStream = FileStreamRotator.getStream({
    filename: process.env.REQUEST_LOG_FILE,
    frequency: 'daily',
    verbose: false,
  });
}

const viewsDirPath = new URL('./views', import.meta.url).pathname;
const publicDirPath = new URL('./public', import.meta.url).pathname;
const bootstrapPath = new URL(
  './bower_components/bootstrap/dist',
  import.meta.url,
).pathname;
const jqueryPath = new URL('./bower_components/jquery/dist', import.meta.url)
  .pathname;

const app = express();

// view engine setup
app.set('views', viewsDirPath);
app.set('view engine', 'ejs');

app.use(
  logger(process.env.REQUEST_LOG_FORMAT || 'dev', {
    stream: accessLogStream ? accessLogStream : process.stdout,
  }),
);
app.use(json());
app.use(urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(publicDirPath));
app.use('/vendor/bootstrap', express.static(bootstrapPath));
app.use('/vendor/jquery', express.static(jqueryPath));

app.use('/', indexRouter);
// app.use('/users', usersRouter);
app.use('/notes', notesRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // provide error debugging only in development
  if (req.app.get('env') === 'development') {
    error(`${err.status || 500} ${err.message}`)
  }

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

export default app;

