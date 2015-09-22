'use strict';

let lib = {
	odin:{
		Exception:require('odin').Exception
	}
};

/**
	@class
	@classdesc		Cursor.
	@alias			module:odin/dataSource.Cursor
*/
class Cursor {
	/**
		@abstract
		@desc					Returns the close status of this cursor.
		@returns {Boolean}		The close status of this cursor.
	*/
	isClosed() {
		throw new lib.odin.Exception('Abstract method not implemented', {method:'isClosed'});
	}

	/**
		@abstract
		@desc									Returns the next document from the underlying cursor.
		@returns {Promise.<(Object|null)>}		A promise for the next document, or null if the cursor has reached its end.
	*/
	next() {
		return Promise.reject(new lib.odin.Exception('Abstract method not implemented', {method:'next'}));
	}

	/**
		@private
		@desc															Exhausts this cursor by notifying the provided callback for each object found.
																		The given defer is resolved when the cursor reaches its end.
		@param {module:odin/dataSource.Cursor~forEachCallback} p_cb		Object callback.
	*/
	_exhaust(p_cb) {
		let self = this;
		return this.next()
		.then(function(p_instance) {
			if(p_instance === null) {
				return;
			}

			p_cb(p_instance);
			return self._exhaust();
		});
	}

	/**
		@callback										module:odin/dataSource.Cursor~forEachCallback
		@param {(module:odin.Model|null)} p_object		An object or null if the cursor reached its end.
	*/
	/**
		@desc															Calls the provided callback function for each object found.
																		The returned promise is resolved upon cursor exhaustion.
		@param {module:odin/dataSource.Cursor~forEachCallback} p_cb		Object callback.
		@returns {Promise}												A promise for the cursor exhaustion.
	*/
	each(p_cb) {
		return this._exhaust(p_cb);
	}

	/**
		@abstract
		@desc					Closes this cursor.
		@returns {Promise}		A promise for the operation completion.
	*/
	close() {
		return Promise.reject(new lib.odin.Exception('Abstract method not implemented', {method:'close'}));
	}
}

module.exports.Cursor = Cursor;