'use strict';

let lib = {
	deps:{
		joi:require('joi')
	},
	odin:{
		util:require('odin').util,
		Exception:require('odin').Exception,
		dataSource:{
			Driver:require('./Driver'),
			Schema:require('./Schema'),
			Collection:require('./Collection'),
			Query:require('./Query')
		}
	}
};

/**
	@private
	@constant
	@desc						Query operators set.
	@type {Set.<String>}
*/
var QUERY_OPERATORS_SET = new Set(Query.OPERATORS);

/**
	@class
	@classdesc		Mapping for a model.
	@alias			module:odin/dataSource.Mapping
*/
class Mapping {
	/**
		@desc														Constructs a new mapping for the provided model.
		@param {Object} p_config									Configuration set.
		@param {Function} p_config.model							Model.
		@param {module:odin/dataSource.Driver} p_config.driver		Driver instance.
		@param {module:odin/dataSource.Schema} p_config.schema		Data source schema.
		@throws {module:odin.Exception}								If a parameter is invalid.
	*/
	constructor(p_config) {
		var args = lib.odin.util.validate(p_config, {
			model:lib.deps.joi.func().required(),
			driver:lib.deps.joi.object().required().type(lib.odin.dataSource.Driver),
			schema:lib.deps.joi.object().required().type(lib.odin.dataSource.Schema)
		});

		/**
			@protected
			@readonly
			@member {Function}		module:odin/dataSource.Mapping#_model
			@desc					Model.
		*/
		Object.defineProperty(this, '_model', {value:args.model});

		/**
			@protected
			@readonly
			@member {module:odin/dataSource.Driver}		module:odin/dataSource.Mapping#_driver
			@desc										Driver instance.
		*/
		Object.defineProperty(this, '_driver', {value:args.driver});

		/**
			@protected
			@readonly
			@member {module:odin/dataSource.Schema}		module:odin/dataSource.Mapping#_schema
			@desc										Data source schema.
		*/
		Object.defineProperty(this, '_schema', {value:args.schema});
	}

	/**
		@protected
		@desc																Helper method to augment a provided field configuration set to fill the gaps.
		@param {Object} p_field												Field configuration set.
		@param {String} p_field.type										Field type.
		@param {String} [p_field.rawType]									Field raw type. Coerced from the provided type if not specified.
		@param {module:odin/dataSource.Converter} [p_field.converter]		Field converter. Created from the raw type if not provided.
		@returns {Object}													Augmented field configuration set.
	*/
	_augmentField(p_field) {
		var field = lib.odin.util.validate(p_field, {
			type:lib.deps.joi.string().required().valid(lib.odin.dataSource.Collection.FIELD_TYPES),
			rawType:lib.deps.joi.string().optional().min(1),
			converter:lib.deps.joi.object().optional().instanceof(lib.odin.dataSource.Converter)
		}, {
			allowUnknown:true
		});

		if(!field.rawType) {
			field.rawType = this._driver.coerceType(field.type);
		}

		if(!field.converter) {
			field.converter = this._driver.createConverter(field.rawType);
		}

		return field;
	}

	/**
		@protected
		@abstract
		@desc										Creates and initializes a new query to give to the underlying driver.
		@returns {module:odin/dataSource.Query}		The newly created query.
	*/
	_createQuery() {
		throw new lib.odin.Exception('Abstract method not implemented', {method:'_createQuery'});
	}

	/**
		@protected
		@callback											module:odin/dataSource.Mapping~userQueryTranslator
		@desc												Translates the field operation and register it into the provided query object.
		@param {module:odin/dataSource.Query} p_query		Query to fill.
		@param {String} p_field								Field name.
		@param {String} p_operator							Operator.
		@param p_data										Operation data.
	*/
	/**
		@protected
		@desc																		Helper method to parse a human-written query in a normalized way.
																					The fields names are model-to-mapping translated.
																					The right-values are model-to-mapping converted.
		@param {Object} p_userQuery													User query.
		@param {Object} p_options													Options map.
		@param {Number} [p_options.skip]											Number of objects to skip.
		@param {Number} [p_options.limit]											Maximum number of objects to fetch.
		@param {Array.<Object>} [p_options.orderBy]									Order clause.
		@param {String} p_options.orderBy.field										Field name.
		@param {String} p_options.orderBy.order										Order (one of {@link module:odin/dataSource.Mapping.ORDERS}).
		@param {module:odin/dataSource.Mapping~userQueryTranslator} p_translator	Field operation translator.
		@returns {module:odin/dataSource.Query}										The parsed query.
		@throws {module:odin.Exception}												If a parsing error occurs.
		@example
			User query:
			{
				id:21,
				name:{$eq:'test'},
				$or:[{exp1}, {exp2}],
				rights:{$in:[], $regex:/^[a-z]+$/},
				$and:[
					{field:'value'}
				]
			}
	*/
	_parseUserQuery(p_userQuery, p_options, p_translator) {
		let args = lib.odin.util.validate({
			userQuery:p_userQuery,
			options:p_options,
			translator:p_translator
		}, {
			userQuery:lib.deps.joi.object().required(),
			options:lib.deps.joi.object().required().keys({
				skip:lib.deps.joi.number().optional().default(0).integer().min(0),
				limit:lib.deps.joi.number().optional().default(0).integer().min(-1),
				orderBy:lib.deps.joi.array().optional().default([]).items({
					field:lib.deps.joi.string().required().min(1),
					order:lib.deps.joi.string().optional().default(lib.odin.dataSource.Query.ORDER_ASC).valid(lib.odin.dataSource.Query.ORDERS)
				})
			}),
			translator:lib.deps.joi.func().required()
		});

		let query = this._createQuery();
		query.where();

		this._parseUserQueryExpression(query, args.userQuery, args.translator);

		query.skip(args.options.skip);
		query.limit(args.options.limit);

		for(let order of args.options.orderBy) {
			query.orderBy(order.field, order.order);
		}

		return query;
	}

