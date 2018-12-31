#! /usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const yargs = tslib_1.__importStar(require("yargs-parser"));
const walker_1 = tslib_1.__importDefault(require("./components/walker"));
const args = yargs.default(process.argv.slice(2));
walker_1.default(args._[0]);
//# sourceMappingURL=index.js.map