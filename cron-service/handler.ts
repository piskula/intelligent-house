'use strict';

const http = require('http');

module.exports.hello = async (event, context, callback) => {
  const request = {
    host: 'us-central1-intelligent-house-test.cloudfunctions.net',
    path: '/refreshStatus'
  };

  return http.get(request, response => {
    let body = {};

    response.on('data', data => body = data);

    response.on('end', () => {
      // console.log(body);
      callback(body);
    });
  });
};
