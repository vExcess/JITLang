// Features of the REPL:
//   Actual REPL if arguments aren't provided, or run a .jit file if provided.
//   +nonsensical errors
//   +random crashes
//   +special keys not captured (arrow key history, tab completion, delete word)

const fs = require('node:fs');
const readline = require('node:readline');

const JITLang = require('./jitlang-node.js');

var interpreter = JITLang.createInterpreter();
var Interpreter = Object.getPrototypeOf(interpreter);

Interpreter.runCode = function(codeString) {
    let tokens = JITLang.tokenize(codeString)
    let AST = JITLang.createAST(tokens)
    this.eval(AST);
    // ideally this would return the value of the top-level expression...
}

https://nodejs.org/api/readline.html#readline_example_read_file_stream_line_by_line
{}
async function processLineByLine() {
    var files = process.argv.slice(2)
    for (file of files) {
        interpreter.runCode(fs.readFileSync(file).toString())
    }
    
    // fs.createReadStream(process.argv[1]) 

    if (files.length) { return }

    const rl = readline.createInterface({
        input: process.stdin,
        crlfDelay: Infinity
    });


    var lines = 0;
    process.stdout.write(`${lines}> `);
    for await (const line of rl) {
        interpreter.runCode(line);
        lines++;
        process.stdout.write(`${lines}> `);
    }
}

processLineByLine() // important line

