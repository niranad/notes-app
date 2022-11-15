import { Router } from 'express';
import Debug from 'debug';
import dotenv from 'dotenv';

dotenv.config();

const router = Router();

let NoteModel;

(async () => {
  if (process.env.NOTES_MODEL) {
    NoteModel = await import('../' + process.env.NOTES_MODEL);
  } else {
    NoteModel = await import('../models/notes-memory.js');
  }
})();

const log = Debug('notes-app:routes');
const error = Debug('notes-app:error');

/* GET home page. */
router.get('/', (req, res, next) => {
  NoteModel.keylist()
    .then((keylist) => {
      const keyPromises = keylist.map((key) => {
        return NoteModel.read(key).then((note) => {
          return { key: note.notekey, title: note.title };
        });
      });
      return Promise.all(keyPromises);
    })
    .then((notelist) => {
      res.render('index', {
        title: 'Notes',
        notelist,
        user: req.user ? req.user : undefined,
        breadcrumbs: [{ href: '/', text: 'Home' }],
      });
    })
    .catch((err) => {
      error(`Failed to list notes: ${err.stack}`);
      next(err);
    });
});

export default router;

