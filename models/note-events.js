import { EventEmitter } from 'events';


class NotesEmitter extends EventEmitter {}

export const NotesEmitterInstance = new NotesEmitter();
export const noteCreated = (note) => {
  NotesEmitterInstance.emit('notecreated', note);
}
export const noteUpdate = (note) => {
  NotesEmitterInstance.emit('noteupdate', note);
}
export const noteDestroy = (data) => {
  NotesEmitterInstance.emit('notedestroy', data);
}



