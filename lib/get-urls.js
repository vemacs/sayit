module.exports = getUrls;

/**
 * Returns the urls that were found in the str.
 * @param {string} str
 * @return {array}
 */
function getUrls(str) {
	return str.match(/\bhttps?:\/\/?[-A-Za-z0-9+&@#\/%?=~_|!:,.;]+[-A-Za-z0-9+&@#\/%=~_|]/g);
}