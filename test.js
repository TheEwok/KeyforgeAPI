const request = require('request');
const API = require('./lib/api');

const kf_api = new API();

kf_api.fetchTokens('geekwok','cydex100').then((res) => {
  res.apiAuth().then((apiRes) => {
    console.log("Done");
  });
});
