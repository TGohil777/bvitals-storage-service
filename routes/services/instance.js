const axios = require('axios');

const instance = axios.create({
  method:'post',
  baseURL: process.env.IDENTITY_URL,
  timeout: 20000,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
})

module.exports = instance;