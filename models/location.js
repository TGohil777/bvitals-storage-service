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
            allowNull: false
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