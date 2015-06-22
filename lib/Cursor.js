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
	@classdesc		Cursor.
	@alias			module:odin/dataSource.Cursor

	@desc			Constructs a new cursor.
*/
function Cursor() {
};

/**
	@abstract
	@desc					Returns the close status of this cursor.
	@returns {Boolean}		The close status of this cursor.
*/
Cursor.prototype.isClosed = function() {
	throw new lib.odin.Exception('Abstract method not implemented', {method:'isClosed'});
};

/**
	@abstract
	@desc									Returns the next document from the underlying cursor.
	@returns {Promise.<(Object|null)>}		A promise for the next document, or null if the cursor has reached its end.
*/
Cursor.prototype.next = function() {
	return lib.deps.q.reject(new lib.odin.Exception('Abstract method not implemented', {method:'next'}));
};

/**
	@private
	@desc						Exhausts this cursor by notifying the provided defer for each object found.
								The given defer is resolved when the cursor reaches its end.
	@param {Defer} p_defer		A defer used for notification triggering.
*/
Cursor.prototype._exhaust = function(p_defer) {
	var self = this;
	this.next()
	.then(function(p_instance) {
		if(p_instance === null) {
			return p_defer.resolve();
		}

		p_defer.notify(p_instance);
		return self._exhaust();
	})
	.fail(function(p_error) {
		p_defer.reject(p_error);
	});
};

/**
	@desc					Returns a promise notified for each
							The promise is resolved upon cursor exhaustion.
	@returns {Promise}		A promise for the cursor exhaustion.
*/
Cursor.prototype.each = function() {
	var defer = lib.deps.q.defer();
	this._exhaust(defer);
	return defer.promise;
};

/**
	@abstract
	@desc					Closes this cursor.
	@returns {Promise}		A promise for the operation completion.
*/
Cursor.prototype.close = function() {
	return lib.deps.q.reject(new lib.odin.Exception('Abstract method not implemented', {method:'close'}));
};

module.exports.Cursor = Cursor;