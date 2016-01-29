/**
 * Created by moviezhou on 1/5/16.
 */

var models = require('../models');
var uuid = require('node-uuid');
var crypto = require('crypto');

module.exports = function (logger) {
    var logger = logger;

    function DB(){
    }

    DB.prototype.addUser = function(user,callback){
        user.id = uuid.v1();
        user.password = crypto.createHash('md5').update(user.password).digest("hex");
        models.user.findAll({
            where: {
                username: user.username
            }
        }).then(function (results) {
            if(!results.length){
                models.sequelize.transaction(function () {
                    return models.user.create(user).then(function (user) {
                        if(callback){
                            callback.call(this,'success');
                        }
                        logger.info('user ' + user.username +' added' );
                    });
                }).catch(function () {
                    if(callback){
                        callback.call(this,'failed');
                    }
                    logger.error("add user failed");
                });
            }
            else{
                logger.error('user exists.');
            }
        });
    };

    DB.prototype.findUser = function(user,callback){
        models.user.findOne({
            where: {
                username: user.username,
                password: crypto.createHash('md5').update(user.password).digest("hex")
            }
        }).then(function (result){
            if(result){
                callback.call(this,'success');
            }
            else{
                callback.call(this, 'failed');
            }
        });
    };

    DB.prototype.addRobot = function(robot,callback){
        robot.id = uuid.v1();
        models.robot.findAll({
            where: {
                serial: robot.serial
            }
        }).then(function (results) {
            if(!results.length){
                models.sequelize.transaction(function () {
                    return models.robot.create(robot).then(function (robot) {
                        if(callback){
                            callback.call(this,'success');
                        }
                        logger.info('robot ' + robot.serial +' added' );
                    });
                }).catch(function (e) {
                    console.log(e.message);
                    if(callback){
                        callback.call(this,'failed');
                    }
                    logger.error("add robot failed");
                });
            }
            else{
                logger.error('robot exists.');
            }
        });
    };

    DB.prototype.findRobot = function(user,callback){
        models.robot.findOne({
            where: {
                owner: user
            }
        }).then(function (result){
            if(result){
                callback.call(this,result.serial);
            }
            else{
                callback.call(this,null);
            }
        });
    };

    DB.prototype.assignRobotToUser = function(user, robot, callback){
    };

    DB.prototype.updateUser = function(user){
        models.user.findAll({
            where: {
                username: user.username
            }
        }).then(function (results) {
            if(results.length){
                var selector = {
                    where: {
                        username: user.id
                    }
                };

                models.user.update(user, selector);
            }
            else{
                logger.error('user ' + user.username + ' doesn\'t exists.');
            }
        });
    };

    DB.prototype.updateRobot = function(robot){
        models.robot.findAll({
            where: {
                serial: robot.serial
            }
        }).then(function (results) {
            if(results.length){
                var selector = {
                    where: {
                        id: robot.id
                    }
                };

                models.robot.update(robot, selector);
            }
            else{
                logger.error('robot ' + robot.serial + ' doesn\'t exists.');
            }
        });
    };

    return DB;
};

