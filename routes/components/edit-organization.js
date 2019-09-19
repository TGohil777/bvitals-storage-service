const models = require('../../models')
const editOrganization = async (req) =>{
    let errors = {}
    let data = {}

    try{
        const {orgname, webadress, themecolor, logourl} = req.body
        const {orgId} = req.params


        // const org = await models.organization.findOne({
        //     where : {
        //         organizationid : orgId
        //     }
        // })


        const updateOrg = await models.organization.update({
            name : orgname,
            webaddress,
            themecolor,
            logourl},

            {where : {
                organizationid : orgId
            }
        })
        // return res.status(200).json({
        //     message : 'Updated Practice!'
        // })

        // const updatedOrg = models.org.update({
        //     name : orgname,
        //     themecolor,
        //     logourl,

        //     where : {
        //         organizationid : orgId
        //     }
        // })

    }catch(err){
        return res.status(400).json({
            message : err.message
        })
    }

    return{
        errors,
        data
    }
}

module.exports = {
    editOrganization
}