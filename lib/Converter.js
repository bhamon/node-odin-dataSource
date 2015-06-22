'use strict';

var lib = {
	odin:{
		Exception:require('odin').Exception
	}
};

/**
	@class
	@classdesc		Data converter.
	@alias			module:odin/dataSource.Converter

	@desc			Constructs a new converter.
*/
function Converter() {
};

/**
	@abstract
	@desc				Converts the provided data retrieved from an external data source to its model representation.
	@param p_value		Data to convert.
	@returns			Converted data.
*/
Converter.prototype.from = function(p_data) {
	throw new lib.odin.Exception('Abstract method not implemented', {method:'from'});
};

/**
	@abstract
	@desc				Converts the provided data retrieved from a model instance to its data source representation.
	@param p_value		Data to convert.
	@returns			Converted data.
*/
Converter.prototype.to = function() {
	throw new lib.odin.Exception('Abstract method not implemented', {method:'to'});
};

module.exports = Converter;