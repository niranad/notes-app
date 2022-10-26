import {
  access,
  constants,
  readFile,
  readdir,
  writeFile,
  unlink,
  mkdir,
} from 'fs';
import path from 'path';
import util from 'util';
import Debug from 'debug';
import Note from './Note.js';
import dotenv from 'dotenv';

dotenv.config();

const log = Debug('notes-app:fs-model');
const error = Debug('notes-app:error');

const notesDir = () => {
  const dir = process.env.NOTES_FS_DIR;
  return new Promise((resolve, reject) => {
    access(dir, constants.F_OK, (err) => {
      if (err) {
        return mkdir(dir, (err) => {
          if (err) {
            error(`Failed to create notes directory - ${err}`);
            return reject(err);
          }
          resolve(dir);
        });
      }
      resolve(dir);
    });
  });
};

const filePath = (notesdir, key) => {
  return path.join(notesdir, key + '.json');
};

const readJSON = (notesdir, key) => {
  const readFrom = filePath(notesdir, key);
  return new Promise((resolve, reject) => {
    readFile(readFrom, 'utf8', (err, data) => {
      if (err) {
        error(`Failed to read file '${readFrom}' - ${err}`);
        return reject(err);
      }
      log('readJSON ' + data);
      resolve(Note.fromJSON(data));
    });
  });
};

export const create = (key, title, body) => {
  return notesDir().then((notesdir) => {
    let note = new Note(key, title, body);
    const writeTo = filePath(notesdir, key);
    const writeJSON = note.JSON;
    log(`WRITE ${writeTo + ' ' + writeJSON}`);
    return new Promise((resolve, reject) => {
      writeFile(writeTo, writeJSON, 'utf8', (err) => {
        if (err) {
          error(`Failed to write to file '${writeTo}' - ${err}`);
          return reject(err);
        }
        resolve(note);
      });
    });
  });
};

export const update = create;

export const read = (key) => {
  return notesDir().then((notesdir) => {
    return readJSON(notesdir, key).then((note) => {
      log(`READ ${notesdir + '/' + key + ' ' + util.inspect(note)}`);
      return note;
    });
  });
};

export const destroy = (key) => {
  return notesDir().then((notesdir) => {
    return new Promise((resolve, reject) => {
      unlink(filePath(notesdir, key), (err) => {
        if (err) {
          error(
            `Failed to delete file '${notesdir + '/' + key + '.json'} - ${err}`,
          );
          return reject(err);
        }
        resolve();
      });
    });
  });
};

export const keylist = () => {
  return notesDir()
    .then((notesdir) => {
      return new Promise((resolve, reject) => {
        readdir(notesdir, (err, filez) => {
          if (err) {
            error(`Failed to read directory '${notesdir}' - ${err}`);
            return reject(err);
          }
          if (!filez) filez = [];
          resolve({ notesdir, filez });
        });
      });
    })
    .then((data) => {
      log(
        `keylist dir=${data.notesdir + ' files=' + util.inspect(data.filez)}`,
      );
      let notes = data.filez.map((fname) => {
        let key = path.basename(fname, '.json');
        log(`About to READ ${key}`);
        return readJSON(data.notesdir, key).then((note) => note.key);
      });
      return Promise.all(notes);
    });
};

export const count = () => {
  return notesDir().then((notesdir) => {
    return new Promise((resolve, reject) => {
      readdir(notesdir, (err, filez) => {
        if (err) return reject(err);
        resolve(filez.length);
      });
    });
  });
};

