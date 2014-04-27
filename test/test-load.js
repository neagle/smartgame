/*global describe, beforeEach, it*/
'use strict';
var assert = require('assert');

describe('smartgame parser', function () {
  it('can be imported without blowing up', function () {
    var sgf = require('..');
    assert(sgf !== undefined);
  });
});

describe('parse', function () {
	it('provides the parse method', function () {
		var sgf = require('..');
		assert(typeof sgf.parse === 'function');
	});
});

describe('generate', function () {
	it('provides the generate method', function () {
		var sgf = require('..');
		assert(typeof sgf.generate === 'function');
	});
});
