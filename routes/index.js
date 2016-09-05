var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;


router.get('/', function (req, res, next) {

    MongoClient.connect('mongodb://127.0.0.1:27017/demoBMS', function (err, db) {

        var collection = db.collection('fisiere');

        collection.find().toArray().then(function (docs) {
            res.render('main',
                {
                    title:'Blue Mind Soft',
                    fisiere: docs
                });
            db.close();
        });
    });
});


module.exports = router;
