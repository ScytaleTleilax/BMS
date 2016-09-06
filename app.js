var express = require('express');
var app = express();
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var fs = require('fs');
var qr = require('qr-image');
var spawn = require('child_process').spawn;
var gm = require('gm').subClass({ imageMagick: true });
var imS = require('imagemagick-stream');
var multer = require('multer');
var storage = multer.diskStorage
(
	{
		destination: function (req, file, cb) {
			cb(null, __dirname + '/public/uploads/')
		},
		filename: function (req, file, cb) {
			cb(null, file.originalname);
		}
	}
);

var upload = multer({storage: storage});
var routes = require('./routes/index');
var users = require('./routes/users');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');


//Middleware
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', routes);
app.use('/users', users);


//Functii Mongo
var MongoClient = require('mongodb').MongoClient
	, assert = require('assert');
var url = 'mongodb://127.0.0.1:27017/demoBMS';

var insertFisier = function (req) {
	MongoClient.connect(url, function (err, db) {
		db.collection('fisiere').insertOne(
			{
				"obiect": req.file,
				"nume": req.body.nume
			},
			function (err, result) {
				assert.equal(err, null);
				console.log("Fisier salvat in db.");
			});
		db.close();

	});
};

var addThumbURL = function (db, src, destURL, fullURL, QRurl, callback) {
	db.collection('fisiere').updateOne(
		{"obiect.path": src},
		{
			$set: {
				"thumbURL": destURL,
				"fullURL": fullURL,
				"QRurl": QRurl
			}
		},
		function (err, results) {
			//console.log(results);
			callback(results);
		});
};


//Upload logic
app.post('/', upload.single('fisierUpload'), function (req, res) {
	insertFisier(req);

	var src = req.file.path;
	var dest = __dirname + '/public/uploads/thumbs/' + req.file.filename;
	var readStream = fs.createReadStream(src);
	var writeStream = fs.createWriteStream(dest);
	var thmbURL = "/uploads/thumbs/" + req.file.filename;
	var fullURL = "/uploads/" + req.file.filename;


	//Creaza png - QRcode din argul `fullURL`
	var QRname = req.file.filename.slice(0, -3);
	var QRurl = '/uploads/barcodes/' + QRname + 'png';
	var output = fs.createWriteStream(__dirname + '/public/uploads/barcodes/' + QRname + 'png');
	var code = qr.image(fullURL, {type: 'png'});
	code.pipe(output);


	var thumb = imS().resize('300x300').set('background','white').op('extent',300,300).gravity('Center');


	readStream.pipe(thumb).pipe(writeStream).on('finish', function () {
		MongoClient.connect(url, function (err, db) {
			assert.equal(null, err);

			addThumbURL(db, src, thmbURL, fullURL, QRurl, function (results) {
				res.redirect('back');
				db.close();
			});
		});
	});
});


// catch 404 and forward to error handler
app.use(function (req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});


// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
	app.use(function (err, req, res, next) {
		res.status(err.status || 500);
		res.render('error', {
			message: err.message,
			error: err
		});
	});
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
	res.status(err.status || 500);
	res.render('error', {
		message: err.message,
		error: {}
	});
});

module.exports = app;
