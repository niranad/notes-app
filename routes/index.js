import { Router } from 'express';
import * as InMemModel from '../models/notes-memory.js';
import * as FSModel from '../models/notes-fs.js';
import * as LevelupModel from '../models/notes-levelup.js';
import * as SQLite3Model from '../models/notes-sqlite3.js';
import * as SequelizeModel from '../models/notes-sequelize.js';
import * as MongooseModel from '../models/notes-mongoose.js';
import Debug from 'debug';
import dotenv from 'dotenv';

dotenv.config();
const { NOTES_MODEL } = process.env;

const router = Router();
const NoteModel =
  NOTES_MODEL === 'models/notes-levelup'
    ? LevelupModel
    : NOTES_MODEL === 'models/notes-fs'
    ? FSModel
    : NOTES_MODEL === 'models/notes-sqlite3'
    ? SQLite3Model
    : NOTES_MODEL === 'models/notes-sequelize'
    ? SequelizeModel
    : NOTES_MODEL === 'models/notes-mongoose'
    ? MongooseModel
    : InMemModel;

const log = Debug('notes-app:routes');
const error = Debug('notes-app:error');

/* GET home page. */
router.get('/', (req, res, next) => {
  NoteModel.keylist()
    .then((keylist) => {
      const keyPromises = [];
      for (let key of keylist) {
        keyPromises.push(
          NoteModel.read(key).then((note) => {
            return { key: note.notekey, title: note.title };
          }),
        );
      }
      return Promise.all(keyPromises);
    })
    .then((notelist) => {
      res.render('index', {
        title: 'Notes',
        notelist,
        breadcrumbs: [{ href: '/', text: 'Home' }],
      });
    })
    .catch((err) => {
      next(err);
    });
});

export default router;

