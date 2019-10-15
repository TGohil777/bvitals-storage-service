const express = require('express')
const models = require('../models')
const authRouter = express.Router();
const { userCreation, getCurrentUser} = require('./services/organization');

//End point for creating an organization
authRouter.post("/create-organization", async (req, res) => {
    try {
        const token = req.headers['authorization'];
        if (!token) throw new Error("You are not authorized");
        const userResponse = await getCurrentUser(token);
        if (!userResponse.data || !userResponse.data.isValid) throw new Error("User not authorized");
    
        const { orgname, webaddress, subdomain, themecolor, logourl, orglocation, address1, address2, city, state, zipcode,
             lat, lng } = req.body;

        const findOrg = await models.organization.findOne({
            where : {
                name : orgname
            }
        });
        if (findOrg) throw new Error(`Organization with name ${orgname} already exists`);

        const org = await models.organization.create({
            name: orgname ,
            webaddress,
            subdomain,
            themecolor,
            logourl
        })

        if (!org) throw new Error("Cannot create a new organization");
        
        const orgLocation = await models.location.create({
            name : orglocation,
            address1,
            address2,
            city,
            state,
            zipcode,
            latitude : lat,
            longitude : lng,
            organizationid : org.organizationid
        })
        if (!orgLocation) throw new Error("Cannot add a location to the current practice");

        const {firstname, lastname, email, password} = req.body
        const data = {
            firstname, 
            lastname, 
            email, 
            password
        }
        const responseData = await userCreation(token, data);
        if (!responseData) throw new Error("Cannot create user");
        const  { user } = responseData.data;
        
        const accountAdded = await models.account.create({
            authid: user.authid
        });
        if (!accountAdded) throw new Error("Cannot add account");

        const orguserAdded = await models.orguser.create({
            orgusertype : 'ClinicalAdmin',
            organizationid : org.organizationid,
            accountid : accountAdded.accountid
        });

        if (!orguserAdded) throw new Error("Unable to add user to the organization");
        res.status(200).json({
            message: "Successfully added practice"
        })
    } catch (err) {
        if (err.message) {
            res.status(400).json({
                message: err.message
            });
        } else {
            res.status(401).json({
                message: err
            });
        }
    }
})

//End point for viewing a single organization based on the orgID recieved from the response
authRouter.get('/single-organization', async (req,res)=>{
    const token = req.headers['authorization'];
    const {id} = req.query;
    if (!token) throw new new Error("You are not authorized"); 
    try{
        const userResponse = await getCurrentUser(token);
        if (!userResponse.data || !userResponse.data.isValid) throw new Error("User not authorized");
        if(!id) throw new Error(`Organization not found`);
        const org = await models.organization.findOne({
            where: {
                organizationid: id
            }
        });
        res.status(200).json(org)       
    }catch (error) {
        res.status(400).json({
        error: error.message
        });
    }
})

//End point for viewing a single organization associated locations based on the orgID recieved from the response
authRouter.get('/associated-locations', async (req,res)=>{
    const token = req.headers['authorization'];
    const {id} = req.query;
    if (!token) throw new new Error("You are not authorized"); 
    try{
        const userResponse = await getCurrentUser(token);
        if (!userResponse.data || !userResponse.data.isValid) throw new Error("User not authorized");
        if(!id) throw new Error(`Location not found`);
        const loc = await models.location.findAll({
            where: {
                organizationid: id
            }
        });
        res.status(200).json(loc)       
    }catch (error) {
        res.status(400).json({
        error: error.message
        });
    }
})

/* End point for viewing a single organization associated users based on the orgID recieved from the response
 Sending authID to IDS table to view the users list*/
authRouter.route('/associated-users').get(async (req, res) => {
    const {id} = req.query
    const token = req.headers['authorization'];
    try{
       if (!token) throw new Error('User is unauthorized')
       const userResponse = await getCurrentUser(token);
       if (!userResponse.data || !userResponse.data.isValid) throw new Error("User not authorized");
        const account = await models.account.findAll({
            attributes:['authid'],
            include:[{
                model:models.orguser , as:'orgusers',
                attributes:['organizationid'],
                where:{
                    organizationid:id
                }
            }]
        })
        res.status(200).json(account);
    }catch(err){
        return res.status(400).json({
            message : err.message
        })
    }
});

//End point to delete an organization
authRouter.put("/delete-organization", async (req, res) => { 
    const token = req.headers['authorization'];
    const {organizationid} = req.body
    try{
       if (!token) throw new Error('User is unauthorized')
       const userResponse = await getCurrentUser(token);
       if (!userResponse.data || !userResponse.data.isValid) throw new Error("User not authorized");
       const org = await models.organization.findOne({
        where: {
            organizationid: organizationid,   //Condition to check if the organization id exists in the db
            deleted :false                    //Condition to check if the org is not deleted before and is active
        }
    });
    if(!org) throw new Error(`Organization not found`);
    const deleteOrg = await models.organization.update({
        deleted:  true
    },{
        where:{
            organizationid: organizationid  
        }
    })
    if(deleteOrg){
        res.status(200).json({
        message: "Organization successfully deleted"})
    }else{
        throw new Error('There was an error while deleting the organization')
    }
    }catch(err){
        return res.status(400).json({
            message : err.message
        })
    }
})

