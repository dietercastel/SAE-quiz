var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var bodyParser = require('body-parser');
var users = require('./routes/users');
var highscores = require('./routes/highscores');
var quiz = require('./routes/quiz'); 
var app = express();
var nano = require('nano')('http://localhost:5984');
//SAE config
var saeoptions = {
	//REQUIRED:
	projectPath: __dirname,
	keyPath: "/vagrant/csession.key",
	failedAuthFunction : failedAuth,
	//OPTIONAL
	reportRoute: '/reporting',
	proxyPrefix: '/sae',
	excludedAuthRoutes : ["/users/login","/users/add","/highscores","/images","/javascripts","/stylesheets","/html"],
	//Not advised but for testing.
	cspReportOnly: false,
	// sessionLifeTime : 30, 
	// sessionRefreshTime : 20,
	// sessionAbsoluteExpiry : 60,
	secureCookie: false
};
function failedAuth(req,res){
	res.redirect("/sae#/login");
	return;
}

var sae = require('../Sec-Angular-Express/SAE')(saeoptions);
sae.configure(app);

//SINGLE OPTION "sae"
var clientSide = process.argv[2];

app.use(function(req, res, next){
        // req.cs = cs;
        req.nano = nano;
        req.quizType = clientSide; 
        next();
});

app.all('*', function(req, res, next) {
        //Set Access control allow origin header to allow vagrant sharing.
        // res.header("Access-Control-Allow-Origin", "self");
        res.header("Access-Control-Allow-Origin", "http://www.dietercastel.com");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
		res.header("Access-Control-Allow-Credentials","true");
		res.header("Access-Control-Allow-Credentials", "true");
		res.header("Vary","Accept-Encoding, Origin");

		// Worked after second reload...
		// res.header("X-EPR","1");
		
        // res.header("Content-Security-Policy", "default-src 'self';script-src 'self' https://ajax.googleapis.com https://maxcdn.bootstrapcdn.com;object-src 'none';img-src 'self';media-src 'self';frame-src 'none';font-src 'self' data:;connect-src 'self';style-src 'self' https://ajax.googleapis.com https://maxcdn.bootstrapcdn.com");
        // res.header("Content-Security-Policy", "default-src 'self';script-src 'self';object-src 'none';img-src 'self';media-src 'self';frame-src 'none';font-src 'self' data:;connect-src 'self';style-src 'self'");

        // res.header("Content-Security-Policy", "script-src 'self';");
        next();
});

// view engine setup
app.set('views', path.join(__dirname, 'views/'+clientSide));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'protected/'+clientSide)));
app.use(express.static(path.join(__dirname, 'public/'+clientSide)));

//Placement matters here!!!
//Serving static files is without any auth so should be handled before SAE.
// sae.configure(app,bodyParser);

app.use('/users', users);
app.use('/highscores', highscores);
app.use('/quiz', quiz);

app.use('/', function(req, res, next){
	res.sendFile(path.join(__dirname, 'public',clientSide,"index.html"))
});


sae.handleErrors(app);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
        var err = new Error('Not Found');
        err.status = 404;
        next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
        app.use(function(err, req, res, next) {
                res.status(err.status || 500);
                res.render('error', {
                        message: err.message,
                        error: err
                });
        });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
                message: err.message,
                error: {}
        });
});

module.exports = app;
