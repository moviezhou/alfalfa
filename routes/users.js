var express = require('express');
var router = express.Router();
var models = require('../models');
var logger = {};
var DB = require('./db')(logger);
var db = new DB();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/signup', function (req, res, next) {
  var user = req.body;
  db.addUser(user,function(){
    console.log('user add success');
    res.render('index', {user: user.username});
  });
});

module.exports = router;