import sqlite3 from 'sqlite3';
import debug from 'debug';
import Note from './Note.js';
import dotenv from 'dotenv';
import util from 'util';
import { readFile } from 'fs';
import { join } from 'path';

dotenv.config();

const log = debug('notes-app:sqlite3-model');
const error = debug('notes-app:error');

sqlite3.verbose();
let db;

export const connectDB = () => {
  return new Promise((resolve, reject) => {
    if (db) return resolve();
    let schema;
    let dbfile = process.env.SQLITE_FILE;

    db = new sqlite3.Database(
      dbfile,
      sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
      (err) => {
        if (err) reject(err);
      },
    );

    readFile(
      join(process.cwd(), 'models/schema-sqlite3.sql'),
      'utf8',
      (err, data) => {
        if (err) {
          error('Failed to read sqlite3 schema file');
          reject(err);
        } else {
          schema = data.replace(/[\n\r]/g, '');
          db.run(schema, (err) => {
            if (err) return reject(err);
            log('Opened Sqlite3 for read and write operations');
            resolve();
          });
        }
      },
    );
  });
};

export const create = (key, title, body) => {
  return connectDB().then(() => {
    let note = new Note(key, title, body);
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO notes (notekey, title, body) VALUES(?, ?, ?);',
        [key, title, body],
        (err) => {
          if (err) reject(err);
          else {
            log('CREATE ' + util.inspect(note));
            resolve(note);
          }
        },
      );
    });
  });
};

export const update = (key, title, body) => {
  return connectDB().then(() => {
    return new Promise((resolve, reject) => {
      db.run(
        'UPDATE notes SET title=?, body=? WHERE notekey=?',
        [title, body, key],
        (err) => {
          if (err) {
            error(`Failed to UPDATE note where key=${key}`);
            reject(err);
          } else {
            log(`UPDATE note where key=${key}`);
            db.each(
              'SELECT * FROM notes WHERE notekey=?',
              [key],
              (err, row) => {
                if (err) return reject(err);
                resolve(row);
              },
            );
          }
        },
      );
    });
  });
};

export const read = (key) => {
  return connectDB().then(() => {
    return new Promise((resolve, reject) => {
      db.each('SELECT * FROM notes WHERE notekey=?', [key], (err, row) => {
        if (err) {
          error(`Failed to SELECT note with key=${key}`);
          reject(err);
        } else {
          log('SELECT note with key=$');
          resolve(row);
        }
      });
    });
  });
};

export const destroy = (key) => {
  return connectDB().then(() => {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM notes WHERE notekey=?', [key], (err) => {
        if (err) {
          error(`Failed to DELETE note with key=${key}`);
          reject(err);
        } else {
          log(`DELETE note where key=${key}`);
          resolve();
        }
      });
    });
  });
};

export const keylist = () => {
  return connectDB().then(() => {
    return new Promise((resolve, reject) => {
      db.all('SELECT notekey FROM notes', (err, rows) => {
        if (err) return reject(err);
        let keys = rows.map((obj) => obj.notekey);
        resolve(keys);
      });
    });
  });
};

export const count = () => {
  return connectDB().then(() => {
    return new Promise((resolve, reject) => {
      db.all('SELECT notekey FROM notes', (err, rows) => {
        if (err) return reject(err);
        resolve(rows.length);
      });
    });
  });
};

