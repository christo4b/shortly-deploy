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

  // Links.reset().fetch().then(function(links) {
  //   res.send(200, links.models);
  // })
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

  // new Link({ url: uri }).fetch().then(function(found) {
  //   if (found) {
  //     res.send(200, found.attributes);
  //   } else {
  //     util.getUrlTitle(uri, function(err, title) {
  //       if (err) {
  //         console.log('Error reading URL heading: ', err);
  //         return res.send(404);
  //       }
  //       var newLink = new Link({
  //         url: uri,
  //         title: title,
  //         baseUrl: req.headers.origin
  //       });
  //       newLink.save().then(function(newLink) {
  //         Links.add(newLink);
  //         res.send(200, newLink);
  //       });
  //     });
  //   }
  // });
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

  // new User({ username: username })
  //   .fetch()
  //   .then(function(user) {
  //     if (!user) {
  //       res.redirect('/login');
  //     } else {
  //       user.comparePassword(password, function(match) {
  //         if (match) {
  //           util.createSession(req, res, user);
  //         } else {
  //           res.redirect('/login');
  //         }
  //       })
  //     }
  // });
}; // end loginUser

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

  // new User({ username: username })
  //   .fetch()
  //   .then(function(user) {
  //     if (!user) {
  //       var newUser = new User({
  //         username: username,
  //         password: password
  //       });
  //       newUser.save()
  //         .then(function(newUser) {
  //           Users.add(newUser);
  //           util.createSession(req, res, newUser);
  //         });
  //     } else {
  //       console.log('Account already exists');
  //       res.redirect('/signup');
  //     }
  //   });
}; // end signupUser

exports.navToLink = function(req, res) {

  Link.findOne( {code: req.params[0] }, function( err, foundLink ) {
    if( err ) {
      throw err;
    } else if ( !foundLink ) {
      res.redirect( '/' );
    } else {
      console.log( "Found Link" , foundLink );
      /* 
      found link is coming back without any url???

      weird.

      */
      foundLink.update( { visits: foundLink.visits + 1 }, function( err, updatedLink ) { // working under assumption that foundLink is a mongoose document and sets self to query
        if( err ) {
          throw err;
        } else {
          console.log( "Updated Link",  updatedLink );
          res.redirect( foundLink.url );
        }
      } );
    }
  } );
  // new Link({ code: req.params[0] }).fetch().then(function(link) {
  //   if (!link) {
  //     res.redirect('/');
  //   } else {
  //     link.set({ visits: link.get('visits') + 1 })
  //       .save()
  //       .then(function() {
  //         return res.redirect(link.get('url'));
  //       });
  //   }
  // });
};