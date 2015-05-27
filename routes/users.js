var express = require('express');
var nano = require('nano')('http://localhost:5984');
var router = express.Router();

router.put('/add', function(req, res) {
	//get middelware refs
	userdb = req.nano.use('_users');
	highscoresdb = req.nano.use('highscores');

	user = req.body;
	if(user.password !== user.password2){
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
	//get middelware refs
	nano=req.nano;
	auth=req.body;
	//Authenticate via CouchDB user auth
	nano.auth(auth.name, auth.password, function (err, body) {
		if (err) {
			//Failed auth
			res.send({authenticated:false});
			console.log(err);
		} else {
			newSessionData = {};
			newSessionData["questionNb"] = 0;
			newSessionData["score"] = 0;
			newSessionData["user"] = auth.name;
			sendData = {};
			sendData["authenticated"] = true;
			sendData["user"] = auth.name;
			sendData["url"] = "quiz";
			res.sae.sendNewSession(req, res, newSessionData, sendData);
		}
	});
});

router.post('/logout', function(req, res){
	sendData = {};
	sendData["authenticated"] = false;
	sendData["url"] = "/"+req.quizType;
	res.sae.sendDestroySession(req,res,sendData);
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
