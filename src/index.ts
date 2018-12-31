#! /usr/bin/env node

/* var walker = require('./src/walker');

walker.examine(); */

// const argv = require('yargs-parser')(process.argv.slice(2));

import * as yargs from 'yargs-parser';
import walker from './components/walker';

const args = yargs.default(process.argv.slice(2));
walker(args._[0]);
