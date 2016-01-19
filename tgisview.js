"use strict";
var request 	= request || require('request');
var winston 	= winston || require('winston');

var XML_DOCUMENT_DECLARATION 	= '<?xml version="1.0" encoding="utf-8"?>\n';
var XML_TAG_RESPONSE_OPEN		= '<response><![CDATA[';
var XML_TAG_RESPONSE_CLOSE		= ']]></response>\n';

var tgisview = tgisview || {
	
	initialize: function (){},
		
	sendGraphResponse: function (error, response, body, res) {
		res.set('Content-Type', 'text/xml');
		var stringBody = JSON.stringify(response.body);
		winston.info(stringBody);
		if (!error && response.statusCode == 200) {
			res.send(XML_DOCUMENT_DECLARATION + XML_TAG_RESPONSE_OPEN 
					+ stringBody + XML_TAG_RESPONSE_CLOSE);}
		else {
			winston.error(error + " ...response status: " + response.statusCode);
			res.send(XML_DOCUMENT_DECLARATION + XML_TAG_RESPONSE_OPEN 
					+ error + " ... response status: " + response.statusCode
					+ XML_TAG_RESPONSE_CLOSE);}
	},
	
	sendErrorResponse: function (requestHostUrl, res) {
		res.set('Content-Type', 'text/xml');
		res.send(XML_DOCUMENT_DECLARATION + XML_TAG_RESPONSE_OPEN 
    			+ "ERROR: Incorrectly formatted parameters -- see " 
        		+ requestHostUrl + " for proper usage." + XML_TAG_RESPONSE_CLOSE);
	}

};   /* tgisview namespace */

module.exports = tgisview;
