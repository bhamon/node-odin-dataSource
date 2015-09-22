'use strict';

let lib = {
	deps:{
		joi:require('joi')
	},
	odin:{
		Exception:require('odin').Exception,
		util:require('odin').util,
		dataSource:{
			Collection:require('odin-dataSource').Collection
		}
	}
};

/**
	@class
	@classdesc		Physical schema of a data source.
	@alias			module:odin/dataSource.Schema
*/
class Schema {
	/**
		@desc			Constructs a new physical schema.
	*/
	constructor() {
		/**
			@private
			@member {Object}	module:odin/dataSource.Schema#_collections
			@desc				Collections map.
		*/
		Object.defineProperty(this, '_collections', {value:new Map()});
	}

	/**
		@member		{module:odin/dataSource.Schema#collections}
		@desc		The collections map.
	*/
	get collections() {
		return new Map(this._collections);
	}

	/**
		@desc											Returns the collection with the provided name.
		@param {String} p_name							Collection name.
		@returns {module:odin/dataSource.Collection}	The collection.
		@throws {module:odin.Exception}					If the collection doesn't exists.
	*/
	getCollection(p_name) {
		let collection = this._collections.get(p_name);
		if(!collection) {
			throw new lib.odin.Exception('Collection not found', {collection:p_name});
		}

		return collection;
	}

	/**
		@desc														Adds the provided collection to this store.
		@param {module:odin/dataSource.Collection} p_collection		Collection.
		@throws {module:odin.Exception}								If a validation error occurs.
	*/
	addCollection(p_collection) {
		lib.odin.util.validate(p_collection, lib.deps.joi.object().required().type(lib.odin.dataSource.Collection));
		this._collections.set(p_collection.name, p_collection);
	}

	/**
		@desc												Synchronizes the collections to the datasource via the provided driver.
		@param {module:odin/dataSource.Driver} p_driver		Driver.
		@return {Promise}									A promise for the operation completion.
	*/
	sync(p_driver) {
		return Promise.all(Array.from(this._collections, function(p_collection) {
			return p_driver.ensureCollection(p_collection);
			//TODO: ensureIndex
			//TODO: collect foreign keys and call ensureForeignKey at the end
		}));
	}
}

module.exports = Schema;