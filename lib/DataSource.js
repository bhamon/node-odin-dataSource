'use strict';

var lib = {
	deps:{
		q:require('q'),
		joi:require('joi')
	},
	odin:{
		util:require('odin').util,
		Exception:require('odin').Exception,
		dataSource:{
			Driver:require('./Driver')
		}
	}
};

/**
	@class
	@classdesc		Data source.
	@alias			module:odin/dataSource.DataSource

	@desc			Constructs a new data source.
*/
function DataSource(p_driver) {
	var args = lib.odin.util.validate({
		driver:p_driver
	}, {
		driver:lib.deps.joi.object().required().type(lib.odin.dataSource.Driver)
	});

	/**
		@protected
		@readonly
		@member {module:odin/dataSource.Driver}		module:odin/dataSource.DataSource#_driver
		@desc										Driver.
	*/
	Object.defineProperty(this, '_driver', {value:args.driver});
};

/**
	@abstract
	@desc												Returns the mapping with the provided name.
	@param {String} p_name								Mapping name.
	@returns {(module:odin/dataSource.Mapping|null)}	The mapping with the provided name.
	@throws {module:odin.Exception}						If the mapping is unknown.
*/
DataSource.prototype.mapping = function(p_name) {
	throw new lib.odin.Exception('Abstract method not implemented', {method:'mapping'});
};

/**
	@abstract
	@desc					Convenience method to synchronizes all the registered mappings to the data source (collections, indexes, foreign keys).
	@returns {Promise}		A promise for the operation completion.
*/
DataSource.prototype.sync = function() {
	return lib.deps.q.reject(new lib.odin.Exception('Abstract method not implemented', {method:'sync'}));
};

/**
	@desc					Closes this data source.
	@returns {Promise}		A promise for the operation completion.
*/
DataSource.prototype.close = function() {
	return this._driver.close();
};

module.exports = DataSource;