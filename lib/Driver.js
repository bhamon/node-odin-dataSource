'use strict';

let lib = {
	odin:{
		Exception:require('odin').Exception
	}
};

/**
	@class
	@classdesc		Data source.
	@alias			module:odin/dataSource.Driver
*/
class Driver {
	/**
		@abstract
		@desc								Returns the coerced raw type from a generic type.
		@param {String} p_type				Generic type.
		@returns {String}					The coerced raw type.
		@throws {module:odin.Exception}		If the given type is unknown or not supported.
		@see								module:odin/dataSource.Collection.FIELD_TYPES
		@example
			coerceType('string') === 'VARCHAR2'
	*/
	coerceType(p_type) {
		throw new lib.odin.Exception('Abstract method not implemented', {method:'coerceType'});
	};

	/**
		@abstract
		@desc											Returns a new converter for the specified raw type.
		@param {String} p_rawType						Raw type.
		@returns {module:odin/dataSource.Converter}		The new converter.
		@throws {module:odin.Exception}					If the raw type in invalid.
	*/
	createConverter(p_rawType) {
		throw new lib.odin.Exception('Abstract method not implemented', {method:'createConverter'});
	};

	/**
		@abstract
		@desc														Ensures the collection presence in the underlying data source.
																	If the collection doesn't exist, creates it.
		@param {module:odin/dataSource.Collection} p_collection		Collection.
		@returns {Promise}											A promise for the operation completion.
	*/
	ensureCollection(p_collection) {
		return Promise.reject(new lib.odin.Exception('Abstract method not implemented', {method:'ensureCollection'}));
	};

	/**
		@abstract
		@desc														Ensures the index presence in the underlying collection.
																	If the index doesn't exist, creates it.
		@param {module:odin/dataSource.CollectionIndex} p_index		Index.
		@returns {Promise}											A promise for the operation completion.
	*/
	ensureIndex(p_collection, p_index) {
		return Promise.reject(new lib.odin.Exception('Abstract method not implemented', {method:'ensureIndex'}));
	};

	/**
		@abstract
		@desc																Ensures the foreign key presence in the underlying collection.
																			If the foreign key doesn't exist, creates it.
		@param {module:odin/dataSource.CollectionIndex} p_foreignKey		Foreign key.
		@returns {Promise}													A promise for the operation completion.
	*/
	ensureForeignKey(p_collection, p_foreignKey) {
		return Promise.reject(new lib.odin.Exception('Abstract method not implemented', {method:'ensureForeignKey'}));
	};

	/**
		@abstract
		@desc															Finds documents via the provided query.
		@param {module:odin/dataSource.Query} p_query					Query.
		@returns {Promise.<module:odin/dataSource.Cursor.<Object>>}		A promise for a driver cursor.
	*/
	find(p_query) {
		return Promise.reject(new lib.odin.Exception('Abstract method not implemented', {method:'find'}));
	};

	/**
		@abstract
		@desc												Finds one document via the provided query.
		@param {module:odin/dataSource.Query} p_query		Query.
		@returns {Promise.<(Object|null)>}					A promise for a document, or null if not found.
	*/
	findOne(p_query) {
		return Promise.reject(new lib.odin.Exception('Abstract method not implemented', {method:'findOne'}));
	};

	/**
		@abstract
		@desc							Creates a document in the provided collection.
		@param {String} p_collection	Collection name.
		@param {Object} p_data			A key/value map of document data.
		@returns {Promise.<Object>}		A promise for the newly created document.
										The returned object may contain auto-generated fields (sequences).
	*/
	create(p_collection, p_data) {
		return Promise.reject(new lib.odin.Exception('Abstract method not implemented', {method:'create'}));
	};

	/**
		@abstract
		@desc							Saves a document in the provided collection.
		@param {String} p_collection	Collection name.
		@param {String} p_primaryKey	A key/value map of document fields involved in the primary key.
		@param {Object} p_data			A key/value map of document data to modify.
		@returns {Promise}				A promise for the operation completion.
	*/
	save(p_collection, p_primaryKey, p_data) {
		return Promise.reject(new lib.odin.Exception('Abstract method not implemented', {method:'save'}));
	};

	/**
		@abstract
		@desc							Removes a document in the provided collection.
		@param {String} p_collection	Collection name.
		@param {String} p_primaryKey	A key/value map of document fields involved in the primary key.
		@returns {Promise}				A promise for the operation completion.
	*/
	remove(p_collection, p_primaryKey) {
		return Promise.reject(new lib.odin.Exception('Abstract method not implemented', {method:'remove'}));
	};

	/**
		@abstract
		@desc					Commits the current transaction.
		@returns {Promise}		A promise for the operation completion.
	*/
	commit() {
		return Promise.reject(new lib.odin.Exception('Abstract method not implemented', {method:'commit'}));
	};

	/**
		@abstract
		@desc					Rollbacks the current transaction.
		@returns {Promise}		A promise for the operation completion.
	*/
	rollback() {
		return Promise.reject(new lib.odin.Exception('Abstract method not implemented', {method:'rollback'}));
	};

	/**
		@abstract
		@desc					Closes the driver.
		@returns {Promise}		A promise for the operation completion.
	*/
	close() {
		return Promise.reject(new lib.odin.Exception('Abstract method not implemented', {method:'close'}));
	};
}

module.exports = Driver;