	/**
		@private
		@desc																		Parses a query expression.
		@param {module:odin/dataSource.Query} p_query								Query to fill.
		@param {module:odin/dataSource.Mapping~userQueryTranslator} p_translator	Field operation translator.
		@param {Object} p_expression												User query expression.
		@param {String} [p_field]													Branch field.
		@throws {module:odin.Exception}												If a parsing error occurs.
	*/
	_parseUserQueryExpression(p_query, p_translator, p_expression, p_field) {
		lib.odin.util.validate(p_userQuery, lib.deps.joi.object().required());

		for(var key in p_expression) {
			var data = p_expression[key];
			if(key in QUERY_OPERATORS_SET) {
				this._parseUserQueryOperation(p_query, key, data, p_field);
			} else {
				if(p_field) {
					throw new lib.odin.Exception('Only one field authorized per tree branch', {
						branchField:p_field,
						field:key
					});
				}

				if(typeof data != 'object') {
					self._parseUserQueryOperation(p_query, Mapping.QUERY_OPERATOR_EQUAL, data, key);
				} else {
					self._parseUserQueryOperation(p_query, Mapping.QUERY_OPERATOR_AND, data, key);
				}
			}
		}
	}

	/**
		@private
		@desc																		Parses a query operation.
		@param {module:odin/dataSource.Query} p_query								Query to fill.
		@param {module:odin/dataSource.Mapping~userQueryTranslator} p_translator	Field operation translator.
		@param {Object} p_operation													User query operation.
		@param {Object} p_data														Operation data.
		@param {String} [p_field]													Branch field.
		@returns {Object}															The parsed operation.
		@throws {module:odin.Exception}												If a parsing error occurs.
	*/
	_parseUserQueryOperation(p_query, p_translator, p_operator, p_data, p_field) {
		switch(p_operator) {
			case Mapping.QUERY_OPERATOR_AND:
				lib.odin.util.validate(p_data, lib.deps.joi.array().required().items(lib.deps.joi.object()));
				p_query.and();
				this._parseUserQueryExpression(p_query, p_expression, p_field);
				p_query.end();
			break;
			case Mapping.QUERY_OPERATOR_OR:
				lib.odin.util.validate(p_data, lib.deps.joi.array().required().items(lib.deps.joi.object()));
				p_query.or();
				this._parseUserQueryExpression(p_query, p_expression, p_field);
				p_query.end();
			break;
			case Mapping.QUERY_OPERATOR_NOT:
				p_query.not();
				this._parseUserQueryExpression(p_query, p_expression, p_field);
				p_query.end();
			break;
			case Mapping.QUERY_OPERATOR_EQUAL:
			case Mapping.QUERY_OPERATOR_NOT_EQUAL:
			case Mapping.QUERY_OPERATOR_LESS_THAN:
			case Mapping.QUERY_OPERATOR_LESS_THAN_OR_EQUAL:
			case Mapping.QUERY_OPERATOR_GREATER_THAN:
			case Mapping.QUERY_OPERATOR_GREATER_THAN_OR_EQUAL:
			case Mapping.QUERY_OPERATOR_IN:
			case Mapping.QUERY_OPERATOR_NOT_IN:
				if(!p_field) {
					throw new lib.odin.Exception('Field required for this operation', {operator:p_operator});
				}

				p_translator(p_query, p_field, p_operator, p_data);
			break;
			default:
				throw new lib.odin.Exception('Unknown operator', {operator:p_operator});
		}
	}

