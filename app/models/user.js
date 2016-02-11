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

  User.getHashedPassword( userID, function( password ) {
    bcrypt.compare(attemptedPassword, password, function(err, isMatch) {
      callback(isMatch);
    } );
  } );
};

userSchema.pre( 'save', function( next ) {
  var cipher = Promise.promisify( bcrypt.hash );
  return cipher( this.password, null, null ).bind( this )
    .then( function( hash ) {
      this.password = hash;
      next();
    } );
} );

module.exports = User;
