import util from 'util';
import { readFile } from 'fs';
import jsyaml from 'js-yaml';
import Sequelize from 'sequelize';
import Note from './Note.js';
import debug from 'debug';

const log = debug('notes-app:sequelize-model');
const error = debug('notes-app:error');

export const connectDB = () => {
  let SQNote;
  let sequlz;

  if (SQNote) return SQNote.sync();

  return new Promise((resolve, reject) => {
    readFile(process.env.SEQUELIZE_CONNECT, 'utf8', (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  })
    .then((yamltext) => {
      return jsyaml.load(yamltext, 'utf8');
    })
    .then((params) => {
      sequlz = new Sequelize(
        params.dbname,
        params.username,
        params.password,
        params.params,
      );
      SQNote = sequlz.define('Note', {
        notekey: {
          type: Sequelize.STRING,
          primaryKey: true,
          unique: true,
        },
        title: Sequelize.STRING,
        body: Sequelize.TEXT,
      });
      return SQNote.sync();
    });
};

export const create = (key, title, body) => {
  return connectDB().then((SQNote) => {
    return SQNote.create({
      notekey: key,
      title,
      body,
    });
  });
};

export const update = (key, title, body) => {
  return connectDB().then((SQNote) => {
    return SQNote.update({ title, body }, { where: { notekey: key } })
      .then(() => {
        return new Note(key, title, body);
      })
      .catch((err) => {
        error(`UPDATE failed for note with key=${key}`);
      });
  });
};

export const read = (key) => {
  return connectDB().then((SQNote) => {
    return SQNote.findOne({ where: { notekey: key } }).then((note) => {
      if (!note) {
        error(`No note found for key ${key}`);
      } else {
        return new Note(note.notekey, note.title, note.body);
      }
    });
  });
};

export const destroy = (key) => {
  return connectDB().then((SQNote) => {
    return SQNote.findOne({ where: { notekey: key } }).then((note) => {
      note.destroy();
    });
  });
};

export const keylist = () => {
  return connectDB().then((SQNote) => {
    return SQNote.findAll({ attributes: ['notekey'] }).then((notes) => {
      return notes.map((note) => note?.notekey);
    });
  });
};

export const count = () => {
  return connectDB().then((SQNote) => {
    return SQNote.count().then((count) => {
      log(`COUNT ${count}`);
      return count;
    });
  });
};

