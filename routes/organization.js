const express = require('express')
const models = require('../models')
const authRouter = express.Router();
const {editOrganization} = require('./components/edit-organization.js')
const { userCreation, getCurrentUser} = require('./services/organization');
//---------------------------------------------------------------------------------------------------------------------
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

        const {newUserFirstName, newUserLastName, newUserEmail, newUserPassword} = req.body
        const data = {
            newUserFirstName, 
            newUserLastName, 
            newUserEmail, 
            newUserPassword
        }
        const responseData = await userCreation(token, data);
        if (!responseData) throw new Error("Cannot create user");

        const  { user } = responseData.data;
        
        //checking if the record has been created in auth table for the specified email.
        //if the email is present in auth, then we will add the record in auth table
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
//--------------------------------------------------------------------------------------------------------------------
authRouter.route('/edit-organization/:orgId').put(async (req,res)=>{
    try{
//         const {errors,data} = await editOrganization(req)
//         if(!errors){
//             return res.status(200).json({
//                 message : 'Update Finished!'
//             })
//         }
//         else{
//             return res.status(401).json(errors)
//         }

const token = req.headers['authorization'];
if (!token) throw new new Error("You are not authorized");
const userResponse = await getCurrentUser(token);
if (!userResponse.data || !userResponse.data.isValid) throw new Error("User not authorized");

const {newName, newWebaddress, newThemeColor, newLogourl} = req.body




    }catch(err){
        return res.status(400).json({
            message: err.message
        })
    }
 })


//----------------------------------------------------------------------------------------------------------------------
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
//--------------------------------------------------------------------------------------------------------------
authRouter.get('/associated-locations', async (req,res)=>{
    const token = req.headers['authorization'];
    const {id} = req.query;
    if (!token) throw new new Error("You are not authorized"); 
    try{
        const userResponse = await getCurrentUser(token);
        if (!userResponse.data || !userResponse.data.isValid) throw new Error("User not authorized");
        if(!id) throw new Error(`Location not found`);
        const loc = await models.location.findOne({
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

//------------------------------------------------------------------------------------------------------------------
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
//------------------------------------------------------------------------------------------------------------------

authRouter.put("/delete-organization", async (req, res) => {
    const {email} = req.body
    try{
        const user = await models.auth.findOne({
            where: {
                email: email
            }
        });
        if(!user)  
            throw new Error(`User with email ${email} not found`);
            const deleteUser = await models.auth.update({
                deleted:  true
            },{
                where:{
                    email: email  
                }
            })
        if(deleteUser){
            res.status(200).json({
            message: "User successfully deleted"})
        }else{
            throw new Error('There was an error while deleting')
        }
    }catch (error) {
        res.status(401).json({
        error: error.message
        });
    }
})
//-------------------------------------------------------------------------------------------------------------------

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
//---------------------------------------------------------------------------------------------------------------------
module.exports = authRouter