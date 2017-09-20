/**
 * Convert SGF files to a JS object
 * @param {string} sgf A valid SGF file.
 * @see http://www.red-bean.com/sgf/sgf4.html
 * @return {object} The SGF file represented as a JS object
 */
exports.parse = function (sgf) {
	'use strict';

	var parse;
	var parser;
	var collection = {};

	// tracks the current sequence
	var sequence;

	// tracks the current node
	var node;

	// tracks the last PropIdent
	var lastPropIdent;

	// A map of functions to parse the different components of an SGF file
	parser = {

		beginSequence: function (sgf) {
			var key = 'sequences';

			// Top-level sequences are gameTrees
			if (!sequence) {
				sequence = collection;
				key = 'gameTrees';
			}

			if (sequence.gameTrees) {
				key = 'gameTrees';
			}

			var newSequence = {
				parent: sequence
			};

			sequence[key] = sequence[key] || [];
			sequence[key].push(newSequence);
			sequence = newSequence;

			return sgf.substring(1);
		},

		endSequence: function (sgf) {
			if (sequence.parent) {
				sequence = sequence.parent;
			} else {
				sequence = null;
			}
			return sgf.substring(1);
		},

		node: function (sgf) {
			node = {};
			sequence.nodes = sequence.nodes || [];
			sequence.nodes.push(node);
			return sgf.substring(1);
		},

		property: function (sgf) {
			var propValue;

			// Search for the first unescaped ]
			var firstPropEnd = sgf.match(/([^\\\]]|\\(.|\n|\r))*\]/);

			if (!firstPropEnd.length) {
				throw new Error('malformed sgf');
			}

			firstPropEnd = firstPropEnd[0].length;

			var property = sgf.substring(0, firstPropEnd);
			var propValueBegin = property.indexOf('[');
			var propIdent = property.substring(0, propValueBegin);

			// Point lists don't declare a PropIdent for each PropValue
			// Instead, they should use the last declared property
			// See: http://www.red-bean.com/sgf/sgf4.html#move/pos
			if (!propIdent) {
				propIdent = lastPropIdent;

				// If this is the first property in a list of multiple
				// properties, we need to wrap the PropValue in an array
				if (!Array.isArray(node[propIdent])) {
					node[propIdent] = [node[propIdent]];
				}
			}

			lastPropIdent = propIdent;

			propValue = property.substring(propValueBegin + 1, property.length - 1);

			// We have no problem parsing PropIdents of any length, but the spec
			// says they should be no longer than two characters.
			//
			// http://www.red-bean.com/sgf/sgf4.html#2.2
			if (propIdent.length > 2) {
				// TODO: What's the best way to issue a warning?
				console.warn(
					'SGF PropIdents should be no longer than two characters:', propIdent
				);
			}

			if (Array.isArray(node[propIdent])) {
				node[propIdent].push(propValue);
			} else {
				node[propIdent] = propValue;
			}

			return sgf.substring(firstPropEnd);
		},

		// Whitespace, tabs, or anything else we don't recognize
		unrecognized: function (sgf) {

			// March ahead to the next character
			return sgf.substring(1);
		}
	};

	// Processes an SGF file character by character
	parse = function (sgf) {
		while (sgf) {
			var initial = sgf.substring(0, 1);
			var type;

			// Use the initial (the first character in the remaining sgf file) to
			// decide which parser function to use
			if (initial === '(') {
				type = 'beginSequence';
			} else if (initial === ')') {
				type = 'endSequence';
			} else if (initial === ';') {
				type = 'node';
			} else if (initial.search(/[A-Z\[]/) !== -1) {
				type = 'property';
			} else {
				type = 'unrecognized';
			}

			sgf = parser[type](sgf);
		}

		return collection;
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
	'use strict';

	function stringifySequences(sequences) {
		var contents = '';

		sequences.forEach(function (sequence) {
			contents += '(';

			// Parse all nodes in this sequence
			if (sequence.nodes) {
				sequence.nodes.forEach(function (node) {
					var nodeString = ';';
					for (var property in node) {
						if (node.hasOwnProperty(property)) {
							var prop = node[property];
							if (Array.isArray(prop)) {
								prop = prop.join('][');
							}
							nodeString += property + '[' + prop + ']';
						}
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

	return stringifySequences(record.gameTrees);
};

