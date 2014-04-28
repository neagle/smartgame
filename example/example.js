/**
 * A script with some example uses of smartgame.
 * It may or may not be hijacked on occasion to debug new issues.
 * I'll never tell.
 */

var sgf = require('..');
var fs = require('fs');
var util = require('util');

// Grab example SGF files
var simpleExample = fs.readFileSync('sgf/simple_example.sgf', { encoding: 'utf8' });
var example = fs.readFileSync('sgf/example.sgf', { encoding: 'utf8' });

// Parse them into JS Game Records
var parsedSimpleExample = sgf.parse(simpleExample);
var parsedExample = sgf.parse(example);

// Show our JS Game Records
console.log('A simple example:', util.inspect(parsedSimpleExample, false, null));
console.log('An official example:', util.inspect(parsedExample, false, null));

// Turn JS Game Records into SGF files
//var simpleExampleSGF = sgf.generate(parsedSimpleExample);
//fs.writeFileSync('output/simple-example.sgf', simpleExampleSGF, { encoding: 'utf8' });

//var exampleSGF = sgf.generate(parsedExample);
//fs.writeFileSync('output/example.sgf', exampleSGF, { encoding: 'utf8' });
