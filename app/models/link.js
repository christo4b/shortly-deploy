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

// var Link = db.Model.extend({
//   tableName: 'urls',
//   hasTimestamps: true,
//   defaults: {
//     visits: 0
//   },
//   initialize: function() {
//     this.on('creating', function(model, attrs, options) {
//       var shasum = crypto.createHash('sha1');
//       shasum.update(model.get('url'));
//       model.set('code', shasum.digest('hex').slice(0, 5));
//     });
//   }
// });

module.exports = Link;
