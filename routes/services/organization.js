const authinstance = require('./authinstance')
const createUser = 'api/v1/identity-service/create-ClinicalAdmin'
const currentUser = 'api/v1/identity-service/current-user'
function userCreation(token, data){
    const authorizedInstance = authinstance(token);
    authorizedInstance.interceptors.response.use((response) => {
        return response;
      }, function (error) {
        if (error.response.status === 401) {
          return Promise.reject(error.response.data);
        }
      
        if (error.response.status === 400) {
          return Promise.reject(error.response.data);
        }
      });
    return authorizedInstance.post(createUser, data)
}
function getCurrentUser(token){
    const authorizedInstance = authinstance(token);
    authorizedInstance.interceptors.response.use((response) => {
      return response;
    }, function (error) {
      if (error.response.status === 401) {
        console.log("Error", JSON.stringify(error.response.data, null, 3));
        return Promise.reject(error.response.data);
      }
    
      if (error.response.status === 400) {
        console.log("Error", JSON.stringify(error.response.data, null, 3));
        return Promise.reject(error.response.data);
      }
    });
    
    return authorizedInstance.get(currentUser)
}
module.exports = {
    userCreation,
    getCurrentUser
}

//const currentUser = require('/api/v1/identity-service/')

// async function createOrganization(data){
//     //return await currentUser(currentUser, data)
// }
// async function editOrganization(data){
    
// }
// async function organizations(){

// }
// async function organization(data){

// }

// module.exports = {
//     createOrganization,
//     editOrganization,
//     organizations,
//     organization
// }