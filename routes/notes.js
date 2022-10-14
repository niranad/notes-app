import { Router } from 'express';
import util from 'util';
import * as NoteModel from '../models/notes-memory.js';

const router = Router();

// ADD Note
router.get('/add', (req, res, next) => {
  res.render('noteedit', {
    title: 'Add a Note',
    docreate: true,
    notekey: '',
    note: undefined,
    breadcrumbs: [
      { href: '/', text: 'Home'},
      { active: true, text: 'Add Note'}
    ],
    hideAddNote: true,
  });
});

router.post('/save', (req, res, next) => {
  let p;
  if (req.body.docreate === 'create') {
    p = NoteModel.create(req.body.notekey, req.body.title, req.body.body);
  } else {
    p = NoteModel.update(req.body.notekey, req.body.title, req.body.body);
  }
  p.then((note) => {
    res.redirect('/notes/view?key=' + req.body.notekey);
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
        breadcrumbs: [
          { href: '/', text: 'Home'},
          { active: true, text: note.title }
        ]
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
          { active: true, text: note.title }
        ]
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


