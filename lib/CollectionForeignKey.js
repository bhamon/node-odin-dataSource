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
	@classdesc		Collection foreign key.
	@alias			module:odin/dataSource.CollectionForeignKey
*/
class CollectionForeignKey {
	/**
		@desc																		Constructs a new collection foreign key.
		@param {Object} p_config													Configuration set.
		@param {String} p_config.name												Foreign key name.
		@param {String} p_config.field												Foreign key source field.
		@param {Object} p_config.target												Foreign key target field.
		@param {module:odin/dataSource.Collection} p_config.target.collection		Collection.
		@param {String} p_config.target.field										Field name.
	*/
	constructor(p_config) {
		let config = lib.odin.util.validate(p_config, lib.deps.joi.object().required().keys({
			name:lib.deps.joi.string().optional().min(1),
			field:lib.deps.joi.string().required().min(1),
			target:lib.deps.joi.object().required().keys({
				collection:lib.deps.joi.object().required().type(lib.odin.dataSource.Collection),
				field:lib.deps.joi.string().required().min(1)
			})
		}));

		/**
			@readonly
			@member			{module:odin/dataSource.CollectionForeignKey#name}
			@desc			Foreign key name.
		*/
		Object.defineProperty(this, 'name', {enumerable:true, value:config.name});

		/**
			@readonly
			@member			{module:odin/dataSource.CollectionForeignKey#type}
			@desc			Foreign key source field.
		*/
		Object.defineProperty(this, 'field', {enumerable:true, value:config.type});

		/**
			@readonly
			@member			{module:odin/dataSource.CollectionForeignKey#target}
			@desc			Foreign key target (collection / field).
		*/
		Object.defineProperty(this, 'target', {enumerable:true, value:config.target});
		Object.freeze(this.target);
	}
}

module.exports = CollectionForeignKey;

lib.odin.dataSource = {
	Collection:require('./Collection')
};