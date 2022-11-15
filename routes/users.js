import { Router } from 'express';
import debug from 'debug';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import passportTwitter from 'passport-twitter';
import dotenv from 'dotenv';

dotenv.config();

const log = debug('notes-app:user-route');
const error = debug('notes-app:error');

const TwitterStrategy = passportTwitter.Strategy;

let UserModel;

(async () => {
  if (process.env.USERS_MODEL) {
    UserModel = await import('../' + process.env.USER_MODEL);
  } else {
    UserModel = await import('../models/users-rest.js');
  }
})();

const router = Router();

export const initPassport = (app) => {
  app.use(passport.initialize());
  app.use(passport.session());
};

export const ensureAuthenticated = (req, res, next) => {
  if (req.user) next();
  else res.redirect('/users/login');
};

router.get('/login', (req, res, next) => {
  res.render('login', {
    title: 'Login to Notes',
    user: req.user,
  });
});

router.post(
  '/login',
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: 'login',
  }),
);

router.get('/logout', (req, res, next) => {
  req.logout();
  res.redirect('/');
});

router.get('/auth/twitter', passport.authenticate('twitter'));

router.get(
  '/auth/twitter/callback',
  passport.authenticate('twitter', {
    successRedirect: '/',
    failureRedirect: '/users/login',
  }),
);

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const check = await UserModel.userPasswordCheck(username, password);
      if (check.check) {
        done(null, { id: check.username, username: check.username });
      } else {
        done(null, false, check.message);
      }
      return check;
    } catch (error) {
      done(error);
    }
  }),
);

passport.use(
  new TwitterStrategy(
    {
      consumerKey: process.env.TWITTER_CONSUMER_KEY,
      consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
      callbackURL: process.env.TWITTER_CALLBACK,
    },
    (accesstoken, refreshToken, profile, done) => {
      UserModel.findOrCreate({
        id: profile.username,
        username: profile.username,
        password: '',
        provider: profile.provider,
        familyName: profile.displayName,
        givenName: '',
        middleName: '',
        photos: profile.photos,
        emails: profile.emails,
      })
        .then((user) => done(null, user))
        .catch((err) => done(err));
    },
  ),
);

passport.serializeUser((user, done) => {
  done(null, user.username);
});

passport.deserializeUser(async (username, done) => {
  try {
    const user = await UserModel.find(username);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

export default router;

