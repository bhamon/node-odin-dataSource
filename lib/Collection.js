'use strict';

let lib = {
	deps:{
		joi:require('joi')
	},
	odin:{
		Exception:required('odin').Exception,
		util:required('odin').util,
		dataSource:{
			CollectionField:require('./CollectionField'),
			CollectionIndex:require('./CollectionIndex'),
			CollectionForeignKey:require('./CollectionForeignKey')
		}
	}
};

/**
	@class
	@classdesc							Collection.
	@alias								module:odin/dataSource.Collection
*/
class Collection {
	/**
		@desc								Constructs a new collection.
		@param {String} p_name				Collection name.
		@throws {module:odin.Exception}		If a parameter is invalid.
	*/
	constructor() {
		lib.odin.util.validate(p_name, lib.deps.joi.string().required().min(1));

		/**
			@readonly
			@member {String}	module:odin/dataSource.Collection#name
			@desc				Collection name.
		*/
		Object.defineProperty(this, 'name', {enumerable:true, value:p_name});

		/**
			@private
			@readonly
			@member {Map.<String, module:odin/dataSource.CollectionField>}		module:odin/dataSource.Collection#_fields
			@desc																Collection fields.
		*/
		Object.defineProperty(this, '_fields', {value:new Map()});

		/**
			@private
			@readonly
			@member {Map.<String, module:odin/dataSource.CollectionIndex>}		module:odin/dataSource.Collection#_indexes
			@desc																Collection indexes.
		*/
		Object.defineProperty(this, '_indexes', {value:new Map()});

		/**
			@private
			@readonly
			@member {Map.<String, module:odin/dataSource.CollectionForeignKey>}		module:odin/dataSource.Collection#_foreignKeys
			@desc																	Collection foreign keys.
		*/
		Object.defineProperty(this, '_foreignKeys', {value:new Map()});
	}

	/**
		@readonly
		@member {Array.<module:odin/dataSource.CollectionField>}		module:odin/dataSource.Collection#fields
		@desc															Collection fields.
	*/
	get fields() {
		return Array.from(this._fields.values());
	}

	/**
		@readonly
		@member {Array.<module:odin/dataSource.CollectionIndex>}		module:odin/dataSource.Collection#indexes
		@desc															Collection indexes.
	*/
	get indexes() {
		return Array.from(this._indexes.values());
	}

	/**
		@readonly
		@member {Array.<module:odin/dataSource.CollectionForeignKey>}		module:odin/dataSource.Collection#foreignKeys
		@desc																Collection foreign keys.
	*/
	get foreignKeys() {
		return Array.from(this._foreignKeys.values());
	}

	/**
		@desc						Returns whether the field with the provided name exists or not.
		@param {String} p_name		Field name.
		@returns					The field presence.
	*/
	hasField(p_name) {
		return this._fields.has(p_name);
	}

	/**
		@desc								Returns the field with the provided name.
		@param {String} p_name				Field name.
		@returns {Object}					The field.
		@throws {module:odin.Exception}		If the field doesn't exist.
	*/
	getField(p_name) {
		let field = this._fields.get(p_name);
		if(!field) {
			throw new lib.odin.Exception('Field not found', {field:p_name});
		}

		return field;
	}

	/**
		@desc						Adds a field to this collection.
		@param {Object} p_field		Field descriptor.
	*/
	addField(p_field) {
		let field = new lib.odin.dataSource.CollectionField(p_field);
		if(this._fields.has(field.name)) {
			throw new lib.odin.Exception('Field already present in collection', {collection:this.name, field:field.name});
		}

		this._fields.set(field.name, field);
	}

	/**
		@desc						Returns the index with the provided name.
		@param {String} p_name		Index name.
		@returns {Object}			The index with the provided name.
	*/
	getIndex(p_name) {
		let index = this._indexes.get(p_name);
		if(!index) {
			throw new lib.odin.Exception('Index not found', {index:p_name});
		}

		return index;
	}

	/**
		@desc						Add the provided index to the collection.
		@param {Object} p_index		Index descriptor.
	*/
	addIndex(p_index) {
		let index = new lib.odin.dataSource.CollectionIndex(p_index);
		if(!index.name) {
			index.name = this.name + '.' + index.fields.join('.');
		}

		if(this._indexes.has(index.name)) {
			throw new lib.odin.Exception('Index already present in collection', {collection:this.name, index:index.name});
		}

		this._indexes.set(index.name, index);
	}

	/**
		@desc						Returns the foreign key with the provided name.
		@param {String} p_name		Foreign key name.
		@returns {Object}			The foreign key with the provided name.
	*/
	getForeignKey(p_name) {
		let foreignKey = this._foreignKeys.get(p_name);
		if(!foreignKey) {
			throw new lib.odin.Exception('Foreign key not found', {foreignKey:p_name});
		}

		return foreignKey;
	}

	/**
		@desc								Add the provided foreign key to the collection.
		@param {Object} p_foreignKey		Foreign key descriptor.
	*/
	addForeignKey(p_foreignKey) {
		let foreignKey = new lib.odin.dataSource.CollectionForeignKey(p_foreignKey);
		if(!foreignKey.name) {
			foreignKey.name = this.name + '.' + foreignKey.fields.join('.');
		}

		if(this._foreignKeys.has(field.name)) {
			throw new lib.odin.Exception('Foreign key already present in collection', {collection:this.name, foreignKey:foreignKey.name});
		}

		this._foreignKeys.set(foreignKey.name, foreignKey);
	}
}

module.exports = Collection;