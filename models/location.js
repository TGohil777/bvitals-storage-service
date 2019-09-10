'use strict'

module.exports = (sequelize , DataTypes) => {
    const location = sequelize.define('location',{
        locationid:{
            type : DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        name:{
            type: DataTypes.STRING(500),
            allowNull:false
        },
        address1:{
            type: DataTypes.STRING(500),
            allowNull: false
        },
        address2:{
            type: DataTypes.STRING(500)
        },
        city :{
            type: DataTypes.STRING(50),
            allowNull:false
        },
        state : {
            type: DataTypes.STRING(50),
            allowNull:false
        },
        zipcode:{
            type: DataTypes.STRING(10),
            allowNull:false
        },
        latitude:{
            type: DataTypes.STRING(20),
            allowNull: true
        },
        longitude:{
            type: DataTypes.STRING(20),
            allowNull:true
        },
        organizationid:{
            type: DataTypes.BIGINT,
            allowNull:false,
            references: {         
                model: 'organization',
                key: 'organizationid'
              }         
        },
        deleted:{
            type: DataTypes.BOOLEAN,
            allowNull : false,
            defaultValue : false
        }
    },{
        freezeTableName: true,
        timestamps: false
    })

    location.associate = function(models) {
        location.belongsTo(models.organization, {foreignKey: 'organizationid'})
      };


    return location;
}