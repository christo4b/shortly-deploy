var db = require('../config');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');

var userSchema = new db.Schema( {
  username: {
    type: String,
    unique: true
  },
  password: String
} );

var User = db.model( 'User', userSchema );

User.getHashedPassword = function( userID, callback ) {
  User.findById( userID, function( err, user ) {
    if( err ) {
      throw err;
    } else {
      callback( user.password );
    }
  } );
};

User.comparePassword = function( userID, attemptedPassword, callback ) {
  console.log("Within comparepassword: userID", userID);
  console.log("Within comparepassword: attpass", attemptedPassword);
  User.getHashedPassword( userID, function( password ) {
    console.log("withingetHashedPass call, password is:", password);
    bcrypt.compare(attemptedPassword, password, function(err, isMatch) {
      callback(isMatch);
    } );
  } );
};

// User.hashPassword = function( userID, callback ) {
//   User.findById( userID, function( err, user ) {
//     if( err ) {
//       throw err;
//     }
//     var cipher = Promise.promisify(bcrypt.hash);
//     return cipher( user.password, null, null )
//       .then( function( hash ) {
//         user.password = hash;
//         user.save( function( err ) {
//           if( err ) {
//             throw err;
//           } else {
//             callback();
//           }
//         } );
//       });
//   } );
// };

userSchema.pre( 'save', function( next ) {
  var cipher = Promise.promisify( bcrypt.hash );
  return cipher( this.password, null, null ).bind( this )
    .then( function( hash ) {
      this.password = hash;
      next();
    } );
} );

module.exports = User;
