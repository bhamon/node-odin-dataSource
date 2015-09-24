'use strict';

let lib = {
	deps:{
		joi:require('joi')
	},
	odin:{
		Exception:require('odin').Exception,
		util:require('odin').util
	}
};

/**
	@class
	@classdesc		Query.
	@alias			module:odin/dataSource.Query
*/
class Query {
	/**
		@desc														Constructs a new query.
		@param {module:odin/dataSource.Collection} p_collection		Collection to query.
		@param {String} [p_alias]									Collection alias (defaults to the collection name).
	*/
	constructor(p_collection, p_alias) {
		let args = lib.odin.util.validate({
			collection:p_collection,
			alias:p_alias
		}, {
			collection:lib.deps.joi.object().required().type(lib.deps.odin.dataSource.Collection),
			collection:lib.deps.joi.string().optional().min(1)
		});

		Object.defineProperty(this, 'collection', {enumerable:true, value:args.collection});
		Object.defineProperty(this, 'alias', {enumerable:true, value:args.alias || collection.name});
		Object.defineProperty(this, '_fields', {value:new Set()});
		Object.defineProperty(this, '_joints', {value:[]});
		Object.defineProperty(this, '_where', {value:this._createOperation(Query.OPERATOR_AND)});
		Object.defineProperty(this, '_whereStack', {value:[]});
		Object.defineProperty(this, '_orders', {value:[]});
		Object.defineProperty(this, '_offset', {enumerable:true, writable:true, value:0});
		Object.defineProperty(this, '_size', {enumerable:true, writable:true, value:-1});
	}

	/**
		@readonly
		@member {Set.<String>}		module:odin/dataSource.Query#fields
		@desc						The fields set.
	*/
	get fields() {
		return new Set(this._fields);
	}

	/**
		@readonly
		@member {Array.<module:odin/dataSource.Query>}		module:odin/dataSource.Query#joints
		@desc												The joints array.
	*/
	get joints() {
		return this._joints.slice(0);
	}

	/**
		@readonly
		@member {Array.<module:odin/dataSource.Query>}		module:odin/dataSource.Query#joints
		@desc												The joints array.
		@example
			{operator:'$and', children:[
				{operator:'$eq', field:'_id', value:new ObjectID(21)},
				{operator:'$eq', field:'name', value:'test'},
				{operator:'$or', children:[{exp1}, {exp2}]},
				{operator:'$and', children:[
					{operator:'$in', field:'rights', value:[]},
					{operator:'$regex', field:'rights', value:/^[a-z]+$/}
				]},
				{operator:'$and', children:[
					{operator:'$eq', field:'field', value:'value'}
				]}
			]}
	*/
	get whereClause() {
		return this._where;
	}

	/**
		@readonly
		@member {Object}	module:odin/dataSource.Query#orders
		@desc				The orders array.
	*/
	get orders() {
		return this._orders.slice(0);
	}

	/**
		@readonly
		@member {Object}	module:odin/dataSource.Query#offset
		@desc				The query fetch offset.
	*/
	get offset() {
		return this._offset;
	}

	/**
		@readonly
		@member {Object}	module:odin/dataSource.Query#size
		@desc				The query fetch size.
	*/
	get size() {
		return this._size;
	}

	/**
		@desc										Add the specified field to the selection list.
		@param {String} p_field						Field name.
		@return {module:odin/dataSource.Query}		This object for chained calls.
	*/
	select(p_field) {
		lib.odin.util.validate(p_field, lib.deps.joi.string().required().min(1));

		this._fields.add(p_field);

		return this;
	}

	/**
		@desc										Adds a joint to this query.
		@return {module:odin/dataSource.Query}		This object for chained calls.
	*/
	join(p_query) {
		lib.odin.util.validate(p_query, lib.deps.joi.object().required().type(Query));

		this._joints.push(p_query);

		return this;
	}

