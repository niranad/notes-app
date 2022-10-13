import createError from 'http-errors';
import express, { json, urlencoded } from 'express';
import { URL } from 'url';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import dotenv from 'dotenv';

dotenv.config();

import indexRouter from './routes/index.js';
// import usersRouter from './routes/users.js';
import notesRouter from './routes/notes.js';

const viewsDirPath = new URL('./views', import.meta.url).pathname;
const publicDirPath = new URL('./public', import.meta.url).pathname;

const app = express();

// view engine setup
app.set('views', viewsDirPath);
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(json());
app.use(urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(publicDirPath));

app.use('/', indexRouter);
// app.use('/users', usersRouter);
app.use('/notes', notesRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

export default app;