	/**
		@private
		@desc													Converts the provided data with the specified conversion method.
		@param {Map.<String, Map.<Strig, String>>} p_data		Data map.
		@param {String} p_method								Conversion method.
		@returns {Object}										The converted data.
	*/
	_convert(p_data, p_method) {
		let result = new Map();
		for(let collectionEntry of p_data) {
			let resultCollection = new Map();
			let collection = this._schema.getCollection(collectionEntry[0]);
			for(let fieldEntry of collectionEntry[1]) {
				let field = collection.getField(fieldEntry[0]);
				for(let data of fieldEntry[1]) {
					resultCollection.set(field.name, field.converter.to(data));
				}
			}

			result.set(collection.name, resultCollection);
		}

		return result;
	}

	/**
		@protected
		@desc													Converts the provided data to the data source format.
		@param {Map.<String, Map.<Strig, String>>} p_data		Data map.
		@returns {Object}										The converted data.
	*/
	_convertTo(p_data) {
		return this._convert(p_data, 'to');
	}

	/**
		@protected
		@desc												Converts the provided data from the data source format.
		@param {Object} p_data								Data map.
		@returns {Map.<String, Map.<Strig, String>>}		The converted data.
	*/
	_convertFrom(p_data) {
		return this._convert(p_data, 'from');
	}

	/**
		@protected
		@abstract
		@desc													Constructs a model instance from the provided data map.
		@param {Map.<String, Map.<Strig, String>>} p_data		Data map.
		@returns {module:odin.Model}
	*/
	_build(p_data) {
		throw new lib.odin.Exception('Abstract method not implemented', {method:'_build'});
	}

	/**
		@protected
		@desc																Decorates the provided cursor to provide auto-conversion facility.
		@param {module:odin/dataSource.Cursor.<Object>} p_cursor			The original cursor.
		@returns {module:odin/dataSource.Cursor.<module:odin.Model>}		The decorated cursor.
	*/
	_decorateCursor(p_cursor) {
		var self = this;
		p_cursor.next = function() {
			p_cursor.next()
			.then(function(p_data) {
				if(p_data === null) {
					return null;
				}

				return self._build(self._convertFrom(p_data));
			});
		};

		return p_cursor;
	}

	/**
		@abstract
		@desc																		Finds model instances.
		@param {Object} p_query														A data source query ({@link module:odin/dataSource.Mapping#_parseUserQuery}).
		@param {Object} p_options													Find options.
		@param {Number} [p_options.skip]											Number of objects to skip.
		@param {Number} [p_options.limit]											Maximum number of objects to fetch.
		@param {Object[]} [p_options.orderBy]										Order clause.
		@param {String} p_options.orderBy.field										Field name.
		@param {String} p_options.orderBy.order										Order (one of {@link module:odin/dataSource.Mapping.ORDERS}).
		@returns {Promise.<module:odin/dataSource.Cursor.<module:odin.Model>>}		A promise for a cursor of model instances.
	*/
	// TODO: use the Query object instead of a plain object to parse
	find(p_query, p_options) {
		throw new lib.odin.Exception('Abstract method not implemented', {method:'find'});
	}

	/**
		@abstract
		@desc												Finds one model instance.
		@param {Object} p_query								A data source query ({@link module:odin/dataSource.Mapping#_parseQuery}).
		@returns {Promise.<(module:odin.Model|null)>}		A promise for a model instance, or null if not found.
	*/
	// TODO: use the Query object instead of a plain object to parse
	findOne(p_query) {
		throw new lib.odin.Exception('Abstract method not implemented', {method:'findOne'});
	}

	/**
		@abstract
		@desc										Persists a model instance into the data source.
													The model instance may be completed with auto-generated fields (sequences).
		@param {module:odin.Model}					Model instance.
		@returns {Promise.<module:odin.Model>}		A promise for the operation completion.
	*/
	create(p_instance) {
		throw new lib.odin.Exception('Abstract method not implemented', {method:'create'});
	};

	/**
		@abstract
		@desc										Saves a model instance modifications to the data source.
		@param {module:odin.Model}					Model instance.
		@returns {Promise.<module:odin.Model>}		A promise for the operation completion.
	*/
	save(p_instance) {
		throw new lib.odin.Exception('Abstract method not implemented', {method:'save'});
	};

	/**
		@abstract
		@desc										Removes a model instance from the data source.
		@param {module:odin.Model}					Model instance.
		@returns {Promise.<module:odin.Model>}		A promise for the operation completion.
	*/
	remove(p_instance) {
		throw new lib.odin.Exception('Abstract method not implemented', {method:'remove'});
	}
}

module.exports = Mapping;