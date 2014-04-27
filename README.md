# smartgame [![Build Status](https://api.travis-ci.org/neagle/smartgame.png?branch=master)](https://travis-ci.org/neagle/smartgame)

A node library for parsing [SGF format game records](http://www.red-bean.com/sgf/index.html) into JavaScript and back again.

Installation
============

For most projects, you'll just want to install smartgame locally and add it to your project's dependencies in `package.json`:

```
$ npm install --save smartgame
```

If you want (for whatever reason) to use smartgame anywhere, you can install it globally.

```
$ npm install -g smartgame
```

Usage
=====

	var sgf = require('smartgame');
	var fs = require('fs');

	// Grab an SGF file from somewhere
	var example = fs.readFileSync('sgf/example.sgf', { encoding: 'utf8' });

	var game = sgf.parse(example);

	// ... use game however you want!

	// ... when game has been modified and you want to save it as an .sgf file
	var record = sgf.generate(game);
	fs.writeFileSync('new-example.sgf', record, { encoding: 'utf8' });

Example JS Game Record
======================

Let's take a very simple SGF file as an example:

	(;GM[1]FF[4]CA[UTF-8]SZ[19];B[pd];W[dp];B[pp](;W[dd])(;W[dc];B[ce];W[ed](;B[ch];W[jc])(;B[ci])))

The parse function would turn this into a JS Object that looked like this:

	{
		sequences: [
			{
				parent: <a reference to the parent object>,
				nodes: [
					{ GM: '1', FF: '4', CA: 'UTF-8', SZ: '19' },
					{ B: 'pd' },
					{ W: 'dp' },
					{ B: 'pp' }
				],
				sequences: [
					{
						parent: <a reference to the parent object>,
						nodes: [
							{ W: 'dd' }
						]
					},
					{
						parent: <a reference to the parent object>,
						nodes: [
							{ W: 'dc' },
							{ B: 'ce' },
							{ W: 'ed' }
						],
						sequences: [
							{
								parent: <a reference to the parent object>,
								nodes: [
									{ B: 'ch' },
									{ W: 'jc' }
								]
							},
							{
								parent: <a reference to the parent object>,
								nodes: [
									{ B: 'ci' }
								]
							}
						]
					}
				]
			}
		]
	}

You'll still have to [read up a little bit on the way SGFs work](http://www.red-bean.com/sgf/index.html), but the structure is a simple and straightforward representation of the SGF in JS form.

License
=======

MIT
