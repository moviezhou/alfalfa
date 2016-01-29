var express = require('express');
var app = require('../app');
var bunyan = require('bunyan');
var logger = bunyan.createLogger({name: 'Alfalfa'});
var router = express.Router();
var models = require('../models');
var DB = require('./db')(logger);
var db = new DB();
var session;


/* GET home page. */
router.get('/', function(req, res, next) {
  session = req.session;
  if(session.username){

    db.findRobot(session.username,function(result){
      if(result){
        res.render('index', {user: session.username, bot:result});
      }
      else{
        res.render('config');
      }
    });
  }
  else{
    res.render('signin',{error: false});
  }
});

router.get('/signin', function(req, res, next) {
  res.render('signin',{error: false});
});

router.get('/signup', function(req, res, next) {
  res.render('signup');
});

router.get('/logout', function(req, res, next){
  req.session.destroy(function(err){
    if(err){
      console.log(err);
    }
    else{
      res.redirect('/signin');
    }
  });
});

router.get('/config', function(req, res, next) {
  if(req.session.username){
    res.render('config');
  }
  else{
    res.redirect('/signin');
  }
});

router.post('/signin', function (req, res, next) {
  var user = req.body;

  db.findUser(user,function(result){
    if(result === 'success'){
      session = req.session;
      session.username = user.username;
      res.redirect('/');
    }
    else if(result === 'failed'){
      res.render('signin', {error: true});
    }
  });
});


router.post('/signup', function (req, res, next) {
  var user = req.body;
  db.addUser(user,function(){
    console.log('user add success');
    res.render('index', {user: user.username});
  });
});

router.post('/config', function (req, res, next) {
  if(req.session.username){
    var robot = {};
    robot.serial = req.body.selectedID;;
    robot.owner = req.session.username;
    // if exist, then update, else add
    //  DB.save(user,bot);
    db.addRobot(robot,
        function(){
          res.redirect('/');
        });
  }
});

module.exports = router;
