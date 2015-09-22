'use strict';

let lib = {
	deps:{
		joi:require('joi')
	},
	odin:{
		util:require('odin').util,
		dataSource:{
			Converter:require('./Converter')
		}
	}
};

/**
	@class
	@classdesc		Collection field.
	@alias			module:odin/dataSource.CollectionField
*/
class CollectionField {
	/**
		@desc															Constructs a new collection field.
		@param {Object} p_config										Configuration set.
		@param {String} p_config.name									Field name.
		@param {String} p_config.type									Field type.
		@param {String} p_config.rawType								Field raw type.
		@param {module:odin/dataSource.Converter} p_config.converter	Field value converter.
		@param {Boolean} [p_config.primaryKey]							Field primary key state.
		@param {Boolean|String} [p_field.sequence]						Field sequence presence or name.
	*/
	constructor(p_config) {
		let config = lib.odin.util.validate(p_config, lib.deps.joi.object().required().keys({
			name:lib.deps.joi.string().required().min(1),
			type:lib.deps.joi.string().required().valid(CollectionField.TYPES),
			rawType:lib.deps.joi.string().required().min(1),
			converter:lib.deps.joi.object().required().instanceof(lib.odin.dataSource.Converter),
			primaryKey:lib.deps.joi.boolean().optional().default(false),
			sequence:[lib.deps.joi.boolean().optional().default(false), lib.deps.joi.string().required().min(1)]
		}));

		/**
			@readonly
			@member			{module:odin/dataSource.CollectionField#name}
			@desc			Field name.
		*/
		Object.defineProperty(this, 'name', {enumerable:true, value:config.name});

		/**
			@readonly
			@member			{module:odin/dataSource.CollectionField#type}
			@desc			Field type.
		*/
		Object.defineProperty(this, 'type', {enumerable:true, value:config.type});

		/**
			@readonly
			@member			{module:odin/dataSource.CollectionField#rawType}
			@desc			Field raw type.
		*/
		Object.defineProperty(this, 'rawType', {enumerable:true, value:config.rawType});

		/**
			@readonly
			@member			{module:odin/dataSource.CollectionField#converter}
			@desc			Field converter.
		*/
		Object.defineProperty(this, 'converter', {enumerable:true, value:config.converter});

		/**
			@readonly
			@member			{module:odin/dataSource.CollectionField#primaryKey}
			@desc			Field primary key status.
		*/
		Object.defineProperty(this, 'primaryKey', {enumerable:true, value:config.primaryKey});

		/**
			@readonly
			@member			{module:odin/dataSource.CollectionField#sequence}
			@desc			Field sequence status or name.
		*/
		Object.defineProperty(this, 'sequence', {enumerable:true, value:config.sequence});
	}
}

/**
	@constant
	@desc			String type.
	@type {String}
*/
CollectionField.TYPE_STRING = 'string';

/**
	@constant
	@desc			Float type.
	@type {String}
*/
CollectionField.TYPE_FLOAT = 'float';

/**
	@constant
	@desc			Double type.
	@type {String}
*/
CollectionField.TYPE_DOUBLE = 'double';

/**
	@constant
	@desc			Real type.
	@type {String}
*/
CollectionField.TYPE_REAL = 'real';

/**
	@constant
	@desc			Integer type.
	@type {String}
*/
CollectionField.TYPE_INTEGER = 'integer';

/**
	@constant
	@desc			Boolean type.
	@type {String}
*/
CollectionField.TYPE_BOOLEAN = 'boolean';

/**
	@constant
	@desc			Date type.
	@type {String}
*/
CollectionField.TYPE_DATE = 'date';

/**
	@constant
	@desc			Text type.
	@type {String}
*/
CollectionField.TYPE_TEXT = 'text';

/**
	@constant
	@desc			Binary type.
	@type {String}
*/
CollectionField.TYPE_BINARY = 'binary';

/**
	@constant
	@desc				Supported types.
	@type {String[]}
*/
CollectionField.TYPES = [
	CollectionField.TYPE_STRING,
	CollectionField.TYPE_FLOAT,
	CollectionField.TYPE_DOUBLE,
	CollectionField.TYPE_REAL,
	CollectionField.TYPE_INTEGER,
	CollectionField.TYPE_BOOLEAN,
	CollectionField.TYPE_DATE,
	CollectionField.TYPE_TEXT,
	CollectionField.TYPE_BINARY
];

module.exports = CollectionField;