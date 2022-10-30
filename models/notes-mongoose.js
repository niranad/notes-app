import * as mongo from 'mongoose';
import debug from 'debug';
import Note from './Note.js';

const { Schema, connect, model, connections } = mongo;
const log = debug('notes-app:mongodb-model');
const error = debug('notes-app:mongodb-error');

const NoteSchema = new Schema({
  notekey: {
    type: String,
    required: true,
    trim: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  body: {
    type: String,
    required: true,
    trim: true,
  },
});

const NoteModel = model('Note', NoteSchema);
const dbOptions = {
  autoIndex: false,
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  heartbeatFrequencyMS: 3000,
  socketTimeoutMS: 1000,
  family: 4,
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

const mongo_uri = 'mongodb://localhost:27017/notes-app';
let db;

export const connectDB = () => {
  return new Promise((resolve, reject) => {
    if (db) return resolve();
    connect(mongo_uri, dbOptions)
      .then(() => {
        log(`Connected successfully to MongoDB Server`);
        connections[0].on('error', (err) => {
          log(`Error after initial connection: ${err}`);
        });
        connections[0].on('disconnected', () => {
          log('MongoDB disconnected. Will reconnect on next operation');
          db = false;
        });
        connections[0].on('heartbeat', () => {
          log('Mongodb server connection is active.');
        });
        db = true;
        resolve();
      })
      .catch((err) => {
        error(`MongoDB Connection Error: ${err.message}`);
        reject(err);
      });
  });
};

export const create = (key, title, body) => {
  return connectDB().then(() => {
    return NoteModel.create({ notekey: key, title, body });
  });
};

export const read = (key) => {
  return connectDB().then(() => {
    return NoteModel.findOne({ notekey: key })
      .then((doc) => {
        return new Note(doc.notekey, doc.title, doc.body);
      })
      .catch((err) => {
        error(`Document 'findOne' error: ${err.message}`);
      });
  });
};

export const update = (key, title, body) => {
  return connectDB().then(() => {
    return NoteModel.findOneAndUpdate(
      { notekey: key },
      { title, body },
      { new: true, runValidators: true },
    )
      .then((doc) => {
        return new Note(doc.notekey, doc.title, doc.body);
      })
      .catch((err) => error(`Document 'updateOne' error: ${err}`));
  });
};

export const destroy = (key) => {
  return connectDB().then(() => {
    return NoteModel.findOneAndDelete({ notekey: key })
      .then(() => log(`Document deleted successfully`))
      .catch((err) => error(`Document delete failed: ${err}`));
  });
};

export const keylist = () => {
  return connectDB().then(() => {
    return NoteModel.find().then((docs) => {
      return docs.map((note) => note.notekey);
    });
  });
};

export const count = () => {
  return connectDB().then(() => {
    return NoteModel.countDocuments();
  });
};

