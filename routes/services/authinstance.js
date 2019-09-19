const axios = require('axios');

const authinstance = (token) =>  axios.create({
  baseURL: process.env.IDENTITY_URL,
  timeout: 20000,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Authorization': token
  }
})

module.exports = authinstance;