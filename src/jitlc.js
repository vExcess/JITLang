/*
    JITLang
    Big thanks to http://craftinginterpreters.com for teaching me the fundamentals of creating my own language
    All code is owned by Vexcess and is available under my modified MIT license: https://github.com/vExcess/JITLang/blob/main/LICENSE
*/

(() => {
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
    FN =ID(), VAR =ID(), LET =ID(), IF =ID(), ELSE =ID(), DO =ID(), 
    WHILE =ID(), FOR =ID(), STRUCT =ID(), CLASS =ID(), PRIVATE =ID(), 
    STATIC =ID(), SUPER =ID(), EXTENDS =ID(), INHERIT =ID(), 
    ENUM =ID(), TRY =ID(), CATCH =ID(), THROW =ID(), RETURN =ID(), 
    SWITCH =ID(), CASE =ID(), DEFAULT =ID(), BREAK =ID(), CONTINUE =ID(), 
    NEW =ID(), THIS =ID(), TRUE =ID(), FALSE =ID(), INFINITY =ID(), 
    IMPORT =ID(), EXPORT =ID(), FROM =ID(), AS =ID(), ASYNC =ID(), 
    AWAIT =ID(), TYPEOF =ID(),

    // data types keywords
    VOID =ID(), NULL =ID(), STRING =ID();

    const TOKENS = {
        TILDE,
        LEFT_PAREN, RIGHT_PAREN,
        LEFT_BRACE, RIGHT_BRACE,
        LEFT_BRACKET, RIGHT_BRACKET,
        COMMA,
        DOT,
        COLON, SEMICOLON,
        PLUS, PLUS_EQUAL, PLUS_PLUS,
        MINUS, MINUS_EQUAL, MINUS_MINUS,
        ASTERISK, ASTERISK_EQUAL, EXPONENT, EXPONENT_EQUAL,
        SLASH, SLASH_EQUAL,
        CARET,
        QUESTION,
        MODULUS, MODULUS_EQUAL,
        BANG, BANG_EQUAL,
        EQUAL, EQUAL_EQUAL, ARROW,
        GREATER, GREATER_EQUAL,
        LESS, LESS_EQUAL,
        BIT_OR, OR,
        BIT_AND, AND,
        BIT_XOR,
        BITSHIFT_LEFT, BITSHIFT_RIGHT, UNSIGNED_BITSHIFT_RIGHT,

        CAST,

        IDENTIFIER, TEMPLATE_LITERAL, NUMBER,

        FN, VAR, LET, IF, ELSE, DO, 
        WHILE, FOR, STRUCT, CLASS, PRIVATE, 
        STATIC, SUPER, EXTENDS, INHERIT, 
        ENUM, TRY, CATCH, THROW, RETURN, 
        SWITCH, CASE, DEFAULT, BREAK, CONTINUE, 
        NEW, THIS, TRUE, FALSE, INFINITY, 
        IMPORT, EXPORT, FROM, AS, ASYNC, 
        AWAIT, TYPEOF,

        VOID, NULL, STRING
    };

    // Tokenizer and AST Generator Classes
    class Tok {
        constructor(type, lexeme, line) {
            if (type === undefined) throw ["SyntaxError", "Unexpected end of input"]; // WARNING
            this.TokType = type;
            this.line = line;

            if (type === CAST) {
                this.lexeme = lexeme.slice(1, lexeme.length - 1);
            } else if (type === STRING) {
                let newStr = "";
                for (let i = 1; i < lexeme.length - 1; i++) {
                    if (lexeme[i] !== "\\") {
                        newStr += lexeme[i];
                    } else {
                        switch (lexeme[i + 1]) {
                            case "\\":
                                newStr += "\\";
                                break;
                            case "n":
                                newStr += "\n";
                                break;
                            case "t":
                                newStr += "\t";
                                break;
                            case "r":
                                newStr += "\r";
                                break;
                            case "f":
                                newStr += "\f";
                                break;
                            case "b":
                                newStr += "\b";
                                break;
                            default:
                                newStr += lexeme[i + 1];
                                break;
                        }
                        i++;
                    }
                }
                this.lexeme = newStr;
            } else {
                this.lexeme = lexeme;
            }
        }
        
        toString() {
            return this.TokType + " " + this.lexeme;
        }
    }

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
                    break;

                case "get":
                    this.object = a;
                    this.name = b;
                    break;

                case "set":
                    this.object = a;
                    this.name = b;
                    this.value = c;
                    break;

                case "variable":
                    this.type = a;
                    this.name = b;
                    break;

                case "this":
                    this.keyword = a;
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

                case "return":
                    this.keyword = a;
                    this.value = b;
                    break;

                case "break":
                    this.goto = a;
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

    let JITLang = {};
    
    JITLang.tokenize = function(code, reportError=console.error) {
        /*
            tokenize converts a string of code into recognizable individual operators and literals.
        */

        const keywords = {
            "var": VAR, 
            "let": LET, 
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

                case 'f':
                    if (peek() === "n" && peekAhead() === " ") {
                        current += 2;
                        addToken(FN, getLex());
                    } else {
                        identifier();
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
    };
    JITLang.createAST = function(tokens, reportError=console.error) {
        /*
            createAST converts an array of tokens into an abstract syntax tree
        */

        // reorder arrow function tokens to make processing easier
        for (let i = 0; i < tokens.length; i++) {
            let tok = tokens[i];                
            if (tok.TokType === ARROW) {
                // find function beginning
                let ptr = i - 1;
                while (ptr >= 0 && tokens[ptr].TokType !== LEFT_PAREN) {
                    ptr--;
                }

                // shift tokens
                for (let j = i; j >= ptr; j--) {
                    tokens[j] = tokens[j - 1];
                }

                tokens[ptr] = tok;
            }
        }

        // convert import statements to function calls
        for (let i = 0; i < tokens.length; i++) {
            let tok = tokens[i];                
            if (tok.TokType === IMPORT) {
                // find from
                let ptr = i + 1;
                while (ptr < tokens.length && tokens[ptr].TokType !== FROM) {
                    ptr++;
                }

                let importBody = tokens.slice(i + 1, ptr);

                tokens[i].TokType = LET;
                tokens[ptr].TokType = EQUAL;

                let strTok = tokens[ptr + 1];
                if (strTok.TokType !== STRING) {
                    throwError("CompilerError", "import statement from non-string");
                }

                let lineNum = strTok.line;
                tokens[ptr + 1] = new Tok(IDENTIFIER, "dimport", lineNum);
                tokens.splice(ptr + 2, 0, new Tok(LEFT_PAREN, "(", lineNum), strTok, new Tok(RIGHT_PAREN, ")", lineNum));
            }
        }

        let current = 0, quit = false;
        let previousVarMods = [];

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
                    case FN:
                    case VAR:
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

        function primary(compilerScopes) {
            // console.log("PRIM", tokens[current])
            if (!isAtEnd()) {
                let currTokType = tokens[current].TokType;
                if ([FALSE, TRUE, NULL, VOID, NUMBER, STRING, VOID].includes(currTokType)) {
                    current++;
                    return new Expr("literal", peekPrev());
                } else if (currTokType === LEFT_PAREN) {
                    current++;
                    let expr = expression([...compilerScopes]);
                    consume(RIGHT_PAREN, "Expect ')' after expression.");
                    return new Expr("grouping", expr);
                } else if (currTokType === IDENTIFIER) {
                    current++;
                    let varTok = peekPrev();
                    return new Expr("variable", varTok.TokType, varTok.lexeme);
                } else if (currTokType === THIS) {
                    current++;
                    // console.log(compilerScopes)
                    if (!compilerScopes.includes("method") && !compilerScopes.includes("constructor")) {
                        throwError("Illegal this keyword - this isn't allowed outside of methods");
                    }
                    return new Expr("this", tokens[current - 1]);
                } else if (currTokType === NEW) {
                    current++;
                    let expr = primary(compilerScopes);
                    consume(LEFT_PAREN, "Expected opening parenthesis after new object instance");
                    return finishCall([...compilerScopes], expr);
                } else if (currTokType === ARROW) {
                    current++;
                    return functionDefinition([...compilerScopes], "expression");
                }
            }

            throwError("CompilerError", JSON.stringify(peekPrev(), null, "  ") + "\nExpected expression.");
        }

        function finishCall(compilerScopes, callee) {
            let args = [];
            if (!check(RIGHT_PAREN)) {
                do {
                    args.push(expression([...compilerScopes]));
                } while (match(COMMA));
            }

            let paren = consume(RIGHT_PAREN, "Expect ')' after arguments.");

            if (args.length > 255) {
                throwError("CompilerError", peek() + "\nFunction can't take more than 255 arguments");
            }

            let temp = new Expr("call", callee, paren, args);
            // console.log("FFFFFFFF", JSON.stringify(temp, "", "    "), callee, paren, args)
            return temp;
        }

        function call(compilerScopes) {
            let expr = primary(compilerScopes);

            while (true) { 
                if (match(LEFT_PAREN)) {
                    expr = finishCall([...compilerScopes], expr);
                } else if (match(DOT)) {
                    // console.log("EEEEEEEEEEEEEEEEEE", expr)
                    let name = consume(IDENTIFIER, "Expect property name after '.'");
                    expr = new Expr("get", expr, name);
                    // console.log("DOTTT", JSON.stringify(expr))
                } else {
                    break;
                }
            }

            return expr;
        }

        // sorted from least precedence to greatest
        const OPERATOR_PRECEDENCE = [
            [OR],
            [AND],
            [BANG_EQUAL, EQUAL_EQUAL],
            [GREATER, GREATER_EQUAL, LESS, LESS_EQUAL],
            [MINUS, PLUS],
            [SLASH, ASTERISK, MODULUS],
            [EXPONENT],
            [BANG, MINUS, CAST]
        ];

        function term(compilerScopes, priority) {
            const operators = OPERATOR_PRECEDENCE[priority];

            if (priority === OPERATOR_PRECEDENCE.length - 1) {
                if (match(...operators)) {
                    let operator = peekPrev();
                    let right = term([...compilerScopes], priority);
                    return new Expr("unary", operator, right);
                }
                return call([...compilerScopes]);
            }

            let expr = term([...compilerScopes], priority + 1);
            while (match(...operators)) {
                let operator = peekPrev();
                let right = term([...compilerScopes], priority + 1);
                
                if (priority <= 1) {
                    expr = new Expr("logical", expr, operator, right);
                } else {
                    expr = new Expr("binary", expr, operator, right);
                }
            }
            return expr;
        }

        function assignment(compilerScopes) {
            // console.log("ASSIGNBEFORE", tokens.slice(current, current + 10))

            let expr = term([...compilerScopes], 0);

            // console.log("ASSIGN", expr, tokens.slice(current, current + 10))
            
            if (match(EQUAL)) {
                let equal = peekPrev();
                let value = assignment([...compilerScopes]);

                if (expr instanceof Expr) {
                    if (expr.ExprType === "variable") {
                        return new Expr("assign", expr.name, value);
                    } else if (expr.ExprType === "get") {
                        let get = expr;
                        return new Expr("set", get.object, get.name, value);
                    }
                }

                throwError(equal, "Invalid assignment target."); 
            } else if (expr.ExprType === "get") {
                return new Expr("get", expr.object, expr.name);
            } else if (match(PLUS_PLUS)) {
                return new Expr(
                    "assign", 
                    expr.name, 
                    new Expr(
                        "binary", 
                        expr, 
                        new Tok(PLUS, "+", -1), 
                        new Expr(
                            "literal",
                            new Tok(NUMBER, "1", -1)
                        )
                    )
                );
            } else if (match(MINUS_MINUS)) {
                return new Expr(
                    "assign", 
                    expr.name, 
                    new Expr(
                        "binary", 
                        expr, 
                        new Tok(MINUS, "-", -1), 
                        new Expr(
                            "literal",
                            new Tok(NUMBER, "1", -1)
                        )
                    )
                );
            } else if (match(PLUS_EQUAL) || match(MINUS_EQUAL) || match(ASTERISK_EQUAL) || match(SLASH_EQUAL) || match(MODULUS_EQUAL) || match(EXPONENT_EQUAL)) {
                let idx = [PLUS_EQUAL, MINUS_EQUAL, ASTERISK_EQUAL, SLASH_EQUAL, MODULUS_EQUAL, EXPONENT_EQUAL].indexOf(peekPrev().TokType);
                let mappedOperator = [PLUS, MINUS, ASTERISK, SLASH, MODULUS, EXPONENT][idx];
                let mappedSymbol = ["+", "-", "*", "/", "%", "**"][idx];
                return new Expr(
                    "assign", 
                    expr.name, 
                    new Expr(
                        "binary", 
                        expr, 
                        new Tok(mappedOperator, mappedSymbol, -1), 
                        assignment([...compilerScopes])
                    )
                );
            }

            return expr;
        }

        function expression(compilerScopes) {
            // console.log("EXPRESSION", tokens.slice(current, current + 10))
            return assignment([...compilerScopes]);
        }

        function ifStatement(compilerScopes) {
            consume(LEFT_PAREN, "Expect '(' after 'if'.");
            let condition = expression([...compilerScopes]);
            consume(RIGHT_PAREN, "Expect ')' after if condition.");

            let thenBranch = statement([...compilerScopes]);
            let elseBranch = null;
            if (match(ELSE)) {
                elseBranch = statement([...compilerScopes]);
            }

            return new Stmt("if", condition, thenBranch, elseBranch);
        }

        function expressionStatement(compilerScopes) {
            let expr = expression([...compilerScopes]);
            if(check(SEMICOLON)) consume(SEMICOLON, "Expect ';' after expression.");
            
            return new Stmt("expression", expr);
        }

        function block(compilerScopes) {
            let statements = [];
            while (!check(RIGHT_BRACE) && !isAtEnd()) {
                let res = declaration([...compilerScopes]);
                if (Array.isArray(res)) {
                    for (let i = 0; i < res.length; i++) {
                        statements.push(res[i]);
                    }
                } else {
                    statements.push(res);
                }
            }
            consume(RIGHT_BRACE, "Expect '}' after block.");
            return statements;
        }

        function whileStatement(compilerScopes) {
            consume(LEFT_PAREN, "Expect '(' after 'while'.");
            let condition = expression([...compilerScopes]);
            consume(RIGHT_PAREN, "Expect ')' after condition.");
            let body = statement([...compilerScopes, "loop"]);
            return new Stmt("while", condition, body);
        }

        function forStatement(compilerScopes) {
            consume(LEFT_PAREN, "Expect '(' after 'for'.");

            let initializer;
            if (match(SEMICOLON)) {
                initializer = null;
            } else if (match(VAR)) {
                initializer = variableDeclaration([...compilerScopes, "let"]);
            } else {
                initializer = expressionStatement([...compilerScopes]);
            }

            let condition = null;
            if (!check(SEMICOLON)) {
                condition = expression([...compilerScopes]);
            }
            consume(SEMICOLON, "Expect ';' after loop condition.");

            let increment = null;
            if (!check(RIGHT_PAREN)) {
                increment = expression([...compilerScopes]);
            }
            consume(RIGHT_PAREN, "Expect ')' after for clauses.");

            let body = statement([...compilerScopes, "loop"]);

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

        function returnStatement(compilerScopes) {
            if (!compilerScopes.includes("function") && !compilerScopes.includes("method")) {
                throwError("SyntaxError", "Illegal return statement - return statments are not allowed in constructors or outside of functions");
                quit = true;
            }
            
            let keyword = peekPrev();
            let value = new Expr("literal", new Tok(VOID, "void", keyword.line));
            if (!check(SEMICOLON) && !check(RIGHT_BRACE)) {
                value = expression([...compilerScopes]);
            }
            if (check(SEMICOLON)) consume(SEMICOLON);
            return new Stmt("return", keyword, value);
        }

        function breakStatement(compilerScopes) {
            let keyword = peekPrev();
            let goto = null;
            if (!check(SEMICOLON) && !check(RIGHT_BRACE)) {
                goto = primary([...compilerScopes]);
            }
            if (check(SEMICOLON)) consume(SEMICOLON);
            return new Stmt("break", goto);
        }

        function statement(compilerScopes) {
            if (match(FOR)) return forStatement([...compilerScopes]);
            if (match(IF)) return ifStatement([...compilerScopes]);
            if (match(RETURN)) return returnStatement([...compilerScopes]);
            if (match(BREAK)) {
                // console.log("BREAK", [...compilerScopes])
                if (!compilerScopes || !compilerScopes.includes("loop")) {
                    throwError("SyntaxError", "Illegal break statement");
                    quit = true;
                }
                return breakStatement([...compilerScopes]);
            }
            if (match(WHILE)) return whileStatement([...compilerScopes]);
            if (match(LEFT_BRACE)) return new Stmt("block", block([...compilerScopes]));
            return expressionStatement([...compilerScopes]);
        }

        function variableDeclaration(compilerScopes, modifiers) {
            // console.log("variableDeclaration", tokens.slice(current))
            let name = consume(IDENTIFIER, "Expect variable name.");
            let initializer = null;
            if (match(EQUAL)) {
                initializer = expression([...compilerScopes]);
            } else {
                initializer = new Expr("literal", new Tok(VOID, "void", -1));
            }
            if (check(SEMICOLON)) {
                consume(SEMICOLON);
            }
            return new Stmt("variable", modifiers, name, initializer);
        }

        function functionDefinition(compilerScopes, kind) {
            // console.log("FUNC", tokens.slice(current, current + 10))
            let name = null, parameters = [];
            if (kind === "method" && check(NEW)) {
                name = consume(NEW);
            } else if (check(IDENTIFIER)) {
                name = consume(IDENTIFIER);
            }
            if (kind === "method" && name === null) {
                throwError("SyntaxError", "Class methods must have an identifier");
            } else if (kind === "expression" && name !== null) {
                throwError("SyntaxError", "Arrow functions can't have an identifier");
            }
            consume(LEFT_PAREN, "Expect '(' after function " + kind + " name.");
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
            consume(RIGHT_PAREN, "Expect ')' after function " + kind + " parameters.");
            let returnType = "any";
            if (isPrimitive(peek()) || check(NULL) || check(VOID) || check(IDENTIFIER)) {
                returnType = peek().lexeme;
                current++;
            }
            consume(LEFT_BRACE, "Expect '{' before function " + kind + " body.");

            // check for passing scoping
            compilerScopes = [...compilerScopes];
            if (kind[0] === "m") {
                if (name.lexeme === "new") {
                    compilerScopes.push("constructor");
                } else {
                    compilerScopes.push("method");
                }
            } else {
                scopeTag = compilerScopes.push("function");
            }
            let body = block(compilerScopes);
            if (check(SEMICOLON)) consume(SEMICOLON);
            return kind === "expression" ? new Expr("function", name, parameters, body, returnType) : new Stmt("function", name, parameters, body, returnType);
        }

        function classDeclaration(compilerScopes) {
            let name = consume(IDENTIFIER, "Expect class name.");
            consume(LEFT_BRACE, "Expect '{' before class body.");
            
            let methods = [];
            while (!check(RIGHT_BRACE) && !isAtEnd()) {
                methods.push(functionDefinition([...compilerScopes, "class"], "method"));
            }

            for (let i = 0; i < methods.length; i++) {
                if (methods[i].type !== null && methods[i].name.lexeme === name) {
                    throwError("Syntax Error", "Constructors cannot have a return type");
                }
            }

            consume(RIGHT_BRACE, "Expect '}' after class body.");

            return new Stmt("class", name, methods);
        }

        function declaration(compilerScopes) {
            try {
                // class declaration
                if (match(CLASS)) return classDeclaration([...compilerScopes]);

                // function declaration
                if (match(FN)) return functionDefinition([...compilerScopes], "declaration");

                // function expression
                if (match(ARROW)) return functionDefinition([...compilerScopes], "expression");

                // variable declaration
                if (check(VAR) || check(LET) || (check(IDENTIFIER) && checkAhead(IDENTIFIER))) {
                    let j = 1;
                    let modifiers = [peek().lexeme];
                    let varType = null;
                    let hasType = false;
                    let identifierCount = 0;
                    
                    while (current + identifierCount + 1 < tokens.length && checkAhead(IDENTIFIER, identifierCount + 1)) {
                        identifierCount++; // look ahead for future declarations
                    }
                    if (identifierCount > 1) {
                        hasType = true; // check if the declaration has a variable type
                    }
                    if ([VAR, LET, PRIVATE].includes(tokens[current + identifierCount + 1].TokType)) {
                        hasType = false; // if the next token is a variable declarator then current token is the variable name and is untyped
                    }
                    if (current + identifierCount + 1 < tokens.length && hasType) {
                        identifierCount--; // subtract the next expression from variable identifiers
                    }

                    // find variable modifiers
                    while (identifierCount % 2 === 0 && varType === null && current + j < tokens.length && checkAhead(IDENTIFIER, j) && !checkAhead(EQUAL, j + 1)) {
                        let modifier = peekAhead(j);
                        modifiers.push(modifier.lexeme);
                        if (modifier.TokType === IDENTIFIER) {
                            varType = modifier.lexeme;
                        }
                        j++;
                    }
                    // console.log("PARSE", tokens.slice(current), modifiers)
                    if (modifiers.length > 0/* && checkAhead(EQUAL, j + 1)*/) {
                        
                        current += j;
                        let declarations = [];
                        do {
                            declarations.push(variableDeclaration([...compilerScopes], modifiers));
                        } while (match(COMMA));
                        return declarations;
                    }
                }
                
                // statement
                return statement([...compilerScopes]);
            } catch (e) {
                // console.log(e)
                synchronize();
                return null;
            }
        }

        // parse
        let statements = [];
        while (current < tokens.length && !quit) {
            let res = declaration([]);
            if (Array.isArray(res)) {
                for (let i = 0; i < res.length; i++) {
                    statements.push(res[i]);
                }
            } else {
                statements.push(res);
            }
        }
        return quit ? [] : statements;
    };

    if (typeof window === "undefined") {
        // node support
        module.exports = JITLang;
    } else {
        // browser support
        window.jitlc = JITLang;
    }
})();
