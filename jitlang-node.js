/*
    JITLang-NodeJS alpha 0.0.1
    -copy of "jitlang-alpha-0.0.1.js" except it uses `module` instead of `window` for compatibility with NodeJS

    Big thanks to http://craftinginterpreters.com for teaching me the fundamentals of creating my own language
    All code is owned by Vexcess and is available under my modified MIT license: https://github.com/vExcess/JITLang/blob/main/LICENSE
*/

    // This is the stupidity you must do because JavaScript doesn't have enums >:(
    let idGeneratorIdx = 0, ID = () => { return idGeneratorIdx++; };
    
    // tokens
    const 
    TILDE =ID(),
    LEFT_PAREN =ID(), RIGHT_PAREN =ID(),
    LEFT_BRACE =ID(), RIGHT_BRACE =ID(),
    LEFT_BRACKET =ID(), RIGHT_BRACKET =ID(),
    COMMA =ID(),
    DOT =ID(),
    COLON =ID(), SEMICOLON =ID(),
    PLUS =ID(), PLUS_EQUAL =ID(), PLUS_PLUS =ID(),
    MINUS =ID(), MINUS_EQUAL =ID(), MINUS_MINUS =ID(),
    ASTERISK =ID(), ASTERISK_EQUAL =ID(), EXPONENT =ID(), EXPONENT_EQUAL =ID(),
    SLASH =ID(), SLASH_EQUAL =ID(),
    CARET =ID(),
    QUESTION =ID(),
    MODULUS =ID(), MODULUS_EQUAL =ID(),
    BANG =ID(), BANG_EQUAL =ID(),
    EQUAL =ID(), EQUAL_EQUAL =ID(), ARROW =ID(),
    GREATER =ID(), GREATER_EQUAL =ID(),
    LESS =ID(), LESS_EQUAL =ID(),
    BIT_OR =ID(), OR =ID(),
    BIT_AND =ID(), AND =ID(),
    BIT_XOR =ID(),
    BITSHIFT_LEFT =ID(), BITSHIFT_RIGHT =ID(), UNSIGNED_BITSHIFT_RIGHT =ID(),

    CAST =ID(),

    // Literals
    IDENTIFIER =ID(), TEMPLATE_LITERAL =ID(), NUMBER =ID(),
    
    // Reserved Words
    LET =ID(), CONST =ID(), IF =ID(), ELSE =ID(), DO =ID(), 
    WHILE =ID(), FOR =ID(), STRUCT =ID(), CLASS =ID(), PRIVATE =ID(), 
    STATIC =ID(), SUPER =ID(), EXTENDS =ID(), INHERIT =ID(), 
    ENUM =ID(), TRY =ID(), CATCH =ID(), THROW =ID(), RETURN =ID(), 
    SWITCH =ID(), CASE =ID(), DEFAULT =ID(), BREAK =ID(), CONTINUE =ID(), 
    NEW =ID(), THIS =ID(), TRUE =ID(), FALSE =ID(), INFINITY =ID(), 
    IMPORT =ID(), EXPORT =ID(), FROM =ID(), AS =ID(), ASYNC =ID(), 
    AWAIT =ID(), TYPEOF =ID(),

    // data types keywords
    VOID =ID(), NULL =ID(), STRING =ID();

