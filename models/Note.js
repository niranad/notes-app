export default class Note {
  constructor(notekey, title, body) {
    this.notekey = notekey;
    this.title = title;
    this.body = body;
  }

  static fromJSON(json) {
    const data = JSON.parse(json);
    const note = new Note(data.notekey, data.title, data.body);
    return note;
  }

  get JSON() {
    return JSON.stringify({
      notekey: this.notekey,
      title: this.title,
      body: this.body,
    });
  }
}

