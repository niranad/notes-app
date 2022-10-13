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

export default router;

