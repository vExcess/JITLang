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
    FN =ID(), LET =ID(), CONST =ID(), IF =ID(), ELSE =ID(), DO =ID(), 
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

        FN, LET, CONST, IF, ELSE, DO, 
        WHILE, FOR, STRUCT, CLASS, PRIVATE, 
        STATIC, SUPER, EXTENDS, INHERIT, 
        ENUM, TRY, CATCH, THROW, RETURN, 
        SWITCH, CASE, DEFAULT, BREAK, CONTINUE, 
        NEW, THIS, TRUE, FALSE, INFINITY, 
        IMPORT, EXPORT, FROM, AS, ASYNC, 
        AWAIT, TYPEOF,

        VOID, NULL, STRING
    };

    // VM Classes
    class Return {
        constructor(type, nat) {
            this.type = type;
            this.nat = nat;
        }
    }

    class Break {
        constructor(goto) {
            this.goto = goto;
        }
    }

    function determinePrimitiveDataType(lexeme) {
        if (lexeme === "void" || lexeme === "null") return lexeme;
        if (Number.isNaN(Number(lexeme))) return "string";
        if (lexeme.includes(".")) return "double";
        return "int";
    }

    function mkNatObj(type, val) {
        return {
            type: type,
            nat: val
        }
    }

    class Environment {
        values = new Map();
        types = new Map();
        enclosing;
        interpreter;

        constructor(enclosing, interpreter){
            this.enclosing = enclosing ?? null;
            this.interpreter = interpreter;
        }

        define(name, type, value) {
            this.types.set(name, type);
            this.values.set(name, value);
        }

        get(name) {
            console.log("ENV READING", name)
            if (this.values.has(name)) {
                return mkNatObj(this.types.get(name), this.values.get(name));
            }

            if (this.enclosing !== null) {
                return this.enclosing.get(name);
            }

            this.interpreter.handleError("ReferenceError", name + " is " + name.lexeme);
        }

        has(name) {
            if (this.values.has(name)) {
                return true;
            } else {
                return false;
            }
        }

        assign(name, type, value) {
            console.log("ENV ASSIGN", name, type, value)
            if (this.values.has(name)) {
                this.types.set(name, type);
                this.values.set(name, value);
                return;
            }

            if (this.enclosing !== null) {
                this.enclosing.assign(name, type, value);
                return;
            }

            this.interpreter.handleError("ReferenceError", name + " is " + name.lexeme);
        }
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

        call(args) {
            let environment = new Environment(this.closure, this.interpreter);

            let params = this.declaration.params;

            if (args.length > params.length) {
                this.interpreter.handleError("ReferenceError", this.declaration.name.lexeme + " expects " + params.length + " arguments; Recieved" + args.length);
            }

            for (let i = 0; i < params.length; i++) {
                let expectedParamType = params[i].type.lexeme;
                let val = (args[i].type === expectedParamType) ? args[i] : this.interpreter.cast(args[i], expectedParamType);
                environment.define(params[i].lexeme, val.type, val.nat);
            }

            console.log("CALLING FN", params)
            
            try {
                this.interpreter.executeBlock(this.declaration.body, environment);
            } catch (returnValue) {
                if (returnValue instanceof Return) {
                    if (this.declaration.name.lexeme === "new") {
                        
                    }

                    let expectedType = this.declaration.returnType;
                    if (expectedType !== "any" && returnValue.type !== expectedType) {
                        return this.interpreter.cast(returnValue, expectedType);
                    } else {
                        return mkNatObj(returnValue.type, returnValue.nat);
                    }
                } else {
                    throw returnValue;
                }
            }
            return mkNatObj("void", undefined);
        }

        bind(instance) {
            let environment = new Environment(this.closure);
            environment.define("this", instance.type, instance);
            return new JITLangFunction(this.declaration, environment, this.interpreter);
        }

        toString() {
            let paramsStr = "";
            let fnDecl = this.declaration;
            for (let i = 0; i < fnDecl.params.length; i++) {
                let param = fnDecl.params[i];
                if (param.type) {
                    paramsStr += param.type.lexeme + " ";
                }
                console.log(param)
                paramsStr += param.lexeme;
                if (i < fnDecl.params.length - 1) {
                    paramsStr += ", ";
                }
            }
            if (fnDecl.name === null) {
                return `(${paramsStr}) => ${fnDecl.returnType === "any" ? "" : fnDecl.returnType} {...}`;
            } else {
                return `fn ${fnDecl.name.lexeme}(${paramsStr}) ${fnDecl.returnType === "any" ? "" : fnDecl.returnType + " "}{...}`;
            }
        }
    }

    class JITLangClass {
        name;
        methods;
        interpreter;

        constructor(name, methods, interpreter) {
            this.name = name;
            this.methods = methods;
            this.interpreter = interpreter;
        }

        call(args) {
            return new JITLangInstance(this, args);
        }

        findMethod(name) {
            console.log("FNDING METH", name, this.methods)
            if (name !== "new" && this.methods.has(name)) {
                return mkNatObj("Function", this.methods.get(name));
            }
            return null;
        }

        arity() {
            let constructor = this.findMethod("new");
            return constructor === null ? 0 : constructor.nat.arity();
        }

        toString() {
            return "class " + this.name;
        }
    }

    class JITLangInstance {
        jitlclass;
        fields = new Map();

        constructor(jitlclass, args) {
            this.jitlclass = jitlclass;
            if (jitlclass.methods.has("new")) {
                jitlclass.methods.get("new").bind(this).call(args);
            }
            console.log("CREATED NEW", constructor)
        }

        get(name) {
            console.log("GETTTTTING", this, name)
            if (this.fields.has(name.lexeme)) {
                return this.fields.get(name.lexeme);
            }

            let method = this.jitlclass.findMethod(name.lexeme);
            if (method !== null) return mkNatObj("Function", method.nat.bind(this));

            throw name + " Can't read undefined property " + name.lexeme;
        }

        set(name, value) {
            this.fields.set(name.lexeme, value);
        }

        toString() {
            return this.jitlclass.name + " instance";
        }
    }

    class Interpreter {
        globals;
        environment;
        processDied = false;

        constructor(handleOutput=console.log, handleError=console.error) {
            const that = this;
            this.globals = new Environment(undefined, this);
            this.environment = this.globals;

            this.globals.define("sqrt", "Function", {
                arity: () => 1,
                call: (args) => {
                    return mkNatObj("double", Math.sqrt(args[0]));
                },
                toString: () => { return "() {...}"; }
            });

            this.globals.define("println", "Function", {
                arity: () => 1,
                call: (args) => {
                    handleOutput(this.stringify(args[0]));
                    return mkNatObj("void", undefined);
                },
                toString: () => { return "() {...}"; }
            });

            this.globals.define("millis", "Function", {
                arity: () => 0,
                call: (args) => {
                    return mkNatObj("int", Date.now());
                },
                toString: () => { return "() {...}"; }
            });

            this.handleError = (...args) => {
                this.processDied = true;
                handleError(...args);
            };
        }

        isNumberType(typeStr) {
            if (this.processDied) return; // stop execution

            return ["bool", "byte", "short", "char", "int", "uint", "long", "ulong", "float", "double"].includes(typeStr);
        }

        determineImplicitCast(type1, type2) {
            if (this.processDied) return; // stop execution

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

        stringify(obj) {
            // null and void
            if (obj.type === "null" || obj.type === "void") {
                return obj.type;
            } 
            // numbers
            else if (this.isNumberType(obj.type)) {
                let txt = obj.nat.toString();
                return txt.endsWith(".0") ? txt.slice(0, txt.length - 2) : txt;
            }
            // strings
            else if (obj.type === "String") {
                return obj.nat;
            }
            // classes and other printables
            else if (obj.nat.toString) {
                return obj.nat.toString();
            }
            // unprintable non-primitives
            else {
                return obj.type + " instance";
            }
        }

        cast(obj, typeStr) {
            if (typeStr === "bool") {
                return (obj === 0 || obj === false) ? mkNatObj(typeStr, false) : mkNatObj(typeStr, true);
            }
            if (["bool", "byte", "short", "char", "int", "uint", "long", "ulong"].includes(typeStr)) {
                return mkNatObj(typeStr, obj.nat | 0);
            }
            if (typeStr === "String") {
                return mkNatObj(typeStr, this.stringify(obj));
            }
            throw "VM Error - casting error";
        }

        checkNumberOperands(operator, left, right) {
            if (this.processDied) return; // stop execution

            if (this.isNumberType(left.type) && this.isNumberType(right.type)) return;
            this.handleError("TypeError", JSON.stringify(operator) + "\nOperands must be a number");
        }
        
        isTruthy(natObj) {
            if (this.processDied) return; // stop execution

            if (natObj.type === "bool") return natObj.nat;
            if (natObj.nat === null || natObj.nat === 0 || natObj.nat === undefined) return false;
            return true;
        }

        isEqual(a, b) {
            if (this.processDied) return; // stop execution

            if (a.type !== b.type) return false;
            return a.nat === b.nat;
        }

        visitLiteralExpr(expr) {
            if (this.processDied) return; // stop execution

            console.log("LIT", expr)

            if (expr.ExprType === "function") {
                return mkNatObj("Function", new JITLangFunction(expr, this.environment, this));
            }

            switch (expr.value.TokType) {
                case STRING:
                    return mkNatObj("String", expr.value.lexeme);
                case NUMBER:
                    if (expr.value.lexeme.includes(".")) {
                        return mkNatObj("double", parseFloat(expr.value.lexeme, 10));
                    } else {
                        return mkNatObj("int", parseInt(expr.value.lexeme, 10));
                    }
                case TRUE:
                    return mkNatObj("bool", true);
                case FALSE:
                    return mkNatObj("bool", false);
            }

            // unreachable
            throw "VM Error - unknown literal";
            return null;
        }
        
        visitGroupingExpr(expr) {
            if (this.processDied) return; // stop execution
            
            return this.evaluate(expr.expression);
        }

        visitUnaryExpr(expr) {
            if (this.processDied) return; // stop execution

            let right = this.evaluate(expr.right);

            switch (expr.operator.TokType) {
                case BANG:
                    return mkNatObj("bool", !this.isTruthy(right));
                case MINUS:
                    return mkNatObj(right.type, -Number(right.nat));
                case CAST:
                    let newType = expr.operator.lexeme;
                    return this.cast(this.evaluate(expr.right), newType);
            }

            // unreachable
            throw "VM Error - unknown unary expression";
            return null;
        }

        visitBinaryExpr(expr) {
            if (this.processDied) return; // stop execution

            let left = this.evaluate(expr.left);
            let right = this.evaluate(expr.right);

            // console.log("BINOP", expr.operator, left, right)
            switch (expr.operator.TokType) {
                // math and concatenating operators
                case PLUS:
                    if (this.isNumberType(left.type) && this.isNumberType(right.type)) {
                        return mkNatObj(this.determineImplicitCast(left.type, right.type), left.nat + right.nat);
                    } else if (left.type === "String" && right.type === "String") {
                        return mkNatObj("String", left.nat.concat(right.nat));
                    } else if (this.isNumberType(left.type) && right.type === "String") {
                        return mkNatObj("String", left.nat.toString().concat(right.nat));
                    } else if (left.type === "String" && this.isNumberType(right.type)) {
                        return mkNatObj("String", left.nat.concat(right.nat.toString()));
                    }

                    this.handleError("TypeError", JSON.stringify(expr.operator) + "\nOperands to '+' operator must be numbers or strings");

                case MINUS:
                    this.checkNumberOperands(expr.operator, left, right);
                    return mkNatObj(this.determineImplicitCast(left.type, right.type), left.nat - right.nat);

                case ASTERISK:
                    this.checkNumberOperands(expr.operator, left, right);
                    return mkNatObj(this.determineImplicitCast(left.type, right.type), left.nat * right.nat);

                case EXPONENT:
                    this.checkNumberOperands(expr.operator, left, right);
                    return mkNatObj(this.determineImplicitCast(left.type, right.type), left.nat ** right.nat);

                case SLASH:
                    this.checkNumberOperands(expr.operator, left, right);
                    if (right.nat === 0) {
                        return mkNatObj("void", undefined);
                    }
                    return mkNatObj(this.determineImplicitCast(left.type, right.type), left.nat / right.nat);

                case CARET:
                    this.checkNumberOperands(expr.operator, left, right);
                    return mkNatObj(this.determineImplicitCast(left.type, right.type), left.nat ^ right.nat);

                case MODULUS:
                    this.checkNumberOperands(expr.operator, left, right);
                    return mkNatObj(this.determineImplicitCast(left.type, right.type), left.nat % right.nat);

                // bitwise operators
                case BIT_OR:
                    this.checkNumberOperands(expr.operator, left, right);
                    return mkNatObj(this.determineImplicitCast(left.type, right.type), left.nat | right.nat);

                case BIT_AND:
                    this.checkNumberOperands(expr.operator, left, right);
                    return mkNatObj(this.determineImplicitCast(left.type, right.type), left.nat & right.nat);

                case BIT_XOR:
                    this.checkNumberOperands(expr.operator, left, right);
                    return mkNatObj(this.determineImplicitCast(left.type, right.type), left.nat ^ right.nat);

                case BITSHIFT_LEFT:
                    this.checkNumberOperands(expr.operator, left, right);
                    return mkNatObj(this.determineImplicitCast(left.type, right.type), left.nat << right.nat);

                case BITSHIFT_RIGHT:
                    this.checkNumberOperands(expr.operator, left, right);
                    return mkNatObj(this.determineImplicitCast(left.type, right.type), left.nat >> right.nat);

                case UNSIGNED_BITSHIFT_RIGHT:
                    this.checkNumberOperands(expr.operator, left, right);
                    return mkNatObj(this.determineImplicitCast(left.type, right.type), left.nat >>> right.nat);

                // logical operators
                case EQUAL_EQUAL: 
                    return mkNatObj("bool", this.isEqual(left, right));

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
            }

            // unreachable
            throw "VM Error";
            return null;
        }

        evaluate(expr) {
            if (this.processDied) return; // stop execution

            console.log("EVAL", expr)
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
                case "get":
                    return this.visitGetExpr(expr);
                case "variable":
                    console.log("READING", this.environment)
                    return this.environment.get(expr.name);
                case "this":
                    console.log("READING this", this.environment)
                    return this.environment.get("this");
                default:
                    return this.visitLiteralExpr(expr);
            }            
        }

        visitVarStmt(stmt) {
            if (this.processDied) return; // stop execution

            let value = null;
            if (stmt.initializer !== null) {
                value = this.evaluate(stmt.initializer);
                // console.log("VIS VAR", stmt.initializer)
                this.environment.define(stmt.name.lexeme, value.type, value.nat);
            } else {
                this.environment.define(stmt.name.lexeme, "void", undefined);
            }
            
            return mkNatObj("void", undefined);
        }

        visitAssignExpr(expr) {
            if (this.processDied) return; // stop execution

            if (expr.ExprType === "call") {
                console.log("VIS ASSIGN", expr)
                return this.visitCallExpr(expr);
            } else if (expr.ExprType === "get") {
                console.log("VIS GET", expr)
                return this.visitGetExpr(expr);
            } else if (expr.ExprType === "set") {
                console.log("VIS SET", expr)
                return this.visitSetExpr(expr);
            } else {
                console.log("DDDDDDDD", expr)
                let obj = this.evaluate(expr.value);
                this.environment.assign(expr.name, obj.type, obj.nat);
                return obj;
            }
        }

        visitIfStmt(stmt) {
            if (this.processDied) return; // stop execution

            if (this.isTruthy(this.evaluate(stmt.condition))) {
                this.execute(stmt.thenBranch);
            } else if (stmt.elseBranch !== null) {
                this.execute(stmt.elseBranch);
            }
            return null;
        }

        visitLogicalExpr(expr) {
            if (this.processDied) return; // stop execution

            let left = this.evaluate(expr.left);
            
            if (expr.operator.TokType === OR) {
                if (this.isTruthy(left)) return left;
            } else {
                if (!this.isTruthy(left)) return left;
            }

            return this.evaluate(expr.right);
        }

        visitWhileStmt(stmt) {
            if (this.processDied) return; // stop execution

            while (this.isTruthy(this.evaluate(stmt.condition))) {
                try {
                    this.execute(stmt.body);
                } catch (returnValue) {
                    if (returnValue instanceof Break) {
                        break;
                    }
                }
            }
            return null;
        }

        executeBlock(statements, environment) {
            if (this.processDied) return; // stop execution

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
            console.log("CALLIN", fxn, expr.args)
            if (fxn.type === "Function") {
                while (args.length < fxn.nat.arity()) {
                    args.push(undefined);
                }
    
                if (!fxn.nat.call) {
                    this.handleError("SyntaxError", JSON.stringify(fxn.nat) + "\nCan only call functions and classes");
                }
    
                // console.log("RETURNED", fxn.nat.call(args))
                return fxn.nat.call(args);
            } else if (fxn.type === "Class") {
                while (args.length < fxn.nat.arity()) {
                    args.push(undefined);
                }
                
                if (!fxn.nat.call) {
                    this.handleError("SyntaxError", JSON.stringify(fxn.nat) + "\nCan only call functions and classes");
                }
    
                let newInst = fxn.nat.call(args);
                return mkNatObj(newInst.jitlclass.name, newInst);
            } else {
                this.handleError("TypeError", expr.callee.name + " is not a function");
            }
        }

        visitFunctionStmt(stmt) {
            let fxn = new JITLangFunction(stmt, this.environment, this);
            this.environment.define(stmt.name.lexeme, "Function", fxn);
            return null;
        }

        visitReturnStmt(stmt) {
            let value = null;
            if (stmt.value !== null) value = this.evaluate(stmt.value);
            if (typeof value === "object") {
                throw new Return(value.type, value.nat);
            } else {
                throw new Return("void", undefined);
            }
        }

        visitBreakStmt(stmt) {
            throw new Break(stmt.goto);
        }

        visitClassStmt(stmt) {
            this.environment.define(stmt.name.lexeme, null);

            

            let methods = new Map();
            for (let method of stmt.methods) {
                let fxn = new JITLangFunction(method, this.environment, this);
                methods.set(method.name.lexeme, fxn);
            }

            let jitlClass = new JITLangClass(stmt.name.lexeme, methods, this);
            this.environment.assign(stmt.name.lexeme, "Class", jitlClass);

            return null;
        }

        visitGetExpr(expr) {
            let object = this.evaluate(expr.object);
            console.log("VIS GETTING", object)
            if (object.nat instanceof JITLangInstance) {
                return object.nat.get(expr.name);
            }

            throw expr.name + " Only instances have properties";
        }

        visitSetExpr(expr) {
            let object = this.evaluate(expr.object);

            if (!(object.nat instanceof JITLangInstance)) {
                throw expr.name + " Only instances have fields";
            }

            let value = this.evaluate(expr.value);
            object.nat.set(expr.name, value);
            return value;
        }

        execute(stmt) {
            switch (stmt.StmtType) {
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
                case "class":
                    return this.visitClassStmt(stmt);
                case "return":
                    return this.visitReturnStmt(stmt);
                case "break":
                    return this.visitBreakStmt(stmt);
            }
        }

        eval(statements) {
            // execute the file
            let i = 0;
            while (i < statements.length && !this.processDied) {
                this.execute(statements[i++]);
            }

            // call the optional main if it exists
            if (this.globals.has("main")) {
                let main = this.globals.get("main");
                if (main.type === "Function") {
                    main.nat.call([]);
                }
            }
        }
    }

    if (typeof JITLang === "undefined") {
        if (typeof window === "undefined") {
            // node support
            globalThis.JITLang = {};
        } else {
            // browser support
            window.JITLang = {};
        }
    }

    JITLang.createInterpreter = function(handleOutput, handleError) {
        return new Interpreter(handleOutput, handleError);
    };

    JITLang.run = function(code) {
        let tokens = JITLang.tokenize(code);
        let AST = JITLang.createAST(tokens);
        let interpreter = JITLang.createInterpreter();
        interpreter.eval(AST);
    };
})();
