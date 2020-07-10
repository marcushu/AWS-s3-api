//
//  Set up Passport authorization with user/password verification.
//  Connection to a users database is provided by userdb.js.
//
/////////////////////////////////////////////////////////////////


const LocalStrategy = require('passport-local').Strategy;
const userdb = require('./userdb.js')


module.exports = passport => {

  //  The passport strategy we will be using.
  //
  passport.use('login-local', new LocalStrategy({
    usernameField: 'user',
    passwordField: 'passwd'
  }, (user, password, done) => {
    userdb.passWordCorrect(user, password)
      .then(verified => {
        if (verified) return done(null, user);

        else done(null, false);
      })
  }
  ))


  //  Authorization middleware
  //
  passport.loggedIn = () => {
    return (req, res, next) => {
      if (req.isAuthenticated()) return next();

      else res.redirect('/unauthorized');
    }
  }


  //  serialization
  //
  passport.serializeUser((user, done) => done(null, user));
  passport.deserializeUser((user, done) => done(null, user));

}
