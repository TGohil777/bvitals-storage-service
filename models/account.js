'user strict'

module.exports = (sequelize , DataTypes) => {
    const account = sequelize.define('account',{
        accountid:{
            type : DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },
        active:{
            type: DataTypes.BOOLEAN,
            defaultValue : false
        },
        authid:{
            type: DataTypes.BIGINT,
            allowNull: false
        },
        deleted:{
            type: DataTypes.BOOLEAN,
            defaultValue : false
        }
    },{
        freezeTableName: true,
        timestamps: false
    })

    account.associate = function(models) {
    account.hasMany(models.orguser, {foreignKey: 'accountid' ,as: 'orgusers'})

    }
    return account;
}