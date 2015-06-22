'use strict';

var lib = {
	deps:{
		q:require('q')
	},
	odin:{
		Exception:require('odin').Exception
	}
};

/**
	@class
	@classdesc		Data source.
	@alias			module:odin/dataSource.Driver

	@desc			Constructs a new data source.
*/
function Driver() {
};

/**
	@abstract
	@desc								Returns the coerced raw type from a generic type.
	@param {String} p_type				Generic type.
	@returns {String}					The coerced raw type.
	@throws {module:odin.Exception}		If the given type is unknown or not supported.
	@see								module:odin/dataSource.Mapping.FIELD_TYPES
	@example
		coerceType('string') === 'VARCHAR2'
*/
Driver.prototype.coerceType = function(p_type) {
	throw new lib.odin.Exception('Abstract method not implemented', {method:'coerceType'});
};

/**
	@abstract
	@desc											Returns a new converter for the specified raw type.
	@param {String} p_rawType						Raw type.
	@returns {module:odin/dataSource.Converter}		The new converter.
	@throws {module:odin.Exception}					If the raw type in invalid.
*/
Driver.prototype.createConverter = function(p_rawType) {
	throw new lib.odin.Exception('Abstract method not implemented', {method:'createConverter'});
};

/**
	@abstract
	@desc											Ensures the collection presence in the underlying data source.
													If the collection doesn't exist, creates it.
	@param {String} p_collection					Collection name.
	@param {Object[]} p_fields						Collection fields array.
	@param {String} p_fields.name					Field name.
	@param {String} p_fields.rawType				Field coerced raw type.
	@param {Boolean} p_fields.primaryKey			Primary key flag.
	@param {(String|Boolean)} p_fields.sequence		Sequence flag or name.
	@returns {Promise}								A promise for the operation completion.
*/
Driver.prototype.ensureCollection = function(p_collection, p_fields) {
	return lib.deps.q.fail(new lib.odin.Exception('Abstract method not implemented', {method:'ensureCollection'}));
};

/**
	@abstract
	@desc									Ensures the index presence in the underlying collection.
											If the index doesn't exist, creates it.
	@param {String} p_collection			Collection name.
	@param {Object} p_index					Index descriptor.
	@param {String} p_index.name			Index name.
	@param {Object[]} p_index.fields		Fields involved in the index.
	@param {String} p_index.fields.name		Field name.
	@param {String} p_index.fields.order	Field order (one of {@link module:odin/dataSource.Mapping.ORDERS}.
	@param {Boolean} p_index.unique			Index uniqueness.
	@returns {Promise}						A promise for the operation completion.
*/
Driver.prototype.ensureIndex = function(p_collection, p_index) {
	return lib.deps.q.fail(new lib.odin.Exception('Abstract method not implemented', {method:'ensureIndex'}));
};

/**
	@abstract
	@desc								Ensures the foreign key presence in the collection.
										If the foreign key doesn't exist, creates it.
	@param {String} p_source			Source collection name.
	@param {String} p_target			Target collection name.
	@param {Object[]} p_fields			Fields involved in the foreign key (on both ends).
	@param {String} p_fields.source		Source field name.
	@param {String} p_fields.target		Target field name.
	@returns {Promise}					A promise for the operation completion.
*/
Driver.prototype.ensureForeignKey = function(p_source, p_target, p_fields) {
	return lib.deps.q.fail(new lib.odin.Exception('Abstract method not implemented', {method:'ensureForeignKey'}));
};

/**
	@abstract
	@desc															Finds documents in the provided collection.
	@param {String} p_collection									Collection name.
	@param {Object} p_query											A data source parsed query ({@link module:odin/dataSource.Mapping#_parseQuery}).
	@param {Object} p_options										Find options.
	@param {Number} [p_options.skip]								Number of documents to skip.
	@param {Number} [p_options.limit]								Maximum number of documents to fetch.
	@param {Object[]} [p_options.orderBy]							Order clause.
	@param {String} p_options.orderBy.field							Field name.
	@param {String} p_options.orderBy.order							Order (one of {@link module:odin/dataSource.Mapping.ORDERS}).
	@returns {Promise.<module:odin/dataSource.Cursor.<Object>>}		A promise for a driver cursor.
*/
Driver.prototype.find = function(p_collection, p_query, p_options) {
	return lib.deps.q.fail(new lib.odin.Exception('Abstract method not implemented', {method:'find'}));
};

/**
	@abstract
	@desc									Finds one document in the provided collection.
	@param {String} p_collection			Collection name.
	@param {Object} p_query					A data source parsed query ({@link module:odin/dataSource.Mapping#_parseQuery}).
	@returns {Promise.<(Object|null)>}		A promise for a document, or null if not found.
*/
Driver.prototype.findOne = function(p_collection, p_query) {
	return lib.deps.q.fail(new lib.odin.Exception('Abstract method not implemented', {method:'findOne'}));
};

/**
	@abstract
	@desc							Creates a document in the provided collection.
	@param {String} p_collection	Collection name.
	@param {Object} p_data			A key/value map of document data.
	@returns {Promise.<Object>}		A promise for the newly created document.
									The returned object may contain auto-generated fields (sequences).
*/
Driver.prototype.create = function(p_collection, p_data) {
	return lib.deps.q.fail(new lib.odin.Exception('Abstract method not implemented', {method:'create'}));
};

/**
	@abstract
	@desc							Saves a document in the provided collection.
	@param {String} p_collection	Collection name.
	@param {String} p_primaryKey	A key/value map of document fields involved in the primary key.
	@param {Object} p_data			A key/value map of document data to modify.
	@returns {Promise}				A promise for the operation completion.
*/
Driver.prototype.save = function(p_collection, p_primaryKey, p_data) {
	return lib.deps.q.fail(new lib.odin.Exception('Abstract method not implemented', {method:'save'}));
};

/**
	@abstract
	@desc							Removes a document in the provided collection.
	@param {String} p_collection	Collection name.
	@param {String} p_primaryKey	A key/value map of document fields involved in the primary key.
	@returns {Promise}				A promise for the operation completion.
*/
Driver.prototype.remove = function(p_collection, p_primaryKey) {
	return lib.deps.q.fail(new lib.odin.Exception('Abstract method not implemented', {method:'remove'}));
};

/**
	@abstract
	@desc					Commits the current transaction.
	@returns {Promise}		A promise for the operation completion.
*/
Driver.prototype.commit = function() {
	return lib.deps.q.fail(new lib.odin.Exception('Abstract method not implemented', {method:'commit'}));
};

/**
	@abstract
	@desc					Rollbacks the current transaction.
	@returns {Promise}		A promise for the operation completion.
*/
Driver.prototype.rollback = function() {
	return lib.deps.q.fail(new lib.odin.Exception('Abstract method not implemented', {method:'rollback'}));
};

/**
	@abstract
	@desc					Closes the driver.
	@returns {Promise}		A promise for the operation completion.
*/
Driver.prototype.close = function() {
	return lib.deps.q.fail(new lib.odin.Exception('Abstract method not implemented', {method:'close'}));
};

module.exports = Driver;