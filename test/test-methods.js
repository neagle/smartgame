/*global describe, beforeEach, it*/
'use strict';
var assert = require('assert');

// Check if the output of a parsed and generated SGF file matches what went
// into it
describe('parse & generate', function () {
	it('generate sgf files after parsing that match the sgf files they started with', function () {
		var sgf = require('..'),
			fs = require('fs');

		/**
		 * Strip whitespace outside of node values in an SGF file
		 */
		function stripWhitespace(sgf) {
			var nodes = [];
			var placeholder = '##NODE##';

			function stripNodes(sgf) {
				var node = sgf.match(/\[[^\]]*\]/);

				if (node) {
					nodes.push(node[0]);
					sgf = sgf.replace(/\[[^\]]*\]/, placeholder);
					return stripNodes(sgf);
				} else {
					return sgf;
				}
			}

			function putNodesBack(sgf) {
				if (sgf.match(placeholder) && nodes.length) {
					sgf = sgf.replace(placeholder, nodes.shift());
					return putNodesBack(sgf);
				} else {
					return sgf;
				}
			}

			sgf = stripNodes(sgf);

			// Strip all whitespace
			sgf = sgf.replace(/[\n\r\s]/g, '');

			sgf = putNodesBack(sgf);

			return sgf;
		}

		var files = fs.readdirSync('example/sgf');
		files.forEach(function (file) {
			var sgfFile = fs.readFileSync('example/sgf/' + file, { encoding: 'utf-8' });
			assert(stripWhitespace(sgfFile) === sgf.generate(sgf.parse(sgfFile)));
		});
	});
});
