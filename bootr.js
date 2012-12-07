/*
 * TERMS OF USE - bootr.js
 * 
 * Open source under the BSD License. 
 * 
 * Copyright © 2012 Stig Palmquist <stigtsp@gmail.com>
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without modification, 
 * are permitted provided that the following conditions are met:
 * 
 * Redistributions of source code must retain the above copyright notice, this list of 
 * conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright notice, this list 
 * of conditions and the following disclaimer in the documentation and/or other materials 
 * provided with the distribution.
 * 
 * Neither the name of the author nor the names of contributors may be used to endorse 
 * or promote products derived from this software without specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY 
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
 *  COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 *  EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE
 *  GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED 
 * AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 *  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED 
 * OF THE POSSIBILITY OF SUCH DAMAGE. 
 *
*/


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
