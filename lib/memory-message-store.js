module.exports = MessageStore;

/**
 * Type Message:
 *  message.text {string} The message text.
 *  message.color {string} Hex encoded color string (eg. #FFAAFF).
 *  message.createdAt {date} Time created.
 */

/**
 * Memory implemenation of a message store.
 */
function MessageStore() {
	this.maxMessages = 100;
	this.messages = [];
}

/**
 * Add a message to the store.
 * @param {string} message
 */
MessageStore.prototype.add = function(message) {
	if (this.isFull()) {
		this.shift();
	}
	this.messages.push(message);
};

/**
 * Delete the first message that was added.
 */
MessageStore.prototype.shift = function() {
	this.messages.shift();
};

/**
 * Returns number of messages.
 * @return {int}
 */
MessageStore.prototype.count = function(cb) {
	return this.messages.length;
};

/**
 * Returns true if the number of messages is equal or greater than
 * the maxMessages property.
 * @return {boolean}
 */
MessageStore.prototype.isFull = function() {
	return this.count() >= this.maxMessages;
};

/**
 * Returns all the messages in the store.
 * @return {array}
 */
MessageStore.prototype.messages = function() {
	return this.messages;
};