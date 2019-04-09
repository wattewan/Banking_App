const MongoClient = require('mongodb').MongoClient;

var _db = null;

module.exports.getDb = function() {
    return _db;
};

module.exports.init = function(callback) {
	const uri = "mongodb+srv://wattewan:8030113Bst@bankingapp-zcncj.mongodb.net/test?retryWrites=true";
	const client = new MongoClient(uri, { useNewUrlParser: true });
    client.connect(err => {
        if (err) {
            return console.log('Unable to connect to DB');
        }
        _db = client.db('test');
        console.log("Successfully connected to MongoDB server");
        // client.close();
    });

};