	/**
		@private
		@desc							Creates an empty operation.
		@param {String} p_operator		Operator.
		@returns {Object}				A new operation.
	*/
	_createOperation(p_operator) {
		switch(p_operator) {
			case Query.OPERATOR_AND:
			case Query.OPERATOR_OR:
				return {operator:p_operator, children:[]};
			case Query.OPERATOR_NOT:
				return {operator:p_operator, child:[]};
			case Query.OPERATOR_EQUAL:
			case Query.OPERATOR_NOT_EQUAL:
			case Query.OPERATOR_GREATER_THAN:
			case Query.OPERATOR_GREATER_THAN_OR_EQUAL:
			case Query.OPERATOR_LESS_THAN:
			case Query.OPERATOR_LESS_THAN_OR_EQUAL:
			case Query.OPERATOR_IN:
			case Query.OPERATOR_NOT_IN:
			case Query.OPERATOR_REGEX:
				return {operator:p_operator, field:null, value:null};
			default:
				throw new lib.odin.Exception('Unknown operator', {operator:p_operator});
		}
	}

	/**
		@desc										Resets the where-clause pointer to the root level.
		@returns {module:odin/dataSource.Query}		This query for chained calls.
		@example
			query
			.where()
				.or()
					.operation('email', Query.OPERATOR_REGEX, /john.doe/)
					.and()
						.operation('firstName', Query.OPERATOR_EQUAL, 'John')
						.operation('lastName', Query.OPERATOR_EQUAL, 'Doe')
					.end()
				.end()
				.not()
					.operation('active', Query.OPERATOR_EQUAL, false)
				.end()
			;
	*/
	where() {
		this._whereStack.splice(0, this._whereStack.length);
		this._whereStack.push(this._where);

		return this;
	}

	/**
		@desc										Appends an and operation to the current where-clause pointer.
		@returns {module:odin/dataSource.Query}		This query for chained calls.
	*/
	and() {
		if(!this._whereStack.length) {
			throw new lib.odin.Exception('Empty where-clause stack');
		}

		let clause = this._whereStack[this._whereStack.length - 1];
		let operation = this._createOperation(Query.OPERATOR_AND);
		clause.children.push(operation);
		this._whereStack.push(operation);

		return this;
	}

	/**
		@desc										Appends an or operation to the current where-clause pointer.
		@returns {module:odin/dataSource.Query}		This query for chained calls.
	*/
	or() {
		if(!this._whereStack.length) {
			throw new lib.odin.Exception('Empty where-clause stack');
		}

		let clause = this._whereStack[this._whereStack.length - 1];
		let operation = this._createOperation(Query.OPERATOR_OR);
		clause.children.push(operation);
		this._whereStack.push(operation);

		return this;
	}

	/**
		@desc										Appends a not operation to the current where-clause pointer.
													The new operation embed an and clause for chaining purpose.
		@returns {module:odin/dataSource.Query}		This query for chained calls.
	*/
	not() {
		if(!this._whereStack.length) {
			throw new lib.odin.Exception('Empty where-clause stack');
		}

		let clause = this._whereStack[this._whereStack.length - 1];
		let operationNot = this._createOperation(Query.OPERATOR_NOT);
		let operationAnd = this._createOperation(Query.OPERATOR_AND);

		operationNot.child = operationAnd;
		Object.freeze(operationNot);
		Object.freeze(operationAnd);

		clause.children.push(operationNot);
		this._whereStack.push(operationAnd);

		return this;
	}

	/**
		@desc										Appends an operator operation to the current where-clause pointer.
		@returns {module:odin/dataSource.Query}		This query for chained calls.
	*/
	operation(p_field, p_operator, p_value) {
		if(!this._whereStack.length) {
			throw new lib.odin.Exception('Empty where-clause stack');
		}

		let clause = this._whereStack[this._whereStack.length - 1];
		let operation = this._createOperation(p_operator);
		operation.field = p_field;
		operation.value = p_value;

		Object.freeze(operation);
		clause.children.push(operation);

		return this;
	}

	/**
		@desc										Ends the current clause, returning to the previous one in the clause stack.
		@returns {module:odin/dataSource.Query}		This query for chained calls.
	*/
	end() {
		if(!this._whereStack.length) {
			throw new lib.odin.Exception('Empty where-clause stack');
		}

		this._whereStack.pop();

		return this;
	}

