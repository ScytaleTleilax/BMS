var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;


/* GET home page. */
router.get('/', function (req, res, next) {

    res.render('index',
        {
            title: 'BlueMind Software',
            jQ: "//ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js",
            BootstrapCSS: "http://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap.min.css",
            BootstrapJS: "//maxcdn.bootstrapcdn.com/bootstrap/3.3.1/js/bootstrap.min.js"
        });
});

router.get('/upload_fisier', function (req, res, next) {

    res.render('upload_fisier',
        {
            title: 'BlueMind Software',
            jQ: "//ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js",
            BootstrapCSS: "http://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap.min.css",
            BootstrapJS: "//maxcdn.bootstrapcdn.com/bootstrap/3.3.1/js/bootstrap.min.js"
        });
});

router.get('/tabel_fisiere', function (req, res, next) {

    MongoClient.connect('mongodb://127.0.0.1:27017/demoBMS', function (err, db) {

        var collection = db.collection('fisiere');

        collection.find().toArray().then(function (docs) {
            res.render('tabel_fisiere',
                {
                    fisiere: docs,
                    title: 'BlueMind Software',
                    jQ: "//ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js",
                    BootstrapCSS: "http://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap.min.css",
                    BootstrapJS: "//maxcdn.bootstrapcdn.com/bootstrap/3.3.1/js/bootstrap.min.js"
                });
            db.close();
        });
    });
});


module.exports = router;
