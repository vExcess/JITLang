# JITLang
JITLang (Just In Time (compiled) Language) is a general purpose language that feels like a hybrid between JavaScript, Rust, Java, C++, and Swift. It's right on the threshold between being a programming language and a scripting language. It is designed to be JavaScript the way JavaScript should have been designed. It gets rid of the stupid features of JavaScript that nobody uses such as Object plus Array equaling Number, and Array plus Number equaling String (https://www.destroyallsoftware.com/talks/wat). JavaScript also has ambiguous syntax that JITLang does away with. It is superior to Java because "I love being forced to type out 'class Main { public static void main(String[] args) {} }' every time I want to start a program said no programmer ever" (https://www.youtube.com/watch?v=m4-HM_sCvtQ). OOP is great, but making literally everything its own class is going too far. JITLang's core philosophy is to cater to multiple programming styles by offering the best of both worlds. It offers static typing and dynamic typing, simplicity and speed, shadowing and no shadowing, garbage collection and no garbage collection, JIT compilation and AOT compilation, functional programming and OOP, classes with the flexibility of prototypes, semicolons and no semicolons, and much more. No matter what programming styles you are accustomed to JITLang has the syntax for you except for Python; if you're coming from a Python background you are going to need to unlearn all the garbage you've learned and start over.

## Feedback Appreciated
If you find any discrepancies or ambiguous cases in my specification please let me know so that I can fix them.  
Also compilers are sophisticated pieces of software with plenty of room for bugs to hide deep within the obscure corners of gnarly optimized code so please report any bugs you find.

## Notes:
  - My runtimes are a work in progress and currently only supports a subset of the language.
  - I've tried to write a complete specification, but I'm sure there are details and edge cases I haven't thought about which will result in weird bugs.
  - JITLang is theoretically capable of being faster than JavaScript, but time will tell if I can beat the insane optimizations Google has put into V8.

## Execution
JITLang source code is stored in a ".jitl" file. The source code can be interpreted, transpiled, or compiled to bytecode, machine code, or webassembly.

### Interpretation
Use ast_generator.js to compile source code into an abstract syntax tree. Then use interpreter.js to walk the tree and interpret it. Interpreting the AST is about 10,000x slower than JavaScript.

### Transpilation
Use ast_generator.js to compile source code into an abstract syntax tree. Then use transpiler.js to transpile the AST into JavaScript. Note that the semantics of the program will likely change during transpilation, but hopefully they are similiar enough that the program will be able to run without issues. Running transpiled code should be about equally as fast as JavaScript.

### Compilation to Bytecode
Source code files are compiled to JITLang bytecode files stored as ".jitb" (stands for Just In Time Bytecode) which are the equivalent to Java's ".class" files. The ".jitb" files are then run in the JITLang VM. Depending on the execution environment the JITLang VM can compile the bytecode to native machine code or wasm.

### Compilation to WebAssembly or Machine Code
Using the `#aot-compile` compiler flag increases strictness allowing the program to be compiled ahead of time instead of just in time. JITLang's primary compilation target is WASM, however in the future it will be possible to compile to native machine code.
