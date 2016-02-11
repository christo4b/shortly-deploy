var mongoose = require('mongoose');

var port = process.env.PORT || 8000;
var dbUri = process.env.MONGOLAB_URI || 'mongodb://localhost/shortly';

mongoose.connect(dbUri);

module.exports = mongoose;
