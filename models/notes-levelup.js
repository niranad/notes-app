import util from 'util';
import levelup from 'levelup';
import leveldown from 'leveldown';
import encode from 'encoding-down';
import debug from 'debug';
import Note from './Note.js';

const log = debug('notes-app:levelup-model');
const error = debug('notes-app:error');

const db = levelup(
  encode(leveldown(process.env.LEVELUP_DB_LOCATION), {
    valueEncoding: 'json',
  }),
);

export const create = (key, title, body) => {
  let note = new Note(key, title, body);
  return new Promise((resolve, reject) => {
    db.put(key, note, (err) => {
      if (err) reject(err);
      else resolve(note);
    });
  });
};

export const update = create;

export const read = (key) => {
  return new Promise((resolve, reject) => {
    db.get(key, (err, note) => {
      if (err) reject(err);
      else resolve(new Note(note.notekey, note.title, note.body));
    });
  });
};

export const destroy = (key) => {
  return new Promise((resolve, reject) => {
    db.del(key, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
};

export const keylist = () => {
  let keyz = [];
  return new Promise((resolve, reject) => {
    db.createKeyStream()
      .on('data', (key) => {
        keyz.push(key);
      })
      .on('error', (err) => reject(err))
      .on('end', () => resolve(keyz));
  });
};

export const count = () => {
  let total = 0;
  return new Promise((resolve, reject) => {
    db.createReadStream()
      .on('data', (data) => total++)
      .on('error', (err) => reject(err))
      .on('end', () => resolve(total));
  });
};

