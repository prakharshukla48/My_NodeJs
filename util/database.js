const mongodb = require('mongodb');

const MongoClient = mongodb.MongoClient;

let _db;


const mongoConnect = (callback) => {
  MongoClient.connect('mongodb+srv://test-user:Ayush@123@cluster0-zu4ux.mongodb.net/test?retryWrites=true&w=majority&authSource=admin').then(client => {
    console.log('Connected!');
    _db = client.db();
    callback();
  }).catch(err => {
    console.log("not connected", err);
    throw err;
  });
};

const getDb = () => {
  if (_db){
    return _db;
  }
  throw 'No database found!';
}

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;