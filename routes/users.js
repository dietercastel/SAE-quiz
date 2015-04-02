var express = require('express');
var nano = require('nano')('http://localhost:5984');
var router = express.Router();

router.put('/add', function(req, res) {
		//get middelware refs
		userdb = req.nano.use('_users');
		highscoresdb = req.nano.use('highscores');

		user = req.body;
		if(user.password != user.password2){
				console.log("passwords not matching");	
				res.send({ok:false});
				return;
		} else {
				delete user.password2;	
				user.type = "user";
				user.roles = [];
				userdb.insert(user, 'org.couchdb.user:'+user.name, function(err, body) {
						if (!err){
								highscore = { 
										name : user.name,
										score : 0 
								};
								highscoresdb.insert(highscore, user.name);
								console.log(body);
								res.send({ok:true, msg:"Succesfully added " + user.name +"."});
						} else {
								res.send({ok:false});
								console.log("user\n");
								console.log(user);	
								console.log("body\n");
								console.log(body);	
						}
				});
		}
});

router.post('/login', function(req, res) {
		// console.log(req);
		//get middelware refs
		cs=req.cs;
		nano=req.nano;

		auth=req.body;
		callback = console.log;
		nano.auth(auth.name, auth.password, function (err, body, headers) {
				if (err) {
						res.send({authenticated:false});
						return callback(err);
				}
				cs.csget(req, res);
				req.csession["authenticated"] = true;
				req.csession["user"] = auth.name;
				req.csession["score"] = 0;
				req.csession["questionNb"] = 0;
				cs.csset(req, res);
				res.setToken();
				res.send({authenticated:true, user: auth.name, url:"quiz"});
		});
});

router.get('/logout', function(req, res){
		cs=req.cs
		cs.csget(req, res);
		//Probably not necessary to unset this.
		req.csession["authenticated"] = false;
		delete req.csession.user;
		delete req.csession.score;
		delete req.csession.questionNb;
		//Expire the cookie in 1 second.
		//NOTE: 0 would result in cookie deletion on closing the browser.
		cs.opt.maxAge = 1;
		cs.csset(req, res);
		res.send({authenticated:false, url:"/"+req.quizType})
		//Reset maxAge since this is a global option.
		cs.opt.maxAge = 3600;
});

//TODO:Return user listing
router.get('/', function(req, res) {
		//get middelware refs
		userdb = req.nano.use('_users');

		res.send(userdb.list(function(err, body) {
				if (!err) {
						body.rows.forEach(function(doc) {
								console.log(doc);
						});
				}
		}));
});

module.exports = router;
