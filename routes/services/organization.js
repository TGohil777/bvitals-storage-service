const authinstance = require('./authinstance');
const instance = require('./instance');
const createUser = 'api/v1/identity-service/create-ClinicalAdmin'
const currentUser = 'api/v1/identity-service/current-user'
const getUser ='api/v1/identity-service/get-users'

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
        return Promise.reject(error.response.data);
      }
    
      if (error.response.status === 400) {
        return Promise.reject(error.response.data);
      }
    });
    return authorizedInstance.get(currentUser)
}


function getUsers(token, authid){
  instance.interceptors.response.use((response) => {
    return response;
  }, function (error) {
    if (error.response.status === 401) {
      return Promise.reject(error.response.data);
    }
    if (error.response.status === 400) {
      return Promise.reject(error.response.data);
    }
  });
  return instance.get(getUser, {
    params: {
      authid: authid
    }
  }, {
    headers: {
      Authorization: token
    }
  });
}


module.exports = {
    userCreation,
    getCurrentUser,
    getUsers
}
