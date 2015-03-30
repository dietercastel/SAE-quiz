var express = require('express');
var router = express.Router();


router.put('/add', function(req, res) {
		//get middelware refs
		highscoredb = req.nano.use('highscores');
		cs = req.cs;
		highscoredb.insert(req.body, req.body.name, function(err, body) {
				if (!err){
						res.send(body);
				} else {
						console.log(err);
						res.send({ok:false});
				}
		});
});
/* GET all the highscores. */
router.get('/', function(req, res) {
		//get middelware refs
		highscoredb = req.nano.use('highscores');

		params   = {include_docs: true};
		highscoredb.list(params, function(err, body) {
				if (!err) {
						res.send(body.rows);
						body.rows.forEach(function(doc) {
								console.log(doc.doc);
								console.log(doc.doc.score);
						});
				}
		});
});

/* GET all the highscores sorted by score*/
router.get('/by_score', function(req, res) {
		//get middelware refs
		highscoredb = req.nano.use('highscores');

		console.log(req);


		params = {};
		params.descending = true;
		highscoredb.view('highscore','by_score', params, function(err, body){
				if(!err){
						// console.log(body.rows);
						res.send(body.rows);
						return;
				} else {
						console.log(err);
						return; 
				}
		});
});

/* GET highscore by name */
router.get('/by_name', function(req, res) {
		//get middelware refs
		highscoredb = req.nano.use('highscores');

		params = {};
		console.log(req.query);
		params.key = req.query.key;
		params.descending = true;
		highscoredb.view('highscore','by_name', params, function(err, body){
				if(!err){
						console.log(body.rows);
						res.send(body.rows);
						return;
				} else {
						console.log(err);
						return; 
				}
		});
});

module.exports = router;
