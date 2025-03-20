const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/user'); // Ensure you have a User model
const jwt = require('jsonwebtoken');


passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ email: profile.emails[0].value });

        if (!user) {
          user = new User({
            username: profile.displayName,
            email: profile.emails[0].value,
            profileImage: profile.photos[0].value,
            googleId: profile.id,
          });
          await user.save();
        }

        // Generate JWT access & refresh tokens
        const accessTokenJwt = jwt.sign(
          { userId: user._id },
          process.env.JWT_SECRET,
          { expiresIn: '15m' }
        );

        const refreshTokenJwt = jwt.sign(
          { userId: user._id },
          process.env.JWT_SECRET,
          { expiresIn: '7d' }
        );

        user.refreshToken = refreshTokenJwt;
        await user.save();

        return done(null, { accessToken: accessTokenJwt, refreshToken: refreshTokenJwt });
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});
