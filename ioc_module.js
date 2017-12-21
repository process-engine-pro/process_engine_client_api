'use strict';

var ProcessEngineClientApi = require('./dist/commonjs/index').ProcessEngineClientApi;

function registerInContainer(container) {

  container.register('ProcessEngineClientApi', ProcessEngineClientApi)
    .dependencies('MessageBusService')
    .singleton();

}

module.exports.registerInContainer = registerInContainer;