	/**
		@desc										Adds an order to this query.
		@param {String} p_field						Field name.
		@param {Sring} [p_order]					Order (one of {@link module:odin/dataSource.Query.ORDERS}).
		@returns {module:odin/dataSource.Query}		This query for chained calls.
	*/
	orderBy(p_field, p_order) {
		let args = lib.odin.util.validate({
			field:_field,
			order:p_order
		}, {
			field:lib.deps.joi.string().required().min(1),
			order:lib.deps.joi.string().optional().default(Query.ORDER_ASC).valid(Query.ORDERS)
		});

		let order = {};
		Object.freeze(order);
		this._orders.push(order);

		return this;
	}

	/**
		@desc										Sets this query fetch offset.
		@param {Number} p_value						The new fetch offset.
		@returns {module:odin/dataSource.Query}		This query for chained calls.
	*/
	skip(p_value) {
		lib.odin.util.validate(p_value, lib.deps.joi.number().required().integer().min(0));

		this._offset = p_value;

		return this;
	}

	/**
		@desc										Sets this query fetch size.
		@param {Number} p_value						The new fetch size.
		@returns {module:odin/dataSource.Query}		This query for chained calls.
	*/
	limit(p_value) {
		lib.odin.util.validate(p_value, lib.deps.joi.number().required().integer().min(-1));

		this._size

		return this;
	}
}

/**
	@constant
	@desc			[&&] query operator.
	@type {String}
*/
Query.OPERATOR_AND = '$and';

/**
	@constant
	@desc			[||] query operator.
	@type {String}
*/
Query.OPERATOR_OR = '$or';

/**
	@constant
	@desc			[!] query operator.
	@type {String}
*/
Query.OPERATOR_NOT = '$not';

/**
	@constant
	@desc			[==] query operator.
	@type {String}
*/
Query.OPERATOR_EQUAL = '$eq';

/**
	@constant
	@desc			[!=] query operator.
	@type {String}
*/
Query.OPERATOR_NOT_EQUAL = '$neq';

/**
	@constant
	@desc			[>] query operator.
	@type {String}
*/
Query.OPERATOR_GREATER_THAN = '$gt';

/**
	@constant
	@desc			[>=] query operator.
	@type {String}
*/
Query.OPERATOR_GREATER_THAN_OR_EQUAL = '$gte';

/**
	@constant
	@desc			[<] query operator.
	@type {String}
*/
Query.OPERATOR_LESS_THAN = '$lt';

/**
	@constant
	@desc			[<=] query operator.
	@type {String}
*/
Query.OPERATOR_LESS_THAN_OR_EQUAL = '$lte';

/**
	@constant
	@desc			[in()] query operator.
	@type {String}
*/
Query.OPERATOR_IN = '$in';

/**
	@constant
	@desc			[!in()] query operator.
	@type {String}
*/
Query.OPERATOR_NOT_IN = '$nin';

/**
	@constant
	@desc			[regex()] query operator.
	@type {String}
*/
Query.OPERATOR_REGEX = '$regex';

/**
	@constant
	@desc				Supported query operators.
	@type {String[]}
*/
Query.OPERATORS = [
	Query.OPERATOR_AND,
	Query.OPERATOR_OR,
	Query.OPERATOR_NOT,
	Query.OPERATOR_EQUAL,
	Query.OPERATOR_NOT_EQUAL,
	Query.OPERATOR_GREATER_THAN,
	Query.OPERATOR_GREATER_THAN_OR_EQUAL,
	Query.OPERATOR_LESS_THAN,
	Query.OPERATOR_LESS_THAN_OR_EQUAL,
	Query.OPERATOR_IN,
	Query.OPERATOR_NOT_IN,
	Query.OPERATOR_REGEX
];

/**
	@constant
	@desc			Ascendent order.
	@type {String}
*/
Query.ORDER_ASC = 'asc';

/**
	@constant
	@desc			Descendent type.
	@type {String}
*/
Query.ORDER_DESC = 'desc';

/**
	@constant
	@desc				Supported orders.
	@type {String[]}
*/
Query.ORDERS = [
	Query.ORDER_ASC,
	Query.ORDER_DESC
];

module.exports = Query;