//End point to view all the organizations present in the database
authRouter.get("/list-organization", async (req,res) => { 
    const token = req.headers['authorization'];
    if (!token) throw new new Error("You are not authorized"); 
    try{
        const userResponse = await getCurrentUser(token);
        if (!userResponse.data || !userResponse.data.isValid) throw new Error("User not authorized");
      
        const list = await models.organization.findAll({
            attributes:['organizationid','logourl','name','subdomain','deleted'],
            })
            res.status(200).json(list)
    }catch (error) {
        res.status(400).json({
            error: error.message
        });
    }
 })

 //End point to edit an organization based on th eorgID recieved
authRouter.put("/edit-organization", async (req,res) => { 
    try{
        if(req.body.newOrgName && !req.body.newWebAdd && !req.body.newColor){  //to edit org name
            const editOrgname = await models.organization.update({
                name:req.body.newOrgName
                },{
                where:{
                    organizationid : req.body.orgID, 
                }
            })
            res.status(200).json(editOrgname)
        }
        if(req.body.newWebAdd && !req.body.newOrgName && !req.body.newColor){  //to edit web address
            const editWebAdd = await models.organization.update({
                webaddress: req.body.newWebAdd
                },{
                where:{
                    organizationid : req.body.orgID, 
                }
            })
            res.status(200).json(editWebAdd)
        }
        if(req.body.newColor && !req.body.newOrgName && !req.body.newWebAdd){  //to edit theme color
            const editThemeColor = await models.organization.update({
                themecolor:req.body.newColor
                },{
                where:{
                    organizationid : req.body.orgID, 
                }
            })
            res.status(200).json(editThemeColor)
        }
    }catch (error) {
        res.status(401).json({
        error: error.message
        });
    }
})
//-------------------------------------------------------------------------------------------------------------------

//End point to edit a particular location based on the orgID recieved
authRouter.put("/edit-locations", async (req,res) => { 
        try{
            if(req.body.newLocName && !req.body.newAdd1 && !req.body.newAdd2 && !req.body.newCity //to edit location name
                && !req.body.newState && !req.body.newZipCode && !req.body.newLat && !req.body.newLng){
                const editLocName = await models.location.update({
                    name:req.body.newLocName
                    },{
                    where:{
                        organizationid : req.body.orgID, 
                    }
                })
                res.status(200).json(editLocName)
            }
            if(req.body.newAdd1 && !req.body.newLocName && !req.body.newAdd2 && !req.body.newCity  //to edit address1
                && !req.body.newState && !req.body.newZipCode && !req.body.newLat && !req.body.newLng){
                const editAdd1 = await models.location.update({
                    address1: req.body.newAdd1
                    },{
                    where:{
                        organizationid : req.body.orgID, 
                    }
                })
                res.status(200).json(editAdd1)
            }
            if(req.body.newAdd2 && !req.body.newLocName && !req.body.newAdd1 && !req.body.newCity  //to edit address2
                && !req.body.newState && !req.body.newZipCode && !req.body.newLat && !req.body.newLng){
                const editAdd2 = await models.location.update({
                    address2: req.body.newAdd2
                    },{
                    where:{
                        organizationid : req.body.orgID, 
                    }
                })
                res.status(200).json(editAdd2)
            }
            if(req.body.newCity && !req.body.newLocName && !req.body.newAdd1 && !req.body.newAdd2  //to edit city
                && !req.body.newState && !req.body.newZipCode && !req.body.newLat && !req.body.newLng){
                const editCity = await models.location.update({
                    city:req.body.newCity
                    },{
                    where:{
                        organizationid : req.body.orgID, 
                    }
                })
                res.status(200).json(editCity)
            }
            if(req.body.newState && !req.body.newLocName && !req.body.newAdd1 && !req.body.newAdd2  //to edit state
                && !req.body.newCity && !req.body.newZipCode && !req.body.newLat && !req.body.newLng){
                const editState = await models.location.update({
                    state:req.body.newState
                    },{
                    where:{
                        organizationid : req.body.orgID, 
                    }
                })
                res.status(200).json(editState)
            }
            if(req.body.newZipCode && !req.body.newLocName && !req.body.newAdd1 && !req.body.newAdd2  //to edit zipcode
                && !req.body.newState && !req.body.newState && !req.body.newLat && !req.body.newLng){
                const editZipCode = await models.location.update({
                    zipcode:req.body.newZipCode
                    },{
                    where:{
                        organizationid : req.body.orgID, 
                    }
                })
                res.status(200).json(editZipCode)
            }
            if(req.body.newLat && !req.body.newLocName && !req.body.newAdd1 && !req.body.newAdd2   //to edit latitude
                && !req.body.newState && !req.body.newZipCode && !req.body.newCity && !req.body.newLng){
                const editLat = await models.location.update({
                    latitude:req.body.newLat
                    },{
                    where:{
                        organizationid : req.body.orgID, 
                    }
                })
                res.status(200).json(editLat)
            }
            if(req.body.newLng && !req.body.newLocName && !req.body.newAdd1 && !req.body.newAdd2  //to edit longtitude
                && !req.body.newState && !req.body.newZipCode && !req.body.newCity && !req.body.newLat){
                const editLng = await models.location.update({
                    longitude:req.body.newLng
                    },{
                    where:{
                        organizationid : req.body.orgID, 
                    }
                })
                res.status(200).json(editLng)
            }
        }catch(err){
            return res.status(400).json({
                message: err.message
            })
        }
    })

module.exports = authRouter