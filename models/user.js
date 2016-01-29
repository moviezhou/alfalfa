/**
 * Created by moviezhou on 1/5/16.
 */

module.exports = function(sequelize, DataTypes){
    var User = sequelize.define('user', {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            comment: 'primary key'
        },
        username: {
            type: DataTypes.STRING(32),
            comment: 'user name'
        },
        password: {
            type: DataTypes.STRING(32),
            comment: 'md5 encrypted password'
        },
        email: {
            type:DataTypes.STRING(64),
            comment: 'user email'
        }
    },{
        classMethods: {
            associate: function (models) {
                User.hasOne(models.robot, {
                    onDelete: 'CASCADE',
                    foreignKey: {
                        allowNull: false
                    }
                });
            }
        }
    });

    return User;
}