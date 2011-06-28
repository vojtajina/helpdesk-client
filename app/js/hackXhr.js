/**
 * HACKED $XHR SERVICE
 * 
 * Core $xhr service doesn't allow to send custom headers during any request
 * TODO(vojta) remove, when fixed in angular
 */
angular.service('$xhr', function($browser, $error, $log, $updateView) {
  return function(method, url, post, callback, headers) {
    if (angular.isFunction(post)) {
      headers = callback;
      callback = post;
      post = null;
    }
    if (post && angular.isObject(post)) {
      post = angular.toJson(post);
    }

    headers = headers || {};
    headers['X-XSRF-TOKEN'] = $browser.cookies()['XSRF-TOKEN'];

    $browser.xhr(method, url, post, function(code, response, xhr) {
      try {
        if (angular.isString(response)) {
          if (response.match(/^\)\]\}',\n/)) response = response.substr(6);
          if (/^\s*[\[\{]/.exec(response) && /[\}\]]\s*$/.exec(response)) {
            response = angular.fromJson(response, true);
          }
        }
        if (200 <= code && code < 300) {
          callback(code, response, function(name) {
            return xhr && xhr.getResponseHeader(name) || 'fake-header';
          });
        } else {
          $error(
            {method: method, url:url, data:post, callback:callback},
            {status: code, body:response});
        }
      } catch (e) {
        $log.error(e);
      } finally {
        $updateView();
      }
    }, headers);
  };
}, {$inject: ['$browser', '$xhr.error', '$log', '$updateView']});