var request = require('request');
var crypto = require('crypto');
var bcrypt = require('bcrypt-nodejs');
var util = require('../lib/utility');

var db = require('../app/config');
var User = require('../app/models/user');
var Link = require('../app/models/link');


exports.renderIndex = function(req, res) {
  res.render('index');
};

exports.signupUserForm = function(req, res) {
  res.render('signup');
};

exports.loginUserForm = function(req, res) {
  res.render('login');
};

exports.logoutUser = function(req, res) {
  req.session.destroy(function() {
    res.redirect('/login');
  });
};

exports.fetchLinks = function(req, res) {
  Link.find( {}, function( err, foundThings ) {
    if( err ) {
      throw err;
    }
    else res.send( 200, foundThings );
  } );

};

exports.saveLink = function(req, res) {

  var uri = req.body.url;

  if (!util.isValidUrl(uri)) {
    console.log('Not a valid url: ', uri);
    return res.send(404);
  }

  // Check to see if link already exists
  Link.findOne( {url: uri }, function( err, foundLink ) {
    if( err ) {
      throw err;
    }
    if( foundLink ) {
      // If it does, send the link to the client
      res.send( 200, foundLink );
    } else {
      // Get the title of the webpage from the internet
      util.getUrlTitle(uri, function(err, title) {
        if (err) {
          console.log('Error reading URL heading: ', err);
          return res.send(404);
        }
        Link.create( { url: uri, title: title, baseUrl: req.headers.origin }, function( err, createdLink ) {
          res.send( 200, createdLink );
        } );
      });
    }
  } ); 
};

exports.loginUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  User.findOne( {username: username}, function( err, foundUser ) {
    if( !foundUser ) { // user not found
      console.log("redirect in !founduser");
      res.redirect( '/login' );
    } else { // user exists, let's compare passwords.
      User.comparePassword( foundUser.id, password, function( match ) {
        if( match ) { // passwords match
          util.createSession( req, res, foundUser );
        } else { // passwords don't match
        console.log("redirect within ELSE statement")
          res.redirect('/login');
        }
      } );
    }
  } );
}; 

exports.signupUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;
  
  User.findOne( {username: username}, function( err, foundUser ) {
    if( !foundUser ) { // assume that if a user isn't found this doesn't exist?
      User.create( req.body, function( err, newUser ) {
        // newUser is created, let's hash that password!
          util.createSession( req, res, newUser );
        } );
    } else {
      console.log('Account already exists');
      res.redirect('/signup');
    }
  } );
};

exports.navToLink = function(req, res) {

  Link.findOne( {code: req.params[0] }, function( err, foundLink ) {
    if( err ) {
      throw err;
    } else if ( !foundLink ) {
      res.redirect( '/' );
    } else {
      console.log( "Found Link" , foundLink );

      foundLink.update( { visits: foundLink.visits + 1 }, function( err, updatedLink ) {
        if( err ) {
          throw err;
        } else {
          console.log( "Updated Link",  updatedLink );
          res.redirect( foundLink.url );
        }
      } );
    }
  } );
};