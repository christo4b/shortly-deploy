var db = require('../config');
var crypto = require('crypto');

var sha = function( val ) {
  var shasum = crypto.createHash( 'sha1' );
  shasum.update( val ); // ????
  this.code = shasum.digest( 'hex' ).slice( 0, 5 );
  return val;
};

var linkSchema = new db.Schema( {
  url: {
    type: String, 
    set: sha
  },
  baseUrl: String,
  code: String,
  title: String,
  visits: {
    type: Number,
    default: 0
  }
} );

var Link = db.model( 'Url', linkSchema );

module.exports = Link;
