// Copyright 2022 Anthony Mugendi
// 
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// 
//     http://www.apache.org/licenses/LICENSE-2.0
// 
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

const forever = require('forever-monitor'),
	chalk = require('chalk');

module.exports = (options) => {
	const { maxRestarts, script, dir } = Object.assign(
		{ maxRestarts: 20, dir: __dirname },
		options
	);

	if (!script) throw new Error('script option must be given!');
	if (typeof !maxRestarts == 'number')
		throw new Error('maxRestarts must be a number');

	const opts = {
			max: maxRestarts,
			silent: true,
			args: [],
			sourceDir: dir,
			watchDirectory: dir,
			watch: process.env.NODE_ENV == 'development',
			killTree: true,
		},
		child = new forever.Monitor(script, opts);

	child.on('start', function (f) {
		console.log(
			chalk.greenBright(
				'\n\n-----------------[started ' +
					script +
					']-----------------------'
			)
		);
	});

	child.on('restart', function (f) {
		// console.log(Object.keys(f));
		// console.log({ signal: f.killSignal });
		// console.log(Object.keys(f.child));
		// console.log(f.child.signalCode, f.child.exitCode);
		// console.log(f.childData);

		console.log(
			chalk.greenBright(
				'\n\n-----------------[restarted ' +
					script +
					']-----------------------'
			)
		);
	});

	child.on('exit', function (s) {
		// console.log({ s });

		console.log(
			chalk.redBright(
				'\n\n-----------------[Exited ' +
					script +
					' too many restarts ' +
					maxRestarts +
					']-----------------------'
			)
		);
		process.exit();
	});

	child.on('stdout', function (data) {
		data = data.toString();

		// if client ever prints a command to kill forever...
		if (data == 'PROC:KILL-FOREVER') {
			process.exit();
		} else {
			// console.log(f);
			process.stdout.write(chalk.blueBright('> ') + data);
		}
	});

	child.on('stderr', function (err) {
		// console.log(f);
		process.stderr.write(chalk.redBright('\n<!!> ') + err.toString());
	});

	child.start();

	process.on('message', (message) => {
		console.log('message from parent:', message);
	});
};
