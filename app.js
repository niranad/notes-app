#!/usr/bin/env node

import createError from 'http-errors';
import express, { json, urlencoded } from 'express';
import { URL } from 'url';
import path from 'path';
import fs from 'fs';
import FileStreamRotator from 'file-stream-rotator';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import debug from 'debug';
import dotenv from 'dotenv';
import indexRouter from './routes/index.js';
import usersRouter, { initPassport } from './routes/users.js';
import notesRouter from './routes/notes.js';
import session from 'express-session';
import filestore from 'session-file-store';
import socketio from 'socket.io';
import passportSocketio from 'passport.socketio';
import http from 'http';

dotenv.config();

const { PORT, REQUEST_LOG_FILE, SESSION_SECRET, SESSION_COOKIE } = process.env;

let accessLogStream;

const log = debug('notes-app:server');
const error = debug('notes-app:error');

const FileStore = filestore(session);
const sessionStore = new FileStore({ path: 'sessions' });

process.on('uncaughtException', (err) => {
  error(`Oops! An unexpected error occurred - ${err.stack || err}`);
});

if (REQUEST_LOG_FILE) {
  let logDirectory = path.dirname(REQUEST_LOG_FILE);
  fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);
  accessLogStream = FileStreamRotator.getStream({
    filename: REQUEST_LOG_FILE,
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
const server = http.createServer(app);
const io = socketio(server);

io.use(
  passportSocketio.authorize({
    cookieParser,
    key: SESSION_COOKIE,
    secret: SESSION_SECRET,
    store: sessionStore,
  }),
);

const port = normalizePort(PORT);
app.set('port', port);

// view engine setup
app.set('views', viewsDirPath);
app.set('view engine', 'ejs');

app.use(
  logger(process.env.REQUEST_LOG_FORMAT || 'dev', {
    stream: accessLogStream ? accessLogStream : process.stdout,
  }),
);

app.use(
  session({
    store: sessionStore,
    secret: SESSION_SECRET,
    key: SESSION_COOKIE,
    resave: true,
    saveUninitialized: true,
  }),
);
initPassport(app);

app.use(json());
app.use(urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(publicDirPath));
app.use('/vendor/bootstrap', express.static(bootstrapPath));
app.use('/vendor/jquery', express.static(jqueryPath));

app.use('/', routes);
app.use('/users', usersRouter);
app.use('/notes', notesRouter);

routes.socketio(io);
// notesRouter.socketio(io);


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
    error(`${err.status || 500} ${err.message}`);
  }

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  const addr = server.address();
  const bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
  log('Listening on ' + bind);
}




