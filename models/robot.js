/**
 * Created by moviezhou on 1/5/16.
 */

module.exports = function(sequelize, DataTypes){
    var Robot = sequelize.define('robot',{
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            comment: 'primary key'
        },
        serial: {
            type: DataTypes.STRING(32),
            comment: 'robot serial number'
        },
        owner: {
            type: DataTypes.STRING(32),
            comment: 'owner of robot'
        }
    },{
        classMethods: {
            associate: function(models) {
                Robot.belongsTo(models.user,{
                    onDelete: 'SET NULL',
                    foreignKey: {
                        allowNull: true    //false
                    }
                });
            }
        }
    });
    return Robot;
}