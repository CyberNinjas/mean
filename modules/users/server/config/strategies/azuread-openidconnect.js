'use strict';

/**
 * Module dependencies.
 */
var passport = require('passport'),
    OIDCStrategy = require('passport-azure-ad').OIDCStrategy,
    users = require('../../controllers/users.server.controller');

module.exports = function (config) {
  passport.use(new OIDCStrategy({
      callbackURL: ((config.secure && config.secure.ssl === true) ? "https" : "http") + "://" + config.domain + ":" + config.port + config['azuread-openidconnect'].callbackURL,
      clientID: config['azuread-openidconnect'].clientID,
      clientSecret: config['azuread-openidconnect'].clientSecret,
      identityMetadata: 'https://login.microsoftonline.com/common/v2.0/.well-known/openid-configuration',
      responseType: 'id_token',
      responseMode: 'form_post',
      validateIssuer: false,
      redirectUrl: ((config.secure && config.secure.ssl === true) ? "https" : "http") + "://" + config.domain + ":" + config.port + config['azuread-openidconnect'].callbackURL,
      allowHttpForRedirectUrl: (config.secure && config.secure.ssl === true) ? false : true,
      scope: ['profile', 'email']
      },
      function(iss, sub, profile, accessToken, refreshToken, done) {
        console.log(JSON.stringify(profile));
        console.log('Example: Email address we received was: ', profile.email);
        var lastName = profile.displayName.split(/ +/).pop().trim();
        var firstName = profile.displayName.substr(0, profile.displayName.lastIndexof(lastName));
        // Create the user OAuth profile
        var providerUserProfile = {
          firstName: firstName,
          lastName: lastName,
          displayName: profile.displayName,
          email: profile.emails ? profile.emails[0].value : undefined,
          username: profile.username || generateUsername(profile),
          profileImageURL: (profile.id) ? '//graph.facebook.com/' + profile.id + '/picture?type=large' : undefined,
          provider: 'azuread-openidconnect',
          providerIdentifierField: 'id',
          providerData: providerData
        };

        // Save the user OAuth profile
        users.saveOAuthUserProfile(req, providerUserProfile, done);


      }
  ));
};
