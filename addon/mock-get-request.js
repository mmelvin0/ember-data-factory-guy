import $ from 'jquery';

var MockGetRequest = function (url, modelName, responseJson) {
  var status = 200;
  var succeed = true;
  var response = {};

  this.andSucceed = function (options) {
    succeed = true;
    status = options && options.status || 200;

    return this;
  };

  this.andFail = function (options={}) {
    succeed = false;
    status = options.status || 500;
    response = options.response || {};

    return this;
  };

  this.handler = function () {
    if (succeed === false) {
      this.status = status;
      this.responseText = response;
    } else {
      this.status = status;
      this.responseText = responseJson;
    }
  };

  var requestConfig = {
    url: url,
    dataType: 'json',
    type: 'GET',
    response: this.handler
  };

  $.mockjax(requestConfig);
};

export default MockGetRequest;
