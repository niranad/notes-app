import { Router } from 'express';
import * as NoteModel1 from '../models/notes-memory.js';
import * as NoteModel2 from '../models/notes-fs.js';
import path from 'path';
import Debug from 'debug';
import dotenv from 'dotenv';

dotenv.config();

const router = Router();
const NoteModel = process.env.NOTES_MODEL ? NoteModel2 : NoteModel1;

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
            return { key: note.key, title: note.title };
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

