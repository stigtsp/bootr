// Bootstrap code, loads js and css into localstorage and reloads it when the references change.

var _index_checksum = (new Date()).getTime();
var _fp_checksum    = (new Date()).getTime();

function _re_bootstrap() {
  var ls = window.localStorage;
  var log = function(m,o) {
	 if (o) {
		console.log('_re_bootstrap: ' + m, o);
	 } else {
		console.log('_re_bootstrap: ' + m);
	 }
  };


  var _render = function(type) {
	 var data = ls[type];
	 var el;
	 if(type=='js') {
		el = document.createElement('script');
		el.type= "text/javascript";
	 } else if(type=='css') {
		el = document.createElement('style');
		el.type= "text/css";
	 } else {
		log('Cant render unknown type: ' + type);
		return false;
	 }
	 el.appendChild(document.createTextNode(data));
	 document.getElementsByTagName('head')[0].appendChild(el);
  };

  var _init = function(type, url) {
	 if (ls[type] && url && ls[type + '_url'] == url) {
		log(type + ' cached and valid');
	 } else {
		log(type + ' not cached or invalid');
		if (url) {
		  _get(url, function(data) {
			 if (data && data.content && data.type == type) {
				log('got data ' + data.content.length + ' chars');
				ls[type] = data.content;
				ls[type+'_url'] = url;
			 } else {
		  		log('download failed, going for fallback');
			 }
		  });
		} else {
		  log(type + ' no url for download we attempt to render what we have');
		}
	 }
	 _render(type);
  };

  var _get = function(url, _cb){
	 if(window.navigator.onLine) {
		log('online so triggering synchronous download of '+url);
		var ajax = $.ajax(url, {async:false,type:'GET'});
		ajax.done(function(data){_cb(data)});
		ajax.fail(function(){_cb(false)});
	 } else {
		_cb(false);
	 }
  };
  
  var js_url  = ls.js_url;
  var css_url = ls.css_url;
  

  _get('assets.json', function(data){
	 if(data && data.js_url && data.css_url){
		js_url = data.js_url;
		css_url= data.css_url;

		if (data.index_checksum)
		  _index_checksum = data.index_checksum;
		if (data.fp_checksum)
		  _fp_checksum    = data.fp_checksum;

	 } else {
		log('assets file didnt contain expected data', data);
	 }
  });

  log('calling_init');
  _init('css', css_url); 
  _init('js', js_url); 

};
