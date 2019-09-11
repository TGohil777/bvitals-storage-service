'use strict'

module.exports = (sequelize, DataTypes) => {
    const organization = sequelize.define('organization',{
        organizationid : {
           type: DataTypes.BIGINT,
           primaryKey: true,
           autoIncrement: true,
           allowNull: false 
        },
        name:{
            type: DataTypes.STRING(500),
            allowNull:false
        },
        webaddress:{
            type: DataTypes.STRING(500),
            allowNull:false
        },
        subdomain:{
            type: DataTypes.STRING(500),
            allowNull:false
        },
        deleted:{
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        themecolor:{
            type: DataTypes.STRING(10),
            allowNull:false
        },
        logourl:{
            type: DataTypes.STRING(256),
            allowNull: false
        }
    },{
        freezeTableName: true,
        timestamps: false
    })

    organization.associate = function(models) {
        organization.hasMany(models.location, {foreignKey: 'organizationid' ,as: 'locations'})
        organization.hasMany(models.orguser, {foreignKey: 'organizationid' ,as: 'users'})
      };
    return organization;
}