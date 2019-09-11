'use strict'

module.exports = (sequelize , DataTypes) => {
    const orguser = sequelize.define('orguser', {
        orguserid:{
          type: DataTypes.BIGINT,
          primaryKey: true,
          autoIncrement : true,
          allowNull : false
        },
        orgusertype:{
            type: DataTypes.STRING(50),
            allowNull:false
        },
        isadmin : {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false
        },
        organizationid:{
            type: DataTypes.BIGINT,
            references:{
                model: 'organization',
                key:'organizationid'
            }
        },
        accountid : {
            type: DataTypes.BIGINT,
            references:{
                model:'account',
                key:'accountid'
            }
        },
        deleted: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: true
        }

    },{
        freezeTableName: true,
        timestamps: false
    })

    orguser.associate = function(models) {
        orguser.belongsTo(models.organization, {foreignKey: 'organizationid'})
        orguser.belongsTo(models.account, {foreignKey:'accountid'})
      };

    return orguser;
}