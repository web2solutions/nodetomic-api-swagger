import passport from 'passport';
import { Strategy as BitbucketStrategy } from 'passport-bitbucket';
import User from '../../api/models/user';
import config from '../../config';

passport.use(new BitbucketStrategy({
  consumerKey: config.oAuth.bitbucket.clientID,
  consumerSecret: config.oAuth.bitbucket.clientSecret,
  callbackURL: config.oAuth.bitbucket.callbackURL
}, (token, tokenSecret, profile, done) => {

  User.findOne({ provider: 'bitbucket', 'social.id': profile.id }).exec().then(user => {

    if (!user) {
      user = new User({
        name: profile.displayName,
        username: profile.username,
        email: profile._json.email || '',
        provider: 'bitbucket',
        photo: profile._json.links.avatar.href,
        'social.id': profile.id,
        'social.info': profile._json
      });
    } else {
      user.social.info = profile._json;
      user.photo = profile._json.links.avatar.href;
    }

    user.lastLogin = Date.now();

    user.save().then(_user => {
      return done(null, _user);
    }).catch(err => done(err));

  }).catch(err => done(err));

}));
