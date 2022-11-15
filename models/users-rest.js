import restify from 'restify-clients';
import debug from 'debug';

const log = debug('notes-app:users-rest');
const error = debug('notes-app:error');

const connectREST = async () => {
  try {
    const client = await new Promise((resolve, reject) => {
      resolve(
        restify.createJsonClient({
          url: process.env.USER_SERVICE_URL,
        }));
    });
    client.basicAuth('notes-app', 'D5FH8ZO-7DE1-9GA4-E853-2IJB190N91PQ');
    return client;
  } catch (error) {
    return new Promise((resolve, reject) => {
      reject(error);
    })
  }
};

export const create = async (
  username,
  password,
  provider,
  familyName,
  givenName,
  middleName,
  emails,
  photos,
) => {
  try {
    const client = await connectREST();
    return await new Promise((resolve, reject) => {
      client.post(
        '/create-user',
        {
          username,
          password,
          provider,
          familyName,
          givenName,
          middleName,
          emails,
          photos,
        },
        (err, req, res, obj) => {
          if (err) return reject(err);
          resolve(obj);
        },
      );
    });
  } catch (err) {
    error(`Could not connect auth service: ${err}`);
    return await new Promise((resolve, reject) => {
      reject(err);
    });
  }
};

export const update = async (username, userData) => {
  try {
    const client = await connectREST();
    return await new Promise((resolve, reject) => {
      client.post(
        '/update-user/' + username,
        userData,
        (err, req, res, obj) => {
          if (err) return reject(err);
          resolve(obj);
        },
      );
    });
  } catch (error) {
    return await new Promise((resolve, reject) => {
      reject(error);
    });
  }
};

export const find = async (username) => {
  try {
    const client = await connectREST();
    return await new Promise((resolve, reject) => {
      client.get('/find' + username, (err, req, res, obj) => {
        if (err) return reject(err);
        resolve(obj);
      });
    });
  } catch (error) {
    return await new Promise((resolve, reject) => {
      reject(error);
    });
  }
};

export const userPasswordCheck = async (username, password) => {
  try {
    const client = await connectREST();
    return await new Promise((resolve, reject) => {
      client.post(
        '/passwordCheck',
        { username, password },
        (err, req, res, obj) => {
          if (err) return reject(err);
          resolve(obj);
        },
      );
    });
  } catch (error) {
    return await new Promise((resolve, reject) => {
      reject(error);
    });
  }
};

export const findOrCreate = async (profile) => {
  try {
    const client = await connectREST();
    return new Promise((resolve, reject) => {
      client.post(
        '/find-or-create',
        {
          username: profile.id,
          password: profile.password,
          provider: profile.provider,
          familyName: profile.familyName,
          givenName: profile.givenName,
          middleName: profile.middleName,
          emails: profile.emails,
          photos: profile.photos,
        },
        (err, req, res, obj) => {
          if (err) return reject(err);
          resolve(obj);
        },
      );
    });
    
  } catch (error) {
    return await new Promise((resolve, reject) => {
      reject(error);
    })
  }
};

export const listUsers = async () => {
  try {
    const client = await connectREST();
    return new Promise((resolve, reject) => {
      client.get('/list', (err, req, res, obj) => {
        if (err) return reject(err);
        resolve(obj);
      });
    });
    
  } catch (error) {
    return await new Promise((resolve, reject) => {
      reject(error);
    })
  }
};

