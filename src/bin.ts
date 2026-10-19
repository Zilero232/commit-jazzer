#!/usr/bin/env node
import { runCli } from './cli';

void runCli({ argv: process.argv.slice(2), cwd: process.cwd() }).then((code) => {
  process.exitCode = code;
});
