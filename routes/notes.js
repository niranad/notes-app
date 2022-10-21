import { Router } from 'express';
import * as NoteModel1 from '../models/notes-memory.js';
import * as NoteModel2 from '../models/notes-fs.js';
import path from 'path';
import Debug from 'debug';
import dotenv from 'dotenv';

dotenv.config();

const NoteModel = process.env.NOTES_MODEL ? NoteModel2 : NoteModel1;
const log = Debug('notes-app:routes');
const error = Debug('notes-app:error');

const router = Router();

// ADD Note
router.get('/add', (req, res, next) => {
  res.render('noteedit', {
    title: 'Add a Note',
    docreate: true,
    notekey: '',
    note: undefined,
    breadcrumbs: [
      { href: '/', text: 'Home' },
      { active: true, text: 'Add Note' },
    ],
    hideAddNote: true,
  });
});

router.post('/save', (req, res, next) => {
  let p;
  let {notekey, title, body, docreate} = req.body;
  notekey = notekey.replace(/[^0-9a-z-]/gi, '') + '-' + new Date().getTime();

  if (docreate === 'create') {
    p = NoteModel.create(notekey, title, body);
  } else {
    p = NoteModel.update(notekey, title, body);
  }
  p.then((note) => {
    res.redirect('/notes/view?key=' + notekey);
  }).catch((err) => {
    next(err);
  });
});

router.get('/view', (req, res, next) => {
  console.log(req.query);
  NoteModel.read(req.query.key)
    .then((note) => {
      res.render('noteview', {
        title: note ? note.title : '',
        notekey: req.query.key,
        note,
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

router.get('/edit', (req, res, next) => {
  NoteModel.read(req.query.key)
    .then((note) => {
      res.render('noteedit', {
        title: note ? 'Edit ' + note.title : 'Add a Note',
        docreate: false,
        notekey: req.query.key,
        note,
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

router.get('/destroy', (req, res, next) => {
  NoteModel.read(req.query.key)
    .then((note) => {
      res.render('notedestroy', {
        title: note ? note.title : '',
        notekey: req.query.key,
        note,
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

router.post('/destroy/confirm', (req, res, next) => {
  NoteModel.destroy(req.body.notekey)
    .then(() => {
      res.redirect('/');
    })
    .catch((err) => {
      next(err);
    });
});

export default router;

