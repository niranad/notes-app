import Note from './Note.js';

const notes = [];

let create, update, read, destroy, keylist, count;

create = update = (key, title, body) => {
  return new Promise((resolve, reject) => {
    notes[key] = new Note(key, title, body);
    resolve(notes[key]);
  });
};

read = (key) => {
  return new Promise((resolve, reject) => {
    if (notes[key]) resolve(notes[key]);
    else reject(`Note ${key} does not exist`);
  });
};

destroy = (key) => {
  return new Promise((resolve, reject) => {
    if (notes[key]) {
      delete notes[key];
      resolve();
    } else reject(`Note ${key} does not exist`);
  });
};

keylist = () =>
  new Promise((resolve, reject) => {
    resolve(Object.keys(notes));
  });

count = () =>
  new Promise((resolve, reject) => {
    resolve(notes.length);
  });

export { create, update, read, destroy, keylist, count };