(() => {
    // Tokenizer Classes
    class Tok {
        constructor(type, lexeme, line) {
            if (type === undefined) throw ["SyntaxError", "Unexpected end of input"]; // WARNING
            this.TokType = type;
            this.lexeme = lexeme;
            this.line = line;

            if (type === STRING || type === CAST) {
                this.lexeme = lexeme.slice(1, lexeme.length - 1);
            }
        }
        
        toString() {
            return this.TokType + " " + this.lexeme;
        }
    }

    // AST Generator Classes
    class Expr {
        constructor(type, a, b, c, d) {
            this.ExprType = type;
            switch (type) {
                case "function":
                    this.name = a;
                    this.params = b;
                    this.body = c;
                    this.returnType = d;
                    break;
                case "binary":
                    this.left = a;
                    this.operator = b;
                    this.right = c;
                    break;
                case "logical":
                    this.left = a;
                    this.operator = b;
                    this.right = c;
                    break;
                case "grouping":
                    this.expression = a;
                    break;
                case "literal":
                    this.value = a;
                    break;
                case "unary":
                    this.operator = a;
                    this.right = b;
                    break;
                case "assign":
                    this.name = a;
                    this.value = b;
                    break;
                case "call":
                    this.callee = a;
                    this.paren = b;
                    this.args = c;
                case "variable":
                    this.type = a;
                    this.name = b;
                    break;
            }
        }
    }

    class Stmt {
        constructor(type, a, b, c, d) {
            this.StmtType = type;
            switch (type) {
                case "expression":
                    this.expression = a;
                    break;
                case "function":
                    this.name = a;
                    this.params = b;
                    this.body = c;
                    this.returnType = d;
                    break;
                case "class":
                    this.name = a;
                    this.methods = b;
                    break;
                case "print":
                    this.expression = a;
                    break;
                case "return":
                    this.keyword = a;
                    this.value = b;
                    break;
                case "block":
                    this.statements = a;
                    break;
                case "if":
                    this.condition = a;
                    this.thenBranch = b;
                    this.elseBranch = c;
                    break;
                case "while":
                    this.condition = a;
                    this.body = b;
                    break;
                case "variable":
                    this.modifiers = a;
                    this.name = b;
                    this.initializer = c;
                    break;
            }
        }
    }

    // VM Classes
    class Return {
        constructor(value) {
            this.value = value;
        }
    }

    class Environment {
        values = new Map();
        enclosing;
        interpreter;

        constructor(enclosing, interpreter){
            this.enclosing = enclosing ?? null;
            this.interpreter = interpreter;
        }

        define(name, value) {
            this.values.set(name, value);
        }

        get(name) {
            if (this.values.has(name)) {
                return this.values.get(name);
            }

            if (this.enclosing !== null) {
                return this.enclosing.get(name);
            }

            this.interpreter.handleError("ReferenceError", name + " is " + name.lexeme);
        }

        assign(name, value) {
            if (this.values.has(name)) {
                this.values.set(name, value);
                return;
            }

            if (this.enclosing !== null) {
                this.enclosing.assign(name, value);
                return;
            }

            this.interpreter.handleError("ReferenceError", name + " is " + name.lexeme);
        }
    }

    function determinePrimitiveDataType(lexeme) {
        if (lexeme === "void" || lexeme === "null") return lexeme;
        if (Number.isNaN(Number(lexeme))) return "string";
        if (lexeme.includes(".")) return "double";
        return "int";
    }

    class JITLangFunction {
        constructor(declaration, closure, interpreter) {
            this.declaration = declaration;
            this.closure = closure;
            this.interpreter = interpreter;
        }

        arity() {
            return this.declaration.params.length;
        }

        call(interpreter, args) {
            let environment = new Environment(this.closure, this.interpreter);
            for (let i = 0; i < this.declaration.params.length; i++) {
                environment.define(
                    this.declaration.params[i].lexeme,
                    args[i]
                );
            }
            try {
                interpreter.executeBlock(this.declaration.body, environment);
            } catch (returnValue) {
                if (returnValue instanceof Return) {
                    console.log("GOT ERETURN", returnValue)
                    return {
                        type: determinePrimitiveDataType("" + returnValue.value),
                        nat: returnValue.value
                    };
                } else {
                    throw returnValue;
                }
            }
            return {
                type: "void",
                nat: undefined
            };
        }

        toString() {
            let paramsStr = "";
            let funDec = this.declaration;
            for (let i = 0; i < funDec.parameters.length; i++) {
                paramsStr += (funDec.parameters[i].type ? funDec.parameters[i].type + " " : "") + funDec.parameters[i].lexeme + ", ";
            }
            return `${funDec.name.lexeme}(${paramsStr.slice(0, paramsStr.length - 1)}) => ${funDec.returnType === null ? "" : funDec.returnType.lexeme} {...}`;
        }
    }

    function mkNatObj(type, val) {
        return {
            type: type,
            nat: val
        }
    }

    class Interpreter {
        globals;
        environment;

        constructor(handleOutput=console.log, handleError=console.error) {
            const that = this;
            this.globals = new Environment(undefined, this);
            this.environment = this.globals;

            this.globals.define("println", {
                arity: () => 1,
                call: (interpreter, args) => {
                    that.handleOutput(args[0].nat);
                    return {
                        type: "void",
                        nat: undefined
                    }
                },
                toString: () => { return "() { <native code> }"; }
            });

            this.globals.define("millis", {
                arity: () => 0,
                call: (interpreter, args) => {
                    return {
                        type: "int",
                        nat: Date.now()
                    };
                },
                toString: () => { return "() { <native code> }"; }
            });

            this.handleOutput = handleOutput;
            this.handleError = handleError;
        }
        
        visitLiteralExpr(expr) {
            if (expr.value.TokType === STRING) {
                return mkNatObj("string", expr.value.lexeme);
            } else if (expr.value.TokType === NUMBER) {
                if (expr.value.lexeme.includes(".")) {
                    return mkNatObj("int", parseFloat(expr.value.lexeme, 10));
                } else {
                    return mkNatObj("int", parseInt(expr.value.lexeme, 10));
                }
            }
            throw "BAD LITERAL EXPR " + expr;
        }

        evaluate(expr) {
            switch (expr.ExprType) {
                case "binary":
                    return this.visitBinaryExpr(expr);
                case "logical":
                    return this.visitLogicalExpr(expr);
                case "unary":
                    return this.visitUnaryExpr(expr);
                case "grouping":
                    return this.visitGroupingExpr(expr);
                case "call":
                    return this.visitCallExpr(expr);
                case "variable":
                    return this.environment.get(expr.name);
            }
            return this.visitLiteralExpr(expr);
        }
        
        visitGroupingExpr(expr) {
            return this.evaluate(expr.expression);
        }

        isTruthy(natObj) {
            if (natObj.type === "bool") return natObj.nat;
            if (natObj.nat === null || natObj.nat === 0 || natObj.nat === undefined) return false;
            return true;
        }

        isEqual(a, b) {
            if (a.type !== b.type) return false;
            return a.nat === b.nat;
        }

        visitUnaryExpr(expr) {
            let right = this.evaluate(expr.right);

            switch (expr.operator.TokType) {
                case BANG:
                    return mkNatObj("bool", !this.isTruthy(right));
                case MINUS:
                    return mkNatObj(right.type, -Number(right));
            }

            return null; // Unreachable
        }
        
        isNumberType(typeStr) {
            return ["bool", "byte", "short", "char", "int", "uint", "long", "ulong", "float", "double"].includes(typeStr);
        }

        isStringType(typeStr) {
            return typeStr === "string" || typeStr === "String";
        }

        determineImplicitCast(type1, type2) {
            const floatingPoint = ["float", "double"];
            if (floatingPoint.includes(type1) && !floatingPoint.includes(type2)) {
                return type1;
            } else if (!floatingPoint.includes(type1) && floatingPoint.includes(type2)) {
                return type2;
            } else {
                const signed = ["short", "int", "long", "float", "double"];
                if (signed.includes(type1) && !signed.includes(type2)) {
                    return type1;
                } else if (!signed.includes(type1) && signed.includes(type2)) {
                    return type2;
                } else {
                    const bitCount = {
                        "bool": 1,
                        "byte": 8,
                        "short": 16,
                        "char": 16,
                        "int": 32,
                        "uint": 32,
                        "long": 64,
                        "ulong": 64,
                        "float": 64,
                        "double": 64
                    }
                    if (bitCount[type2] > bitCount[type1]) {
                        return type2;
                    } else {
                        return type1;
                    }
                }
            }
        }

        checkNumberOperand(operator, operand) {
            if (this.isNumberType(operand.type)) return;
            this.handleError("TypeError", JSON.stringify(operator) + "\nOperand must be a number.");
        }

        checkNumberOperands(operator, left, right) {
            if (this.isNumberType(left.type) && this.isNumberType(right.type)) return;
            this.handleError("TypeError", JSON.stringify(operator) + "\nOperands must be a number.");
        }

        visitBinaryExpr(expr) {
            let left = this.evaluate(expr.left);
            let right = this.evaluate(expr.right);

            // console.log("BINOP", expr.operator, left, right)
            switch (expr.operator.TokType) {
                case GREATER:
                    this.checkNumberOperands(expr.operator, left, right);
                    return mkNatObj("bool", left.nat > right.nat);
                case GREATER_EQUAL:
                    this.checkNumberOperands(expr.operator, left, right);
                    return mkNatObj("bool", left.nat >= right.nat);
                case LESS:
                    this.checkNumberOperands(expr.operator, left, right);
                    return mkNatObj("bool", left.nat < right.nat);
                case LESS_EQUAL:
                    this.checkNumberOperands(expr.operator, left, right);
                    return mkNatObj("bool", left.nat <= right.nat);
                case BANG_EQUAL: 
                    return mkNatObj("bool", !this.isEqual(left, right));
                case EQUAL_EQUAL: 
                    return mkNatObj("bool", this.isEqual(left, right));

                case MINUS:
                    this.checkNumberOperands(expr.operator, left, right);
                    return mkNatObj(this.determineImplicitCast(left.type, right.type), left.nat - right.nat);
                case SLASH:
                    this.checkNumberOperands(expr.operator, left, right);
                    if (left.nat === 0 && right.nat === 0) {
                        return mkNatObj("void", undefined);
                    }
                    return mkNatObj(this.determineImplicitCast(left.type, right.type), left.nat / right.nat);
                case ASTERISK:
                    this.checkNumberOperands(expr.operator, left, right);
                    return mkNatObj(this.determineImplicitCast(left.type, right.type), left.nat * right.nat);
                case PLUS:
                    if (this.isNumberType(left.type) && this.isNumberType(right.type)) {
                        return mkNatObj(this.determineImplicitCast(left.type, right.type), left.nat + right.nat);
                    } else if (this.isStringType(left.type) && this.isStringType(right.type)) {
                        return mkNatObj("string", left.nat + right.nat);
                    } else if (this.isNumberType(left.type) && this.isStringType(right.type)) {
                        return mkNatObj("string", left.nat.toString() + right.nat);
                    } else if (this.isStringType(left.type) && this.isNumberType(right.type)) {
                        return mkNatObj("string", left.nat + right.nat.toString());
                    }

                    this.handleError("TypeError", JSON.stringify(expr.operator) + "\nOperands to '+' operator must be numbers or strings");
            }

            // Unreachable
            return null;
        }

        stringify(object) {
            if (object === null) return "null";
            if (object === undefined) return "void";

            if (typeof object === "number") {
                let text = object.toString();
                if (text.endsWith(".0")) {
                    text = text.slice(0, text.length() - 2);
                }
                return text;
            }

            return object.toString();
        }

        visitVarStmt(stmt) {
            let value = null;
            if (stmt.initializer !== null) {
                value = this.evaluate(stmt.initializer);
            }

            this.environment.define(stmt.name.lexeme, value);
            return null;
        }

        visitVariableExpr(expr) {
            return this.environment.get(expr.name);
        }

        visitPrintStmt(stmt) {
            let value = this.evaluate(stmt.expression);
            if (value instanceof JITLangFunction) {
                output(value.toString());
            } else {
                output(this.stringify(value));
            }                
            return null;
        }

        visitAssignExpr(expr) {
            if (expr.ExprType === "call") {
                return this.visitCallExpr(expr);
            } else {
                let value = this.evaluate(expr.value);
                this.environment.assign(expr.name, value);
                return value;
            }
        }

        visitIfStmt(stmt) {
            if (this.isTruthy(this.evaluate(stmt.condition))) {
                this.execute(stmt.thenBranch);
            } else if (stmt.elseBranch !== null) {
                this.execute(stmt.elseBranch);
            }
            return null;
        }

        visitLogicalExpr(expr) {
            let left = this.evaluate(expr.left);
            
            if (expr.operator.TokType === OR) {
                if (this.isTruthy(left)) return left;
            } else {
                if (!this.isTruthy(left)) return left;
            }

            return this.evaluate(expr.right);
        }

        visitWhileStmt(stmt) {
            while (this.isTruthy(this.evaluate(stmt.condition))) {
                this.execute(stmt.body);
            }
            return null;
        }

        executeBlock(statements, environment) {
            let previous = this.environment;
            try {
                this.environment = environment;

                for (let i = 0; i < statements.length; i++) {
                    this.execute(statements[i]);
                }
            } finally {
                this.environment = previous;
            }
        }

        visitBlockStmt(stmt) {
            this.executeBlock(stmt.statements, new Environment(this.environment, this));
            return null;
        }

        visitCallExpr(expr) {
            let callee = this.evaluate(expr.callee);

            let args = [];
            for (let i = 0; i < expr.args.length; i++) {
                args.push(this.evaluate(expr.args[i]));
            }

            let fxn = callee;
            if (fxn && fxn.arity) {
                while (args.length < fxn.arity()) {
                    args.push(undefined);
                }
    
                if (!fxn.call) {
                    this.handleError("SyntaxError", JSON.stringify(fxn) + "\nCan only call functions and classes");
                }
    
                // console.log("RETURNED", fxn.call)
                return fxn.call(this, args);
            } else {
                this.handleError("TypeError", expr.callee.name + " is not a function");
            }
        }

        visitFunctionStmt(stmt) {
            let fxn = new JITLangFunction(stmt, this.environment);
            this.environment.define(stmt.name.lexeme, fxn);
            return null;
        }

        visitReturnStmt(stmt) {
            let value = null;
            if (stmt.value !== null) value = this.evaluate(stmt.value);
            throw new Return(value);
        }

        execute(stmt) {
            switch (stmt.StmtType) {
                case "print": //temporary
                    return this.visitPrintStmt(stmt);
                case "variable":
                    return this.visitVarStmt(stmt);
                case "expression":
                    return this.visitAssignExpr(stmt.expression);
                case "block":
                    return this.visitBlockStmt(stmt);
                case "if":
                    return this.visitIfStmt(stmt);
                case "while":
                    return this.visitWhileStmt(stmt);
                case "function":
                    return this.visitFunctionStmt(stmt);
                case "return":
                    return this.visitReturnStmt(stmt);
            }
        }

        eval(statements) { 
            // try {
                for (let i = 0; i < statements.length; i++) {
                    this.execute(statements[i]);
                }
            // } catch (e) {
            //     this.handleError("VMError", e);
            // }
        }
    }

    const JITLang = {
        tokenize: function(code, reportError=console.error) {
            /*
                tokenize converts a string of code into recognizable individual operators and literals.
            */
    
            const keywords = {
                "let": LET, 
                "const": CONST, 
                "if": IF, 
                "else": ELSE, 
                "do": DO, 
                "while": WHILE, 
                "for": FOR, 
                "struct": STRUCT, 
                "class": CLASS, 
                "private": PRIVATE, 
                "static": STATIC, 
                "super": SUPER, 
                "extends": EXTENDS, 
                "inherit": INHERIT, 
                "enum": ENUM, 
                "try": TRY, 
                "catch": CATCH, 
                "throw": THROW, 
                "return": RETURN, 
                "switch": SWITCH, 
                "case": CASE, 
                "default": DEFAULT, 
                "break": BREAK, 
                "continue": CONTINUE, 
                "new": NEW, 
                "this": THIS, 
                "true": TRUE, 
                "false": FALSE, 
                "Infinity": INFINITY, 
                "import": IMPORT, 
                "export": EXPORT, 
                "from": FROM, 
                "as": AS, 
                "async": ASYNC, 
                "await": AWAIT, 
                "typeof": TYPEOF,
                "void": VOID,
                "null": NULL
            };
    
            let tokens = [],
                start = 0,
                current = 0,
                line = 1;
            
            // utils
            const addToken = (type, lexeme) => {
                try {
                    tokens.push(new Tok(type, lexeme, line));
                } catch (endOfInputError) {
                    reportError(...endOfInputError);
                }
            }
            const isDigit = c => c >= '0' && c <= '9';
            const isAlpha = c => (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || c === '_' || c > '~';
            const isAlphaNumeric = c => isAlpha(c) || isDigit(c);
            const isAtEnd = () => current >= code.length;
            const peek = () => current >= code.length ? '\0' : code[current];
            const peekAhead = (amt=1) => (current + amt >= code.length) ? '\0' : code[current + amt];
            const match = expected => {
                if (current >= code.length || code[current] !== expected) return false;
                current++;
                return true;
            };
            const getLex = () => code.slice(start, current);
            
            function string() {
                while (peek() !== '"' && !isAtEnd()) {
                    if (peek() === '\n') line++;
                    current++;
                }
                
                if (isAtEnd()) {
                    reportError("SyntaxError", "Unterminated string");
                    return;
                }
                
                // The closing "
                current++;
                
                addToken(STRING, getLex());
            }
            
            function number() {
                while (isDigit(peek())) current++;
                
                // Look for a fractional part.
                if (peek() === '.' && isDigit(peekAhead())) {
                    // Consume the "."
                    current++;
                    
                    while (isDigit(peek())) current++;
                }
                
                addToken(NUMBER, getLex());
            }
            
            function identifier() {
                while (isAlphaNumeric(peek())) current++;
                let text = code.slice(start, current);
                let type = keywords[text];
                if (type === undefined) type = IDENTIFIER;
                addToken(type, getLex());
            }
            
            while (!isAtEnd()) {
                start = current;
                
                // scan token
                let c = code[current++], lookC;
                
                switch (c) {
                    // Ignore whitespace.
                    case ' ':
                    case '\r':
                    case '\t':
                        // do nothing
                        break;
    
                    // keep track of line numbers
                    case '\n':
                        line++;
                        break;
    
                    case '(':
                        addToken(LEFT_PAREN, getLex());
                        break;
    
                    case ')':
                        addToken(RIGHT_PAREN, getLex());
                        break;
    
                    case '[':
                        addToken(LEFT_BRACKET, getLex());
                        break;
    
                    case ']':
                        addToken(RIGHT_BRACKET, getLex());
                        break;
    
                    case '{':
                        addToken(LEFT_BRACE, getLex());
                        break;
    
                    case '}': 
                        addToken(RIGHT_BRACE, getLex());
                        break;
    
                    case ',': 
                        addToken(COMMA, getLex());
                        break;
    
                    case '.': 
                        addToken(DOT, getLex());
                        break;
    
                    case '+':
                        addToken(match('=') ? PLUS_EQUAL : (match("+") ? PLUS_PLUS : PLUS), getLex());
                        break;
    
                    case '-':
                        addToken(match('=') ? MINUS_EQUAL : (match("-") ? MINUS_MINUS : MINUS), getLex());
                        break;
    
                    case '*':
                        addToken(match('=') ? ASTERISK_EQUAL : (match("*") ? (match("=") ? EXPONENT_EQUAL : EXPONENT) : ASTERISK), getLex());
                        break;
    
                    case '/':
                        if (match('/')) {
                            // A comment goes until the end of the line.
                            while (peek() !== '\n' && !isAtEnd()) current++;
                        } else {
                            addToken(match('=') ? SLASH_EQUAL : SLASH, getLex());
                        }
                        break;
    
                    case '%':
                        addToken(match('=') ? MODULUS_EQUAL : MODULUS, getLex());
                        break;
    
                    case ';': 
                        addToken(SEMICOLON, getLex());
                        break;
    
                    case '~': 
                        addToken(TILDE, getLex());
                        break;
    
                    case '^': 
                        addToken(BIT_XOR, getLex());
                        break;
    
                    case '&':
                        addToken(match('&') ? AND : BIT_AND, getLex());
                        break;
    
                    case '|':
                        addToken(match('|') ? OR : BIT_OR, getLex());
                        break;
                    
                    case '!':
                        addToken(match('=') ? BANG_EQUAL : BANG, getLex());
                        break;
    
                    case '=':
                        if (match(">")) {
                            addToken(ARROW, getLex());
                        } else {
                            addToken(match('=') ? EQUAL_EQUAL : EQUAL, getLex());
                        }
                        break;
    
                    case '<':
                        if (match('=')) {
                            addToken(LESS_EQUAL, getLex());
                        } else if (match('<')) {
                            addToken(BITSHIFT_LEFT, getLex());
                        } else {
                            lookC = current;
                            while (lookC < code.length && isAlphaNumeric(code[lookC])) lookC++;
                            if (code[lookC] === ">") {
                                current = lookC + 1;
                                addToken(CAST, getLex());
                            } else {
                                addToken(match('=') ? LESS_EQUAL : LESS, getLex());
                            }
                        }                        
                        break;
    
                    case '>':
                        addToken(match('=') ? GREATER_EQUAL : (match('>') ? (match('>') ? UNSIGNED_BITSHIFT_RIGHT : BITSHIFT_RIGHT) : GREATER), getLex());
                        break;
    
                    case '?':
                        addToken(QUESTION, getLex());
                        break;
    
                    case ':':
                        addToken(COLON, getLex());
                        break;
                    
                    case '"':
                        string();
                        break;
                    
                    default:
                        if (isDigit(c)) {
                            number();
                        } else if (isAlpha(c)) {
                            identifier();
                        } else {
                            reportError("SyntaxError", "Unexpected Token")
                        }
                        break;
                }
            }
            
            return tokens;
        },
        createAST: function(tokens, reportError=console.error) {
            /*
                createAST converts an array of tokens into an abstract syntax tree
            */
    
            // reorder function tokens to make processing easier
            for (let i = 0; i < tokens.length; i++) {
                let tok = tokens[i];
                if (tok.TokType === ARROW) {
                    // find function beginning
                    let ptr = i - 1;
                    while (ptr >= 0 && tokens[ptr].TokType !== LEFT_PAREN) {
                        ptr--;
                    }
    
                    // handle function identifier
                    if (ptr > 0 && tokens[ptr - 1].TokType === IDENTIFIER) ptr--;
    
                    // shift tokens
                    for (let j = i; j >= ptr; j--) {
                        tokens[j] = tokens[j - 1];
                    }
    
                    tokens[ptr] = tok;
                }
            }
        
            let current = 0, quit = false;
    
            // utils
            const isAtEnd = () => current >= tokens.length;
            const peekPrev = () => tokens[current - 1];
            const peek = () => tokens[current];
            const peekAhead = (amt=1) => current + amt >= tokens.length ? null : tokens[current + amt];
            const advance = () => current >= tokens.length ? null : tokens[current++];
            const check = type => current >= tokens.length ? false : tokens[current].TokType === type;
            const checkAhead = (type, howMuch=1) => current + howMuch >= tokens.length ? false : tokens[current + howMuch].TokType === type;
            const match = (...types) => {
                for (let type of types) {
                    if (!isAtEnd() && tokens[current].TokType === type) {
                        current++;
                        return true;
                    }
                }
                return false;
            };
            const consume = (type, message) => {
                if (check(type)) return tokens[current++];
                if (typeof message === "string") {
                    throwError("CompilerError", message + "\n" + JSON.stringify(tokens[current]));
                    quit = true;
                }
            };
            const isPrimitive = tok => ["bool","byte","short","char","int","uint","long","ulong","float","double","void","null","BigInt"].includes(tok.TokType);

            function synchronize() {
                advance();
    
                while (!isAtEnd()) {
                    if (peekPrev().TokType === SEMICOLON) return;
    
                    switch (peek().type) {
                        case CLASS:
                        case ARROW:
                        case LET:
                        case FOR:
                        case IF:
                        case WHILE:
                        case RETURN:
                        return;
                    }
    
                    advance();
                }
            }
    
            function throwError(...args) { 
                reportError(...args);
                synchronize();
            }
    
            function primary() {
                if (!isAtEnd()) {
                    let currTokType = tokens[current].TokType;
                    if ([FALSE, TRUE, NULL, VOID, NUMBER, STRING].includes(currTokType)) {
                        current++;
                        return new Expr("literal", peekPrev());
                    } else if (currTokType === LEFT_PAREN) {
                        current++;
                        let expr = expression();
                        consume(RIGHT_PAREN, "Expect ')' after expression.");
                        return new Expr("grouping", expr);
                    } else if (currTokType === IDENTIFIER) {
                        current++;
                        let varTok = peekPrev();
                        return new Expr("variable", varTok.TokType, varTok.lexeme);
                    }
                }
    
                throwError("CompilerError", JSON.stringify(peekPrev()) + "\nExpected expression.");
            }
    
            function finishCall(callee) {
                let args = [];
                if (!check(RIGHT_PAREN)) {
                    do {
                        args.push(expression());
                    } while (match(COMMA));
                }
    
                let paren = consume(RIGHT_PAREN, "Expect ')' after arguments.");
    
                if (args.length > 255) {
                    throwError("CompilerError", peek() + "\nFunction can't take more than 255 arguments");
                }
    
                return new Expr("call", callee, paren, args);
            }
    
            function call() {
                let expr = primary();
    
                while (true) { 
                    if (match(LEFT_PAREN)) {
                        expr = finishCall(expr);
                    } else {
                        break;
                    }
                }
    
                return expr;
            }
            
            function unary() {
                if (match(BANG, MINUS, CAST)) {
                    let operator = peekPrev();
                    let right = unary();
                    return new Expr("unary", operator, right);
                }
                return call();
            }
    
            function factor() {
                let expr = unary();
                while (match(SLASH, ASTERISK)) {
                    let operator = peekPrev();
                    let right = unary();
                    expr = new Expr("binary", expr, operator, right);
                }
                return expr;
            }
    
            function term() {
                let expr = factor();
                while (match(MINUS, PLUS)) {
                    let operator = peekPrev();
                    let right = factor();
                    expr = new Expr("binary", expr, operator, right);
                }
                return expr;
            }
    
            function comparison() {
                let expr = term();
                while (match(GREATER, GREATER_EQUAL, LESS, LESS_EQUAL)) {
                    let operator = peekPrev();
                    let right = term();
                    expr = new Expr("binary", expr, operator, right);
                }
                return expr;
            }
    
            function equality() {
                let expr = comparison();
                while (match(BANG_EQUAL, EQUAL_EQUAL)) {
                    let operator = peekPrev();
                    let right = comparison();
                    expr = new Expr("binary", expr, operator, right);
                }
                return expr;
            }
    
            function and() {
                let expr = equality();
                while (match(AND)) {
                    let operator = peekPrev();
                    let right = equality();
                    expr = new Expr("logical", expr, operator, right);
                }
                return expr;
            }
    
            function or() {
                let expr = and();
                while (match(OR)) {
                    let operator = peekPrev();
                    let right = and();
                    expr = new Expr("logical", expr, operator, right);
                }
                return expr;
            }
    
            function assignment() {
                let expr = or();
    
                if (match(EQUAL)) {
                    let equals = peekPrev();
                    let value = assignment();
    
                    if (expr instanceof Expr) {
                        return new Expr("assign", expr.name, value);
                    }
    
                    error(equals, "Invalid assignment target."); 
                }
    
                return expr;
            }
    
            function expression() {
                return assignment();
            }
    
            function ifStatement() {
                consume(LEFT_PAREN, "Expect '(' after 'if'.");
                let condition = expression();
                consume(RIGHT_PAREN, "Expect ')' after if condition.");
    
                let thenBranch = statement();
                let elseBranch = null;
                if (match(ELSE)) {
                    elseBranch = statement();
                }
    
                return new Stmt("if", condition, thenBranch, elseBranch);
            }
    
            function expressionStatement() {
                let expr = expression();
                if(check(SEMICOLON)) consume(SEMICOLON, "Expect ';' after expression.");
                
                return new Stmt("expression", expr);
            }
    
            function block() {
                let statements = [];
                while (!check(RIGHT_BRACE) && !isAtEnd()) {
                    statements.push(declaration());
                }
                consume(RIGHT_BRACE, "Expect '}' after block.");
                return statements;
            }
    
            function whileStatement() {
                consume(LEFT_PAREN, "Expect '(' after 'while'.");
                let condition = expression();
                consume(RIGHT_PAREN, "Expect ')' after condition.");
                let body = statement();
                return new Stmt("while", condition, body);
            }
    
            function forStatement() {
                consume(LEFT_PAREN, "Expect '(' after 'for'.");
    
                let initializer;
                if (match(SEMICOLON)) {
                    initializer = null;
                } else if (match(LET)) {
                    initializer = variableDeclaration(["let"]);
                } else {
                    initializer = expressionStatement();
                }
                
    
                let condition = null;
                if (!check(SEMICOLON)) {
                    condition = expression();
                }
                consume(SEMICOLON, "Expect ';' after loop condition.");
    
                let increment = null;
                if (!check(RIGHT_PAREN)) {
                    increment = expression();
                }
                consume(RIGHT_PAREN, "Expect ')' after for clauses.");
    
                let body = statement();
    
                if (increment !== null) {
                    body.statements.push(new Stmt("expression", increment));
                }
    
                if (condition === null) condition = new Expr("literal", true);
                body = new Stmt("while", condition, body);
    
                if (initializer !== null) {
                    body = new Stmt("block", [initializer, body]);
                }
    
                return body;
            }
    
            function returnStatement() {
                let keyword = peekPrev();
                let value = new Expr("literal", undefined);
                if (!check(SEMICOLON)) {
                    value = expression();
                }
                consume(SEMICOLON, "Expect ';' after return value.");
                return new Stmt("return", keyword, value);
            }
    
            function statement() {
                if (match(FOR)) return forStatement();
                if (match(IF)) return ifStatement();
                if (match(RETURN)) return returnStatement();
                if (match(WHILE)) return whileStatement();
                if (match(LEFT_BRACE)) return new Stmt("block", block());
                return expressionStatement();
            }
    
            function variableDeclaration(modifiers) {
                let name = consume(IDENTIFIER, "Expect variable name.");
                let initializer = null;
                if (match(EQUAL)) initializer = expression();
                if (check(SEMICOLON)) consume(SEMICOLON);
                // if (check(COMMA)) {
                //     consume(COMMA);
                //     variableDeclaration();
                // }
                return new Stmt("variable", modifiers, name, initializer);
            }
    
            function functionDeclaration(kind) {
                let name = null, parameters = [];
                if (check(IDENTIFIER)) name = consume(IDENTIFIER);
                consume(LEFT_PAREN, "Expect '(' after " + kind + " name.");
                if (!check(RIGHT_PAREN)) {
                    do { // a rare scenario where a do/while loop is actually useful :O
                        if (parameters.length > 255) {
                            throwError("SyntaxError", peek() + "Can't have more than 255 parameters.");
                        }
    
                        let param;
                        if (check(IDENTIFIER) && (peekAhead().TokType === COMMA || peekAhead().TokType === RIGHT_PAREN)) {
                            param = consume(IDENTIFIER, "Expect parameter name.");
                        } else {
                            let paramType = peek();
                            current++;
                            param = consume(IDENTIFIER, "Expect parameter name.");
                            param.type = paramType;
                        }
                        parameters.push(param);
                    } while (match(COMMA));
                }
                consume(RIGHT_PAREN, "Expect ')' after " + kind + " parameters.");
                let returnType = null;
                if (isPrimitive(peek()) || check(NULL) || check(VOID) || check(IDENTIFIER)) {
                    returnType = peek();
                    current++;
                }
                consume(LEFT_BRACE, "Expect '{' before " + kind + " body.");
                let body = block();
                if (check(SEMICOLON)) consume(SEMICOLON);
                return name === null ? new Expr("function", name, parameters, body, returnType) : new Stmt("function", name, parameters, body, returnType);
            }
    
            function classDeclaration() {
                let name = consume(IDENTIFIER, "Expect class name.");
                consume(LEFT_BRACE, "Expect '{' before class body.");
                
                let methods = [];
                while (!check(RIGHT_BRACE) && !isAtEnd()) {
                    current++;
                    methods.push(functionDeclaration("method"));
                }
    
                for (let i = 0; i < methods.length; i++) {
                    if (methods[i].type !== null && methods[i].name.lexeme === name) {
                        throwError("Syntax Error", "Constructors cannot have a return type");
                    }
                }
    
                consume(RIGHT_BRACE, "Expect '}' after class body.");
    
                return new Stmt("class", name, methods);
            }
    
            function declaration() {
                try {
                    // class declr
                    if (match(CLASS)) return classDeclaration();

                    // function declr
                    if (match(ARROW)) return functionDeclaration("function");

                    // variable declr
                    if (check(LET) || check(CONST) || (check(IDENTIFIER) && (checkAhead(EQUAL) || checkAhead(IDENTIFIER)))) {
                        let j = 1;
                        let modifiers = [peek().lexeme];
                        while (current + j + 1 < tokens.length && checkAhead(IDENTIFIER, j) && !checkAhead(EQUAL, j + 1)) {
                            modifiers.push(peekAhead(j).lexeme);
                            j++;
                        }

                        if (modifiers.length > 0 && checkAhead(EQUAL, j + 1)) {
                            current += j;
                            return variableDeclaration(modifiers);
                        }
                    }
                    
                    // statment
                    return statement();
                } catch (e) {
                    console.log(e)
                    synchronize();
                    return null;
                }
            }
    
            // parse
            let statements = [];
            while (current < tokens.length && !quit) {
                statements.push(declaration());
            }
            return statements;
        },
        createInterpreter: function(handleOutput, handleError) {
            return new Interpreter(handleOutput, handleError);
        },
        run: function(code) {
            let tokens = JITLang.tokenize(code);
            console.log(tokens)
    
            let AST = JITLang.createAST(tokens);
            console.log(JSON.stringify(AST, "", "    "))
    
            let interpreter = JITLang.createInterpreter();
            console.log(interpreter)
            
            interpreter.eval(AST);
    
            return interpreter;
        }
    };
    module.exports = JITLang;
})();
