var express = require('express');
var router = express.Router();
var nbOfQuestions = 2;
var util = require('util');

/*
 * Gets the question records of questionNb and the next question if there is one.
 */
function getQuestionRecords(questionNb, quizdb, callback){
		params = {};
		if(questionNb + 1 === nbOfQuestions){
				params.keys = [questionNb, 0];
				params.descending = true;
		} else {
				params.keys = [questionNb, questionNb+1];
		}
		var oldQuestion = {};
		var newQuestion = {};
		quizdb.view('question','by_questionNb', params, function(err, body){
				if(!err){
						console.log(body.rows);
						oldQuestion = body.rows[0].value;
						console.log(params.keys);
						newQuestion = body.rows[1].value;
						callback(oldQuestion, newQuestion);
						return;
				} else {
						console.log(err);
						return; 
				}
		});
}

/* GET logged in quiz page. */
router.get('/', function(req, res){
		//get middelware refs
		// cs = req.cs;
		// cs.csget(req, res);
		//AUTH is handled in all() vide supra
		console.log("quiz csession:" + util.inspect(req.csession));
		res.render('quiz', {});
});

router.put('/', function(req, res) {
		//get middelware refs
		quizdb = req.nano.use('quiz');
		quizType = req.quizType;
		// cs = req.cs;
		// cs.csget(req, res);

		//AUTH is handled in all() vide supra
		user = req.csession["user"];
		questionNb = req.csession["questionNb"];
		score = req.csession["score"];
		answer = req.body.answer;
		resData ={};
		console.log(questionNb);
		getQuestionRecords(questionNb, quizdb, function(oldQuestion, newQuestion){
				console.log("question");
				console.log(oldQuestion.questionNb);
				console.log(oldQuestion[quizType+"_answer"]);
				//Check the given answer.
				if(answer===oldQuestion[quizType+"_answer"]){
						console.log("correct");
						score++;	
				} 

				// Last question checked
				if(questionNb + 1 === nbOfQuestions){
						//reset session data to replay
						req.csession["questionNb"] = 0;
						req.csession["score"] = 0;
						// cs.csset(req, res);
						resData.ok = true;
						resData.finished = true;
						resData.finalScore = score;
						resData.score = 0;
						resData.questionNb = 0;
						resData.question = newQuestion.question;
				} else {
						//Update session
						req.csession["questionNb"] = ++questionNb;
						req.csession["score"] = score;
						// cs.csset(req, res);
						resData.ok = true;
						resData.finished= false;
						resData.score = score;
						resData.questionNb = questionNb;
						resData.question = newQuestion.question;
				}
				res.send(resData);
		});
});


module.exports = router;
