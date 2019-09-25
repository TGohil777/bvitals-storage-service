const express = require('express')
const models = require('../models')
const authRouter = express.Router();
const {onboardOrganization} = require('./components/organization')
const {editOrganization} = require('./components/edit-organization.js')
const validateOnboardOrganization = require('./validations/onboard-organization')
const isEmpty = require('./validations/isEmpty');
const { userCreation, getCurrentUser} = require('./services/organization');

  authRouter.post("/create-organization", async (req, res) => {
    try {
        const token = req.headers['authorization'];
        if (!token) throw new new Error("You are not authorized");
        const userResponse = await getCurrentUser(token);
        if (!userResponse.data || !userResponse.data.isValid) throw new Error("User not authorized");
        // if (!response.data || !response.data.isValid) {
        //     throw new Error("User not authorized");
        // }

        
        const { orgname, webaddress, subdomain, themecolor, logourl,
             orglocation, address1, address2, city, state, zipcode,
             lat, lng } = req.body;

        const findOrg = await models.organization.findOne({
            where : {
                name : orgname
            }
        });

        if (findOrg) throw new Error(`Organization with name ${orgname} already exists`);

        
        const org = await models.organization.create({
            name : orgname,
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
        

        //checking if the record has been created in auth table
        //for the specified email.

        // //if the email is present in auth, then we will add the record
        // //in auth table

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

authRouter.route('/edit-organization/:orgId').put(async (req,res)=>{
    try{
        const {errors,data} = await editOrganization(req)
        if(!errors){
            return res.status(200).json({
                message : 'Update Finished!'
            })
        }
        else{
            return res.status(401).json(errors)
        }
    }catch(err){
        return res.status(400).json({
            message: err.message
        })
    }
})

authRouter.route('/organizations').get(async (req,res)=>{
    try{
        const {errors, data} = await organizationComponent.practices()
        if(!errors){
            return res.status(200).json(data)
        }else{
            return res.status(401).json(errors)
        }
    }catch(err){
        return res.status(400).json({
            message: err.message
        })
    }

})

authRouter.route('/organization').get(async (req,res)=>{
    try{
        const {errors, data} = await organizationComponent.practice()
        if(!errors){
            return res.status(200).json(data)
        }else{
            return res.status(401).json(errors)
        }
    }catch(err){
        return res.status(400).json({
            message: err.message
        })
    }

})


module.exports = authRouter