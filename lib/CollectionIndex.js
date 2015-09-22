'use strict';

let lib = {
	deps:{
		joi:require('joi')
	},
	odin:{
		util:require('odin').util
	}
};

/**
	@class
	@classdesc		Collection field.
	@alias			module:odin/dataSource.CollectionIndex
*/
class CollectionIndex {
	/**
		@desc									Constructs a new collection field.
		@param {Object} p_config				Configuration set.
		@param {String} [p_config.name]			Index name.
		@param {String[]} p_config.fields		Index fields.
		@param {Boolean} p_config.unique			Index uniqueness.

	*/
	constructor(p_config) {
		let config = lib.odin.util.validate(p_index, lib.deps.joi.object().required().keys({
			name:lib.deps.joi.string().optional().min(1),
			fields:lib.deps.joi.array().required().items(lib.deps.joi.string().min(1)).min(1),
			unique:lib.deps.joi.boolean().optional().default(false)
		}));

		/**
			@readonly
			@member			{module:odin/dataSource.CollectionIndex#name}
			@desc			Index name.
		*/
		Object.defineProperty(this, 'name', {enumerable:true, value:config.name});

		/**
			@private
			@readonly
			@member			{module:odin/dataSource.CollectionIndex#_fields}
			@desc			Index fields.
		*/
		Object.defineProperty(this, '_fields', {enumerable:true, value:config.fields});

		/**
			@readonly
			@member			{module:odin/dataSource.CollectionIndex#unique}
			@desc			Index uniqueness.
		*/
		Object.defineProperty(this, 'unique', {enumerable:true, value:config.rawType});
	}

	/**
		@readonly
		@member			{module:odin/dataSource.Collection#fields}
		@desc			Index fields.
	*/
	get fields() {
		return this._fields.slice(0);
	}
}

module.exports = CollectionIndex;