'use strict';

let lib = {
	odin:{
		Exception:require('odin').Exception
	}
};

/**
	@class
	@classdesc		Data converter.
	@alias			module:odin/dataSource.Converter
*/
class Converter {
	/**
		@abstract
		@desc				Converts the provided data retrieved from an external data source to its model representation.
		@param p_data		Data to convert.
		@returns			Converted data.
	*/
	from(p_data) {
		throw new lib.odin.Exception('Abstract method not implemented', {method:'from'});
	}

	/**
		@abstract
		@desc				Converts the provided data retrieved from a model instance to its data source representation.
		@param p_data		Data to convert.
		@returns			Converted data.
	*/
	to(p_data) {
		throw new lib.odin.Exception('Abstract method not implemented', {method:'to'});
	}
}

module.exports = Converter;