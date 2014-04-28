/**
 * Convert SGF files to a JS object
 * @param {string} sgf A valid SGF file.
 * @see http://www.red-bean.com/sgf/sgf4.html
 * @return {object} The SGF file represented as a JS object
 */
exports.parse = function (sgf) {
	var parse;
	var parser;
	var collection = {};

	// tracks the current sequence
	var sequence;

	// tracks the current node
	var node;

	// tracks the last key
	var lastKey;

	// A map of functions to parse the different components of an SGF file
	parser = {

		beginSequence: function (sgf) {
			if (!sequence) {
				sequence = collection;
			}

			var newSequence = {
				parent: sequence
			};

			sequence.sequences = sequence.sequences || [];
			sequence.sequences.push(newSequence);
			sequence = newSequence;

			return parse(sgf.substring(1));
		},

		endSequence: function (sgf) {
			if (sequence.parent) {
				sequence = sequence.parent;
			} else {
				sequence = null;
			}
			return parse(sgf.substring(1));
		},

		node: function (sgf) {
			node = {};
			sequence.nodes = sequence.nodes || [];
			sequence.nodes.push(node);
			return parse(sgf.substring(1));
		},

		property: function (sgf) {
			var value;
			// Search for the first unescaped ]
			var firstPropEnd = sgf.search(/[^\\]\]/) + 1;

			if (firstPropEnd > -1) {
				var property = sgf.substring(0, firstPropEnd + 1);
				var valueBegin = property.indexOf('[');

				var key = property.substring(0, valueBegin);

				// Point lists don't declare a property for each value
				// Instead, they should use the last declared property
				// See: http://www.red-bean.com/sgf/sgf4.html#move/pos
				if (!key) {
					key = lastKey;

					// If this is the first property in a list of multiple
					// properties, we need to wrap the value in an array
					if (!Array.isArray(node[key])) {
						node[key] = [node[key]];
					}
				}

				lastKey = key;

				value = property.substring(valueBegin + 1, property.length - 1);

				// We have no problem parsing keys of any length, but the spec says
				// they should be no longer than two characters.
				//
				// http://www.red-bean.com/sgf/sgf4.html#2.2
				if (key.length > 2) {
					console.warn(
						'SGF PropIdents should be no longer than two characters:', key
					);
				}

				if (Array.isArray(node[key])) {
					node[key].push(value);
				} else {
					node[key] = value;
				}

				return parse(sgf.substring(firstPropEnd + 1));
			} else {

				// TODO: Provide details about where in the SGF the error occurred.
				throw new Error('malformed sgf');
			}
		},

		// Whitespace, tabs, or anything else we don't recognize
		unrecognized: function (sgf) {

			// March ahead to the next character
			return parse(sgf.substring(1));
		}
	};

	// Processes an SGF file character by character
	parse = function (sgf) {
		var initial = sgf.substring(0, 1);
		var type;

		// Use the initial (the first character in the remaining sgf file) to
		// decide which parser function to use
		if (!initial) {
			return collection;
		} else if (initial === '(') {
			type = 'beginSequence';
		} else if (initial === ')') {
			type = 'endSequence';
		} else if (initial === ';') {
			type = 'node';
		} else if (initial.match(/[A-Z\[]/)) {
			type = 'property';
		} else {
			type = 'unrecognized';
		}

		return parser[type](sgf);
	};

	// Begin parsing the SGF file
	return parse(sgf);
};

/**
 * Generate an SGF file from a SmartGame Record JavaScript Object
 * @param {object} record A record object.
 * @return {string} The record as a string suitable for saving as an SGF file
 */
exports.generate = function (record) {
	function stringifySequences(sequences) {
		var contents = '';

		sequences.forEach(function (sequence) {
			contents += '(';

			// Parse all nodes in this sequence
			if (sequence.nodes) {
				sequence.nodes.forEach(function (node) {
					var nodeString = ';';
					for (property in node) {
						var prop = node[property];
						if (Array.isArray(prop)) {
							prop = prop.join('][');
						}
						nodeString += property + '[' + prop + ']';
					}
					contents += nodeString;
				});
			}

			// Call the function we're in recursively for any child sequences
			if (sequence.sequences) {
				contents += stringifySequences(sequence.sequences);
			}

			contents += ')';
		});

		return contents;
	}

	return stringifySequences(record.sequences);
};
