import { Router } from 'express';
import {
  create,
  read,
  update,
  destroy,
  keylist,
  count,
} from '../models/notes-memory.js';

const router = Router();

/* GET home page. */
router.get('/', (req, res, next) => {
  keylist()
    .then((keylist) => {
      const keyPromises = [];
      for (let key of keylist) {
        keyPromises.push(
          read(key).then((note) => {
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

