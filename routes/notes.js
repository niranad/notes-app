import { Router } from 'express';
import Debug from 'debug';
import dotenv from 'dotenv';
import { ensureAuthenticated } from './users.js'; 


dotenv.config();

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

const router = Router();

// ADD Note
router.get('/add', ensureAuthenticated, (req, res, next) => {
  res.render('noteedit', {
    title: 'Add a Note',
    docreate: true,
    notekey: '',
    note: undefined,
    user: req.user ? req.user : undefined,
    breadcrumbs: [
      { href: '/', text: 'Home' },
      { active: true, text: 'Add Note' },
    ],
    hideAddNote: true,
  });
});

router.post('/save', ensureAuthenticated, (req, res, next) => {
  let p;
  let { notekey, title, body, docreate } = req.body;

  if (docreate === 'create') {
    notekey = notekey.replace(/[^0-9a-z-]/gi, '') + '-' + new Date().getTime();
    p = NoteModel.create(notekey, title, body);
  } else {
    p = NoteModel.update(notekey, title, body);
  }
  p.then((note) => {
    res.redirect('/notes/view?key=' + note.notekey);
  }).catch((err) => {
    next(err);
  });
});

router.get('/view', (req, res, next) => {
  NoteModel.read(req.query.key)
    .then((note) => {
      res.render('noteview', {
        title: note ? note.title : '',
        notekey: req.query.key,
        note,
        user: req.user ? req.user : undefined,
        breadcrumbs: [
          { href: '/', text: 'Home' },
          { active: true, text: note.title },
        ],
      });
    })
    .catch((err) => {
      next(err);
    });
});

router.get('/edit', ensureAuthenticated, (req, res, next) => {
  NoteModel.read(req.query.key)
    .then((note) => {
      res.render('noteedit', {
        title: note ? 'Edit ' + note.title : 'Add a Note',
        docreate: false,
        notekey: req.query.key,
        note,
        user: req.user ? req.user : undefined,
        hideAddNote: true,
        breadcrumbs: [
          { href: '/', text: 'Home' },
          { active: true, text: note.title },
        ],
      });
    })
    .catch((err) => {
      next(err);
    });
});

router.get('/destroy', ensureAuthenticated, (req, res, next) => {
  NoteModel.read(req.query.key)
    .then((note) => {
      res.render('notedestroy', {
        title: note ? note.title : '',
        notekey: req.query.key,
        note,
        user: req.user ? req.user : undefined,
        breadcrumbs: [
          { href: '/', text: 'Home' },
          { active: true, text: 'Delete Note' },
        ],
      });
    })
    .catch((err) => {
      next(err);
    });
});

router.post('/destroy/confirm', ensureAuthenticated, (req, res, next) => {
  NoteModel.destroy(req.body.notekey)
    .then(() => {
      setTimeout(() => res.redirect('/'), 1000);
    })
    .catch((err) => {
      next(err);
    });
});

export default router;

