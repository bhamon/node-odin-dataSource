'use strict';

var lib = {
	deps:{
		joi:require('joi')
	},
	odin:{
		Exception:required('odin').Exception,
		util:required('odin').util,
		dataSource:{
			Converter:require('odin-dataSource').Converter
		}
	}
};

/**
	@class
	@classdesc							Collection.
	@alias								module:odin/dataSource.Collection

	@desc								Constructs a new collection.
	@param {String} p_name				Collection name.
	@throws {module:odin.Exception}		If a parameter is invalid.
*/
function Collection(p_name) {
	lib.odin.util.validate(p_name, lib.deps.joi.string().required().min(1));

	Object.defineProperty(this, 'name', {enumerable:true, value:p_name});
	Object.defineProperty(this, '_fields', {value:{}});
	Object.defineProperty(this, '_indexes', {value:{}});
	Object.defineProperty(this, '_foreignKeys', {value:{}});
};

/**
	@constant
	@desc			String type.
	@type {String}
*/
Collection.FIELD_TYPE_STRING = 'string';

/**
	@constant
	@desc			Float type.
	@type {String}
*/
Collection.FIELD_TYPE_FLOAT = 'float';

/**
	@constant
	@desc			Double type.
	@type {String}
*/
Collection.FIELD_TYPE_DOUBLE = 'double';

/**
	@constant
	@desc			Real type.
	@type {String}
*/
Collection.FIELD_TYPE_REAL = 'real';

/**
	@constant
	@desc			Integer type.
	@type {String}
*/
Collection.FIELD_TYPE_INTEGER = 'integer';

/**
	@constant
	@desc			Boolean type.
	@type {String}
*/
Collection.FIELD_TYPE_BOOLEAN = 'boolean';

/**
	@constant
	@desc			Date type.
	@type {String}
*/
Collection.FIELD_TYPE_DATE = 'date';

/**
	@constant
	@desc			Text type.
	@type {String}
*/
Collection.FIELD_TYPE_TEXT = 'text';

/**
	@constant
	@desc			Binary type.
	@type {String}
*/
Collection.FIELD_TYPE_BINARY = 'binary';

/**
	@constant
	@desc				Supported types.
	@type {String[]}
*/
Collection.FIELD_TYPES = [
	Collection.FIELD_TYPE_STRING,
	Collection.FIELD_TYPE_FLOAT,
	Collection.FIELD_TYPE_DOUBLE,
	Collection.FIELD_TYPE_REAL,
	Collection.FIELD_TYPE_INTEGER,
	Collection.FIELD_TYPE_BOOLEAN,
	Collection.FIELD_TYPE_DATE,
	Collection.FIELD_TYPE_TEXT,
	Collection.FIELD_TYPE_BINARY
];

/**
	@desc						Returns whether the fiel with the provided name exists or not.
	@param {String} p_name		Field name.
	@returns					The field presence.
*/
Collection.prototype.hasField = function(p_name) {
	return !!this._fields[p_name];
};

/**
	@desc								Returns the field with the provided name.
	@param {String} p_name				Field name.
	@returns {Object}					The field.
	@throws {module:odin.Exception}		If the field doesn't exist.
*/
Collection.prototype.getField = function(p_name) {
	var field = this._fields[p_name];
	if(!field) {
		throw new lib.odin.Exception('Field not found', {field:p_name});
	}

	return field;
};

/**
	@desc															Adds a field to this collection.
	@param {Object} p_field											Field descriptor.
	@param {String} p_field.name									Field name.
	@param {String} p_field.type									Field type.
	@param {String} p_field.rawType									Field raw type.
	@param {module:odin/dataSource.Converter} p_field.converter		Field value converter.
	@param {Boolean} p_field.primaryKey								Field primary key state.
	@param {Boolean|String} p_field.sequence						Field sequence presence or name.
*/
Collection.prototype.addField = function(p_field) {
	var field = lib.odin.util.validate(p_field, lib.deps.joi.object().required().keys({
		name:lib.deps.joi.string().required().min(1),
		type:lib.deps.joi.string().required().valid(Collection.FIELD_TYPES),
		rawType:lib.deps.joi.string().required().min(1),
		converter:lib.deps.joi.object().required().instanceof(lib.odin.dataSource.Converter),
		primaryKey:lib.deps.joi.boolean().optional().default(false),
		sequence:[lib.deps.joi.boolean().optional().default(false), lib.deps.joi.string().required().min(1)]
	}));

	if(this._fields[field.name]) {
		throw new lib.odin.Exception('Field already present in collection', {collection:this.name, field:field.name});
	}

	Object.freeze(field);
	this._fields[field.name] = field;
};

/**
	@desc						Returns the index with the provided name.
	@param {String} p_name		Index name.
	@returns {Object}			The index with the provided name.
*/
Collection.prototype.getIndex = function(p_name) {
	var index = this._indexes[p_name];
	if(!index) {
		throw new lib.odin.Exception('Index not found', {index:p_name});
	}

	return index;
};

/**
	@desc									Add the provided index to the collection.
	@param {Object} p_index					Index configuration set.
	@param {String} [p_index.name]			Index name.
	@param {String[]} p_index.fields		Index fields.
	@param {Boolean} p_index.unique			Index uniqueness.
*/
Collection.prototype.addIndex = function(p_index) {
	var index = lib.odin.util.validate(p_index, lib.deps.joi.object().required().keys({
		name:lib.deps.joi.string().optional().min(1),
		fields:lib.deps.joi.array().required().items(lib.deps.joi.string().min(1)).min(1),
		unique:lib.deps.joi.boolean().optional().default(false)
	}));

	if(!index.name) {
		index.name = this.name + '.' + index.fields.join('.');
	}

	Object.freeze(index);
	this._indexes[index.name] = index;
};

/**
	@desc						Returns the foreign key with the provided name.
	@param {String} p_name		Foreign key name.
	@returns {Object}			The foreign key with the provided name.
*/
Collection.prototype.getForeignKey = function(p_name) {
	var foreignKey = this._foreignKeys[p_name];
	if(!foreignKey) {
		throw new lib.odin.Exception('Foreign key not found', {foreignKey:p_name});
	}

	return foreignKey;
};

/**
	@desc																			Add the provided foreign key to the collection.
	@param {Object} p_foreignKey													Foreign key configuration set.
	@param {String} p_foreignKey.name												Foreign key name.
	@param {String} p_foreignKey.field												Foreign key local field.
	@param {Object} p_foreignKey.target												Foreign key target field.
	@param {module:odin/dataSource.Collection} p_foreignKey.target.collection		Collection.
	@param {String} p_foreignKey.target.field										Field name.
*/
Collection.prototype.addForeignKey = function(p_foreignKey) {
	var foreignKey = lib.odin.util.validate(p_foreignKey, lib.deps.joi.object().required().keys({
		name:lib.deps.joi.string().optional().min(1),
		field:lib.deps.joi.string().required().min(1),
		target:lib.deps.joi.object().required().keys({
			collection:lib.deps.joi.object().required().type(Collection),
			field:lib.deps.joi.string().required().min(1)
		})
	}));

	if(!foreignKey.name) {
		foreignKey.name = this.name + '.' + foreignKey.fields.join('.');
	}

	Object.freeze(foreignKey);
	this._foreignKeys[foreignKey.name] = foreignKey;
};

module.exports = Collection;