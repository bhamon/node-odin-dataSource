'use strict';

var lib = {
	deps:{
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
	@classdesc															Mapping for a model.
	@alias																module:odin/dataSource.Mapping

	@desc																Constructs a new mapping for the provided model.
	@param {Object} p_config											Configuration set.
	@param {Function} p_config.model									Model.
	@param {module:odin/dataSource.Driver} p_config.driver				Driver instance.
	@param {String} p_config.collection									Collection name.
	@param {Object} [p_config.virtual]									Virtual descriptor.
	@param {Boolean} [p_config.virtual.abstract=false]					Abstract status.
	@param {String} p_config.virtual.discriminator						Discriminator field name.
	@param {Object} [p_config.extend]									Inheritance descriptor.
	@param {module:odin/dataSource.Mapping} p_config.extend.mapping		Parent mapping.
	@param {Object} p_config.extend.discriminatorValues					Discriminator values.
	@param {Object[]} p_config.fields									Fields mappings.
	@param {String} p_config.fields.name								Collection field name.
	@param {String} [p_config.fields.ref]								Model field referenced by this field mapping. Defaults to the field name.
	@param {String} [p_config.fields.type]								Model field type. One of {@link module:odin/dataSource.Mapping.FIELD_TYPES}.
	@param {String} [p_config.fields.rawType]							Model field raw type. Must be defined if there is no type.
	@param {Boolean} [p_config.fields.primaryKey]						Primary key flag. Defaults to false.
	@param {(Boolean|String)} [p_config.fields.sequence]				Sequence flag or name. Defaults to false.
	@throws {module:odin.Exception}										If a parameter is invalid.
*/
function Mapping(p_config) {
	var args = lib.odin.util.validate(p_config, {
		model:lib.deps.joi.func().required(),
		driver:lib.deps.joi.object().required().type(lib.odin.dataSource.Driver),
		collection:lib.deps.joi.string().required().min(1),
		virtual:lib.deps.joi.object().optional().keys({
			abstract:lib.deps.joi.boolean().optional().default(false),
			discriminator:lib.deps.joi.string().required().min(1)
		}),
		extend:lib.deps.joi.object().optional().keys({
			mapping:lib.deps.joi.object().optional().type(Mapping),
			discriminatorValues:lib.deps.joi.object().required().pattern(/^.+$/, lib.deps.joi.string().required().min(1)).min(1)
		}),
		fields:lib.deps.joi.array().required().items(lib.deps.joi.object().keys({
			name:lib.deps.joi.string().required().min(1),
			ref:lib.deps.joi.string().optional().min(1).default(lib.deps.joi.ref('name')),
			type:lib.deps.joi.string().valid(Mapping.FIELD_TYPES),
			rawType:lib.deps.joi.string().min(1),
			primaryKey:lib.deps.joi.boolean().optional().default(false),
			sequence:[lib.deps.joi.boolean().optional().default(false), lib.deps.joi.string().required().min(1)]
		}).xor('type', 'rawType'))
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
		@member {String}		module:odin/dataSource.Mapping#_collection
		@desc					Collection name.
	*/
	Object.defineProperty(this, '_collection', {value:args.collection});

	/**
		@protected
		@readonly
		@member {Object[]}		module:odin/dataSource.Mapping#_fields
		@desc					Mapped fields.
	*/
	Object.defineProperty(this, '_fields', {value:[]});

	/**
		@protected
		@readonly
		@member {Object}	module:odin/dataSource.Mapping#_virtual
		@desc				Virtual descriptor.
	*/
	Object.defineProperty(this, '_virtual', {value:args.virtual});

	/**
		@protected
		@readonly
		@member {Object}	module:odin/dataSource.Mapping#_extend
		@desc				Inheritance descriptor.
	*/
	Object.defineProperty(this, '_extend', {value:args.extend});

	var self = this;
	args.fields.forEach(function(p_field) {
		p_field.rawType = p_field.rawType || self._driver.coerceType(p_field.type);
		p_field.converter = self._driver.createConverter(p_field.rawType);

		Object.freeze(p_field);
		self._fields.push(p_field);
	});

	if(this._virtual) {
		this._virtual.children = [];
	}

	if(this._extend) {
		if(!this._extend.mapping._virtual) {
			throw new lib.odin.Exception('Parent mapping must be virtual');
		}

		var mapping = this;
		while(mapping._extend) {
			mapping = mapping._extend.mapping;

			if(!(mapping._virtual.discriminator in this._extend.discriminatorValues)) {
				throw new lib.odin.Exception('Missing discriminator value', {discriminator:mapping._virtual.discriminator});
			}
		}
	}
};

/**
	@constant
	@desc			Inheritance strategy that stores a complete class hierarchy in a single collection.
	@type {String}
*/
Mapping.INHERITANCE_STRATEGY_PER_CLASS_HIERARCHY = 'perClassHierarchy';

/**
	@constant
	@desc			Inheritance strateg that stores children fields in a sub-collection.
	@type {String}
*/
Mapping.INHERITANCE_STRATEGY_PER_SUB_CLASS = 'perSubClass';

/**
	@constant
	@desc			Inheritance strategy that stores concrete classes in specific collections.
	@type {String}
*/
Mapping.INHERITANCE_STRATEGY_PER_CONCRETE_CLASS = 'perConcreteClass';

/**
	@constant
	@desc				Inheritance strategies.
	@type {String[]}
*/
Mapping.INHERITANCE_STRATEGIES = [
	module.exports.INHERITANCE_STRATEGY_PER_CLASS_HIERARCHY,
	module.exports.INHERITANCE_STRATEGY_PER_SUB_CLASS,
	module.exports.INHERITANCE_STRATEGY_PER_CONCRETE_CLASS
];

/**
	@constant
	@desc			String type.
	@type {String}
*/
Mapping.FIELD_TYPE_STRING = 'string';

/**
	@constant
	@desc			Float type.
	@type {String}
*/
Mapping.FIELD_TYPE_FLOAT = 'float';

/**
	@constant
	@desc			Double type.
	@type {String}
*/
Mapping.FIELD_TYPE_DOUBLE = 'double';

/**
	@constant
	@desc			Real type.
	@type {String}
*/
Mapping.FIELD_TYPE_REAL = 'real';

/**
	@constant
	@desc			Integer type.
	@type {String}
*/
Mapping.FIELD_TYPE_INTEGER = 'integer';

/**
	@constant
	@desc			Boolean type.
	@type {String}
*/
Mapping.FIELD_TYPE_BOOLEAN = 'boolean';

/**
	@constant
	@desc			Date type.
	@type {String}
*/
Mapping.FIELD_TYPE_DATE = 'date';

/**
	@constant
	@desc			Text type.
	@type {String}
*/
Mapping.FIELD_TYPE_TEXT = 'text';

/**
	@constant
	@desc			Binary type.
	@type {String}
*/
Mapping.FIELD_TYPE_BINARY = 'binary';

/**
	@constant
	@desc				Supported types.
	@type {String[]}
*/
Mapping.FIELD_TYPES = [
	Mapping.FIELD_TYPE_STRING,
	Mapping.FIELD_TYPE_FLOAT,
	Mapping.FIELD_TYPE_DOUBLE,
	Mapping.FIELD_TYPE_REAL,
	Mapping.FIELD_TYPE_INTEGER,
	Mapping.FIELD_TYPE_BOOLEAN,
	Mapping.FIELD_TYPE_DATE,
	Mapping.FIELD_TYPE_TEXT,
	Mapping.FIELD_TYPE_BINARY
];

/**
	@constant
	@desc			Ascendent order.
	@type {String}
*/
Mapping.ORDER_ASC = 'asc';

/**
	@constant
	@desc			Descendent type.
	@type {String}
*/
Mapping.ORDER_DESC = 'desc';

/**
	@constant
	@desc				Supported orders.
	@type {String[]}
*/
Mapping.ORDERS = [
	Mapping.ORDER_ASC,
	Mapping.ORDER_DESC
];

/**
	@constant
	@desc			[&&] query operator.
	@type {String}
*/
Mapping.QUERY_OPERATOR_AND = '$and';

/**
	@constant
	@desc			[||] query operator.
	@type {String}
*/
Mapping.QUERY_OPERATOR_OR = '$or';

/**
	@constant
	@desc			[!] query operator.
	@type {String}
*/
Mapping.QUERY_OPERATOR_NOT = '$not';

/**
	@constant
	@desc			[==] query operator.
	@type {String}
*/
Mapping.QUERY_OPERATOR_EQUAL = '$eq';

/**
	@constant
	@desc			[!=] query operator.
	@type {String}
*/
Mapping.QUERY_OPERATOR_NOT_EQUAL = '$neq';

/**
	@constant
	@desc			[>] query operator.
	@type {String}
*/
Mapping.QUERY_OPERATOR_GREATER_THAN = '$gt';

/**
	@constant
	@desc			[>=] query operator.
	@type {String}
*/
Mapping.QUERY_OPERATOR_GREATER_THAN_OR_EQUAL = '$gte';

/**
	@constant
	@desc			[<] query operator.
	@type {String}
*/
Mapping.QUERY_OPERATOR_LESS_THAN = '$lt';

/**
	@constant
	@desc			[<=] query operator.
	@type {String}
*/
Mapping.QUERY_OPERATOR_LESS_THAN_OR_EQUAL = '$lte';

/**
	@constant
	@desc			[in()] query operator.
	@type {String}
*/
Mapping.QUERY_OPERATOR_IN = '$in';

/**
	@constant
	@desc			[!in()] query operator.
	@type {String}
*/
Mapping.QUERY_OPERATOR_NOT_IN = '$nin';

/**
	@constant
	@desc			[regex()] query operator.
	@type {String}
*/
Mapping.QUERY_OPERATOR_REGEX = '$regex';

/**
	@constant
	@desc				Supported query operators.
	@type {String[]}
*/
Mapping.QUERY_OPERATORS = [
	Mapping.QUERY_OPERATOR_AND,
	Mapping.QUERY_OPERATOR_OR,
	Mapping.QUERY_OPERATOR_NOT,
	Mapping.QUERY_OPERATOR_EQUAL,
	Mapping.QUERY_OPERATOR_NOT_EQUAL,
	Mapping.QUERY_OPERATOR_GREATER_THAN,
	Mapping.QUERY_OPERATOR_GREATER_THAN_OR_EQUAL,
	Mapping.QUERY_OPERATOR_LESS_THAN,
	Mapping.QUERY_OPERATOR_LESS_THAN_OR_EQUAL,
	Mapping.QUERY_OPERATOR_IN,
	Mapping.QUERY_OPERATOR_NOT_IN,
	Mapping.QUERY_OPERATOR_REGEX
];

/**
	@private
	@constant
	@desc								Query operators set.
	@type {Object.<String,String>}
*/
var QUERY_OPERATORS_SET = lib.odin.util.array.toSet(Mapping.QUERY_OPERATORS);

/**
	@protected
	@desc							Iterates through all registered fields (parent then local).
	@param {Function} p_callback	Function called for each field.

	@todo p_callback(p_collection, p_field) with MappingPerClassHierarchy, MappingPer... -> return the field along with its collection scope
*/
Mapping.prototype._collectFields = function(p_callback) {
	if(this._extend) {
		this._extend.mapping._collectFields(p_callback);
	}

	this._fields.forEach(p_callback);
};

/**
	@protected
	@desc								Helper method to parse a human-written query in a more computer-friendly way.
										The fields names are model-to-mapping translated.
										The right-values are model-to-mapping converted.
	@param {Object} p_query				Human-written query.
	@returns {Object}					A computer-friendly query.
	@throws {module:odin.Exception}		If a parsing error occurs.
	@example
		Query:
		{
			id:21,
			name:{$eq:'test'},
			$or:[{exp1}, {exp2}],
			rights:{$in:[], $regex:/^[a-z]+$/},
			$and:[
				{field:'value'}
			]
		}

		Parsed query:
		{operator:'$and', expressions:[
			{operator:'$eq', field:'_id', value:new ObjectID(21)},
			{operator:'$eq', field:'name', value:'test'},
			{operator:'$or', expressions:[{exp1}, {exp2}]},
			{operator:'$and', expressions:[
				{operator:'$in', field:'rights', value:[]},
				{operator:'$regex', field:'rights', value:/^[a-z]+$/}
			]},
			{operator:'$and', expressions:[
				{operator:'$eq', field:'field', value:'value'}
			]}
		]}
*/
Mapping.prototype._parseQuery = function(p_query) {
	return this._parseQueryOperation(Mapping.QUERY_OPERATOR_AND, [p_query]);
};

/**
	@private
	@desc								Parses a query expression.
	@param {Object} p_expression		Query expression.
	@param {Object} [p_field]			Branch field.
	@returns {Object}					The parsed expression.
	@throws {module:odin.Exception}		If a parsing error occurs.
*/
Mapping.prototype._parseQueryExpression = function(p_expression, p_field) {
	lib.odin.util.validate(p_expression, lib.deps.joi.object().required());

	var self = this;
	var children = Object.keys(p_expression).map(function(p_key) {
		var data = p_expression[p_key];
		if(p_key in QUERY_OPERATORS_SET) {
			return self._parseQueryOperation(p_key, data, p_field);
		} else {
			if(p_field) {
				throw new lib.odin.Exception('Only one field authorized per tree branch', {
					branchField:p_field,
					field:p_key
				});
			}

			var field;
			self._collectFields(function(p_refField) {
				if(p_refField.ref == p_key) {
					field = p_refField;
				}
			});

			if(!field) {
				throw new lib.odin.Exception('Unknown field', {field:p_key});
			} else if(typeof data != 'object') {
				return self._parseQueryOperation(Mapping.QUERY_OPERATOR_EQUAL, data, field);
			}

			return self._parseQueryExpression(data, field);
		}
	});

	switch(children.length) {
		case 0:
			return null;
		case 1:
			return children[0];
		default:
			return {
				operator:Mapping.QUERY_OPERATOR_AND,
				children:children
			};
	}
};

/**
	@private
	@desc								Parses a query operation.
	@param {Object} p_operation			Query operation.
	@param {Object} p_data				Operation data.
	@param {Object} [p_field]			Branch field.
	@returns {Object}					The parsed operation.
	@throws {module:odin.Exception}		If a parsing error occurs.
*/
Mapping.prototype._parseQueryOperation = function(p_operator, p_data, p_field) {
	switch(p_operator) {
		// Binary logical operators.
		case Mapping.QUERY_OPERATOR_AND:
		case Mapping.QUERY_OPERATOR_OR:
			lib.odin.util.validate(p_data, lib.deps.joi.array().required().items(lib.deps.joi.object()));

			var self = this;
			return {
				operator:p_operator,
				children:p_data.map(function(p_expression) {
					return self._parseQueryExpression(p_expression, p_field);
				})
			};
		break;
		// Unary logical operators.
		case Mapping.QUERY_OPERATOR_NOT:
			return {
				operator:p_operator,
				child:this._parseQueryExpression(p_data, p_field)
			};
		break;
		// Comparison operators.
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

			return {
				operator:p_operator,
				field:p_field.name,
				value:p_field.converter.to(p_data)
			};
		break;
		default:
			throw new lib.odin.Exception('Unknown operator', {operator:p_operator});
	}
};

/**
	@abstract
	@desc					Synchronizes this mapping to the data source (collections, indexes, foreign keys).
	@returns {Promise}		A promise for the operation completion.
*/
Mapping.prototype.sync = function() {
	throw new lib.odin.Exception('Abstract method not implemented', {method:'sync'});
};

/**
	@protected
	@desc																Decorates the provided cursor to provide auto-unmarshal facility.
	@param {module:odin/dataSource.Cursor.<Object>} p_cursor			The original cursor.
	@returns {module:odin/dataSource.Cursor.<module:odin.Model>}		The decorated cursor.
*/
Mapping.prototype._decorateCursor = function(p_cursor) {
	var self = this;
	p_cursor.next = function() {
		p_cursor.next()
		.then(function(p_document) {
			if(p_document === null) {
				return null;
			}

			return self._unmarshall(p_document);
		});
	};

	return p_cursor;
};

/**
	@abstract
	@desc																		Finds model instances.
	@param {Object} p_query														A data source query ({@link module:odin/dataSource.Mapping#_parseQuery}).
	@param {Object} p_options													Find options.
	@param {Number} [p_options.skip]											Number of objects to skip.
	@param {Number} [p_options.limit]											Maximum number of objects to fetch.
	@param {Object[]} [p_options.orderBy]										Order clause.
	@param {String} p_options.orderBy.field										Field name.
	@param {String} p_options.orderBy.order										Order (one of {@link module:odin/dataSource.Mapping.ORDERS}).
	@returns {Promise.<module:odin/dataSource.Cursor.<module:odin.Model>>}		A promise for a cursor of model instances.
*/
Mapping.prototype.find = function(p_query, p_options) {
	throw new lib.odin.Exception('Abstract method not implemented', {method:'find'});
};

/**
	@abstract
	@desc												Finds one model instance.
	@param {Object} p_query								A data source query ({@link module:odin/dataSource.Mapping#_parseQuery}).
	@returns {Promise.<(module:odin.Model|null)>}		A promise for a model instance, or null if not found.
*/
Mapping.prototype.findOne = function(p_query) {
	throw new lib.odin.Exception('Abstract method not implemented', {method:'findOne'});
};

/**
	@abstract
	@desc										Persists a model instance into the data source.
												The model instance may be completed with auto-generated fields (sequences).
	@param {module:odin.Model}					Model instance.
	@returns {Promise.<module:odin.Model>}		A promise for the operation completion.
*/
Mapping.prototype.create = function(p_instance) {
	throw new lib.odin.Exception('Abstract method not implemented', {method:'create'});
};

/**
	@abstract
	@desc										Saves a model instance modifications to the data source.
	@param {module:odin.Model}					Model instance.
	@returns {Promise.<module:odin.Model>}		A promise for the operation completion.
*/
Mapping.prototype.save = function(p_instance) {
	throw new lib.odin.Exception('Abstract method not implemented', {method:'save'});
};

/**
	@abstract
	@desc										Removes a model instance from the data source.
	@param {module:odin.Model}					Model instance.
	@returns {Promise.<module:odin.Model>}		A promise for the operation completion.
*/
Mapping.prototype.remove = function(p_instance) {
	throw new lib.odin.Exception('Abstract method not implemented', {method:'remove'});
};

module.exports = Mapping;