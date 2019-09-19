const models = require('../../models')
const { userCreation, getCurrentUser } = require('../services/organization')
const onboardOrganization = async(token, body) => {
    let errors = {};
    let data = {};
    
    try{
        //for getting the currentUser info.
        const response = await getCurrentUser(token);
        //if only the isValid is returned as true from the currentUser endpoint, then only
        //onboarding practice should be allowed, also creating user will be allowed.
        if(response.isValid){
        const {orgname, webaddress, subdomain, themecolor, logourl,
                orglocation, address1, address2, city, state, zipcode,
                lat, lng} = body

                

        // to check if org with the name exists in db or not.
        const findOrg = await models.organization.findOne({
            where : {
                name : orgname
            }
        })
        // if the name exists then give error message.
        if(findOrg){
            errors.existingname = 'Organization name already exists. Please specify another name!'
            
        }else{
            const org = await models.organization.create({
                name : orgname,
                webaddress,
                subdomain,
                themecolor,
                logourl
        })
            //const orgid = org.organizationid;
    
            if(org){
    
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
                }


            //for calling create-user route present in identity service.
            if (orglocation) {
                const {firstname, lastname, email, password} = body
                const token = req.headers['Authorization'].split(' ');
                const responseData = await userCreation(token[1], 'firstname, lastname, email, password')
                if (responseData) {
                    data  = responseData;

                    //we will add the data.authid received from the create-clinicaladmin api,
                    //into the account table, to create a user account. Later on we will link that account
                    //to an organization/practice. this code is the next step after this one.
                    const accountCreated = models.account.create({
                        active : true,
                        authid  : data.authid
                    })

                    //if the account in account table has been created
                    //then only we will add that account's details in orguser table
                    //and hence register that account for a practice and consider it as a org user or a practice user.
                    if(accountCreated){
                        const orguserAdded = models.orguser.create({
                            orgusertype : 'Clinical Admin',
                            organizationid : org.organizationid,
                            accountid : accountCreated.accountid,
                        })
                    }
                }
            }
            //if the current user is false, then it will go to else and give a message
        }
    } else{
        errors.unauthorized = 'Your account is unauthorized!'
    }
    }catch(err){
        errors.message = err.message
    }
    return{
        errors,
        data
    }
}

module.exports = {
    onboardOrganization
}