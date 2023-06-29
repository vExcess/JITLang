# JITLang
JITLang stands for Just In Time Language (which is kinda like naming your pet fish "fishy", but whatever). JITLang is a general purpose Just In Time compiled Language that feels like a hybrid between JavaScript, Rust, Java, C++, and Swift. It's right on the threshold between being a programming language and a scripting language. It is designed to be JavaScript the way JavaScript should have been designed. It gets rid of the stupid features of JavaScript that nobody uses such as Object plus Array equaling Number, and Array plus Number equaling String (https://www.destroyallsoftware.com/talks/wat). JavaScript also has ambiguous syntax that JITLang does away with. It is superior to Java because "I love being forced to type out 'class Main { public static void main(String[] args) {} }' every time I want to start a program said no programmer ever" (https://www.youtube.com/watch?v=m4-HM_sCvtQ). OOP is great, but making literally everything its own class is going too far. JITLang's core philosophy is to cater to multiple programming styles by offering the best of both worlds. It offers static typing and dynamic typing, simplicity and speed, shadowing and no shadowing, garbage collection and no garbage collection, JIT compilation and AOT compilation, functional programming and OOP, classes with the flexibility of prototypes, semicolons and no semicolons, and much more. No matter what programming styles you are accustomed to JITLang has the syntax for you except for Python; if you're coming from a Python background you are going to need to unlearn all the garbage you've learned and start over.

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

### Garbage Collection
JITLang is garbage collected by default, but by using the `#disable-gc` compiler flag the garbage collection can be turned off for maximum execution speed which gives the programmer full responsibility of managing their own memory using the `new` and `free` keywords.

## Semicolons
Some think semicolons ought to be mandatory while others frown upon them. JavaScript says both are good. However the way JavaScript did it is absolutely awful. While JS makes semicolons technically optional; the use or lack thereof can drastically change the meaning of the code which very often leads to frustrating bugs. JITLang on the other hand makes semicolons completely optional, meaning they are only for asthetics. Unlike JS, the usage or lack of semicolons makes no change to the meaning of the code.

## Naming Conventions
- ordinary variables are in camelCase
- class/struct names are in PascalCase
- constants are in SCREAMING_SNAKE_CASE

## Special Words
### Keywords
let, const, if, else, do, while, for, struct, class, private, static, super, extends, inherit, enum, try, catch, throw, return, switch, case, default, break, continue, new, this, true, false, Infinity, import, export, from, as, async, await, typeof
### Built in data types
bool, byte, short, char, int, uint, long, ulong, float, double, void, null, BigInt  
Object, Array, Function, Struct, Class, String

## Primitive Data Types
Primitive data types are passed by value rather than by reference. JITLang has C-based data type names which I feel are easier to read and understand, but it also has aliases for Rust-based data type names which are mostly shorter and better describe the data type's representation in binary.  
**bool** A boolean value storing either `true` or `false`  
**byte** - An unsigned 8-bit integer  
**short** - A signed 16-bit integer  
**char** - An unsigned 16-bit integer that stores represents a Unicode character    
**int** - A signed 32-bit integer  
**uint** - An unsigned 32-bit integer  
**long** - A signed 64-bit integer  
**ulong** - An unsigned 64-bit integer  
**float** - A signed 32-bit floating point number  
**double** - A signed 64-bit floating point number  
**void** - A special primitive data type that is a placeholder for nothing.  
**null** - Similar to void, null is a special primitive data type that points to nothing. Object, Array, and String variables that are undefined point to null.  
**BigInt** - Capable of holding signed integers of arbitrarily large size  

## Non-primitive Data Types
Non-primitive data types are passed by reference rather than value  
**Object** - The root class of all other classes and objects  
**Array** - A special type of object where each key is an integer that can be read/write using the [] operator  
**Function** - Functions are objects so that they can be treated like first class functions and be passed around by reference  
**Struct** - is just an alias to Function  
**Class** - A blueprint for creating Objects  
**String** - Strings are a special type of char array that has extra methods

## Variables
Variables are created in the format
```
type variableName = value; // this is the general syntax
int idk = 1; // variable declared with C-based data type name
let idk = 3; // JITLang has automatic type detection so it's not necessary to give the variable an explicit type
```
Rules for naming identifiers
- identifiers can contain letters, digits, underscores, and dollar signs.
- identifiers cannot begin with a number
- identifiers are case-sensitive
- Reserved words cannot be used as identifiers.
If you use `let` rather than a specific type the compiler will automatically detect the variable's data type. If the variable is left uninitialized it will hold the value of `void` until assigned a value. Assigning a value to a variable whose's data types don't match causes JITLang to attempt to implicitly cast the value and throws a type error if it fails. Although you can't change a variable's data type, you can declare a new variable with the same identifer to shadow the old variable. Shadowing a variable will throw a compiler warning to alert the programmer about potential bugs. Even though it throws a warning the code will still compile and run perfectly fine. Using the `#allow-shadowing` compiler flag will disable this warning. If the variable is to be a constant you can use the `const` modifier ex: `const int a = 1;`. If the variable is being declared with modifiers (const, private, static, export) and the variable type is unspecified then you can leave out the `let` ex: `const a = 1;`. In addition modifiers don't necessarily need to be behind the data type. Both `const int a = 1;` and `int const a = 1;` are perfectly valid, but I think you're weird if you use the later.
Accessing a variable that hasn't been declared throws a reference error. All variables are block scoped
```
{
	let a = 1;
	let b = 2;
	a // 1
	b // 2
	{
		a // 1
		b // 2
		a = 3;
		let b = 4;
		a // 3
		b // 4
	}
	a // 3
	b // 2
}
a // throws reference error
b // throws reference error
```

## Casting
Having to memorize various different casting rules can be a big pain and manually needing to cast each parameter going into an operation is both tedious and makes for lengthy code. JITLang will attempt to implicitly cast any piece of data to the needed type for you, but will throw an error if casting fails.

The syntax for casting is:
```
<type> value
<int> 123.987 // becomes 123
```
JITLang's implicit casting rules are simple. All numbers can be cast to any other type of number (except BigInt at the moment). When operating on two numbers JITLang will promote the operand of a lesser type to the other operand's type in order to prevent data loss. For example if you multiply an int by a float it will automatically cast the int to a float before perfoming the operation.

### Number Casting Rules
1)  If one operand's type can store decimal values and the other operand's type cannot then the operand that cannot is promoted to the type of the one that can
2)  If no promotion occured in rule 1: if one operand is signed and the other isn't the unsigned one is cast to the type of the signed number.
3)  If no promotion occured in either rule 1 or rule 2: if one operand's type has less bits than the other, it is cast to the type that has more bits

### String Casting Rules
- If concatenating a char and a String, the char will automatically be cast to a String.
- If casting a String to a char, the result will be the first character in the String.
- When any number is being cast to a String the result will be the decimal text of the number (eg: `<String>(65)` -> `"65"`). The exception to this is the char number type. When chars are cast to a String they form a single character long String where the character is based on the ASCII value of the char. Essentially `<String>(myChar)` is equivelant to `String.fromCharCode(myChar)` (eg: `<String>(<char> 65)` -> `"A"`)
- Although numbers are implicitly cast to Strings, Strings are not implicitly cast to numbers and will throw a type error if you try
- when concatenating a String and a number, the number will be cast to a String regardless of the order that they were added to each other

### Literal Casting Rules
Any number literals are a double if it has decimal points, or is an int if there are no decimal points.
```
let num = 1; // num is an int
let num = 1.0; // num is a double
let num = 1.; // also a double; trailing decimals are allowed
```
If you try implicitly casting anything not following the rules above then a type error will be throw.

### Number Overflow
- When integers overflow they simply wrap back around so `(<byte> 15) << 4` would become `0001`.
- Floats and doubles lose precision the smaller or bigger they become. At a certain point doubles will collapse to either `-Infinity` or `Infinity`.
- BigInts can store up to 10n**(2n**28n) which is a 281,018,368 digit long number or nearly an entire GB of memory being taken up by a single number. If you exceed this an error will be thrown.

## Classes
Classes are created like so:
```
class Animal {
	int age = 0; // variable declarations
	private name; // private variables
	static const needsOxygen = true; // static makes a property/method belong to the class rather than an instance of the class
	new(String n) { // constructor
		name = n; // define object properties
		getName(); // call methods
		this.getName(); // properties/methods can also be accessed using the `this` keyword
	}
	getName() String { // methods
		return this.name;
	}
	free() {
		// destructor
	}
}
```
The constructor of a class is written using `new` as an identifier. The destructor of a class is written using `free` as an identifier. Using the `free` keyword like so `free someInstance` on an instance will call the instance's `free` method if it exists and then deallocate the object from memory. Instances of classes can be created by calling the class's constructor with or without the `new` keyword as in `Thing()` or `new Thing()`. The difference is that when created without `new` the instance will be removed from memory after the scope it was declared in ends. Any references to the object will be replaced with null. However when created using the `new` keyword, the instance will persist indefinitely even after the scope it was declared in ends. When the garbage collector deallocates an object its free method is not called. Calling a object's free method does not deallocate the object from memory. Calling `new myClass().new()` is the same as `myClass()` and calling `new (new myClass().new)()` is the same as `new myClass()` but if you do so then you are clearly demented. By default properties/methods are public, but can be made private using the "private" keyword.

Multiple inheritance is supported. If a class has two parent classes with the same property/method it will inherit from the last parent. When creating properties without a explicit type in a class the `let` is excluded. The constructors of the parent classes will be available to be called from the classes constructor. It is not necessary to call a parent's constructor. If a parent's constructor is not called then the child instance will still recieve the global constant properties and methods from the parent, however the parent's constructor will not be called. However despite the parent's constructor not being called, the variables and methods from the parent class will still exist on the child instance. Accessing a property that doesn't exist on on Object will throw a ReferenceError.

Properties of an Object are accessed using the dot operator `.`, but can also be accessed using the brackets operator `[key]`
```
class LandAnimal {
	thing = 0;
	new(num) {
		thing = num;
	}
	move() { println("Walk"); }
}
class WaterAnimal {
	thing = 2;
	new() {
		
	}
	move() { println("Swim"); }
}
```
```
class Platypus extends LandAnimal, WaterAnimal {
	new() {
		this.thing // returns 2
		LandAnimal(1); // calls LandAnimal's constructor
		this.thing // returns 1
		WaterAnimal(); // calls WaterAnimal's constructor
		this["thing"] // returns 1
	}
}
new Platypus().move(); // prints "Swim" because WaterAnimal is the last class Platypus is extended from
new Platypus().thing // 1
```
Using `inherit … from …` and `inherit … from … as …` you can inherit a property/method from any class resulting in very powerful multi inheritance. This can also be used to overwrite the default behavior of inheriting the property/method from the class at the end of the extends list.
```
class Platypus extends WaterAnimal, LandAnimal {
	new() {
		WaterAnimal(1);
		LandAnimal();
	}
	inherit move from WaterAnimal;
}
new Platypus().move(); // prints "Swim"
```
```
class Platypus extends WaterAnimal, LandAnimal {
	new() {
		WaterAnimal(1);
		LandAnimal();
	}
	inherit move from LandAnimal as walk;
	inherit move from WaterAnimal as swim;
}
new Platypus().walk(); // prints "Walk"
new Platypus().swim(); // prints "Swim"
new Platypus().thing // 1
```
When inheriting multiple properties from one class you can use a comma separated list
```
class Parent {
	new() {}
	a() {}
	b() {}
	c() {}
	d() {}
}
class Child {
	new() {}
	// Because we are only using "inherit a, b, c from Parent" only properties a, b, and c are inherited from Parent.
	// Method d is not inherited because we haven't used "extends Parent". We also can NOT call Parent's constructor.
	inherit a, b, c from Parent as x, y, z;
}
```
A class can be created without a constructor, but a class without a constructor can not be instantiated. However child classes of the class can be instantiated if they have a constructor.
```
class Uninstantiable {
	int a = 1;
	static b = 2;
}
Uninstantiable.a // throws ReferenceError
Uninstantiable.b // returns 2
new Uninstantiable(); // throws an error

class Child extends Uninstantiable {
	Child() {
		// we can't call Uninstantiable's constructor from Child's constructor because Uninstantiable() doesn't exist 
	}
}

new Child().a; // returns 1
Child.b // returns 2
```

Methods of a class are bound to the instance of the class including constructors. This means that the following is possible:
```
class Person {
	String name;
	new(String name) {
		this.name = name;
	}
	sayHi() {
		println(name);
	}
}

let tim = Person("Tim");
let timSayHi = tim.sayHi;
timSayHi(); // prints out "Tim"
```

## Garbage Collection
By default JITLang is garbage collected. Implementations are free to use a reference counting or a mark-sweep style garbage collection. The official JITLang
runtime uses a sweep algorithm. Despite having garbage collection, JITLang allows the programmer to manage their own memory using `new` and `free`. JITLang also allows the programmer to completely disable garbage collection using a compiler flag to give the programmer full control over memory for maximum performance.

## Structs
Structs are shorthand classes that don't contain methods. They are meant for creating values that are grouped together, but unlike classes they don't have constructors, inheritance, operator overloading, or methods. To create a new instance of a struct call the name of the struct as if it were a class and provide it values cooresponding to the variables in the struct. These values are assigned in the order that the variables were declared in the structs definition.
```
struct myStruct {
	x;
	y;
	z;
}
let vec = new myStruct(1, 2, 3);

struct typedStruct {
	int x;
	int y;
	int z;
}
typedStruct vec = typedStruct(1, 2, 3);
vec.x // returns 1
```
Structs are just syntactical sugar for simplified classes
```
struct myStruct {
	x;
	y;
	z;
}
// the above struct is semantically the same as 
class myStruct {
	x;
	y;
	z;
	new(x, y, z) {
		this.x = x;
		this.y = y;
		this.z = z;
	}
}
// which means you can pass structs around as Classes
Class myStructRef = myStruct;
```
Structs can be used in classes
```
class Foo {
	struct vec3 {
		x;
		y;
		z;
	}
	new() {}
	createVec(x, y, z) {
		return this.vec3(x, y, z);
	}
}
new Foo.createVec(5, 6, 7); // {x: 5, y: 6, z: 7}
```
If you don't like the functional syntax you can also use the Rust like syntax
```
struct myStruct {
	x;
	y;
	z;
}

let example = myStruct {
	x: 1,
	y: 10,
	z: 100
};
```
Because you can use the Rust like syntax with Structs and Structs are just Classess means that you can use the Rust like syntax with Classes. However it's important to note that the Rust like syntax doesn't directly define values on the object, rather it calls the class's constructor. This means that the identifiers used must match up with the constructor. Note that the identifiers don't need to be in order. Using an identifer in the initializer that doesn't exist on the constructor throws an error. Excluding an identifer defaults to void.
```
class Thing {
	private int x, y, z;
	new(int a, int b, int c) {
		x = a;
		y = b;
		z = c;
	}
}

let example = new Thing {
	a: 1,
	c: 100,
	b: 10,
}
```

## Enums
Enums are an easy way to group multiple variables together in an incrementative or non-incrementative manner. All variables created with an enum are constants. Each identifier is seperated by a comma. Trailing commas are allowed. Currently items in enums can't be typed. This may change.
```
enum {
	a, b, c
}
a // 0
b // 1
c // 2
```
You can also give the enum a name making all variables properties of that name
```
enum JIT {
	a, b, c
}
JIT.a // 0
JIT.b // 1
c // throws reference error
```
By default the enum variables value is the index of the variable name in the enum starting from 0, but this can be overridden using a colon and a value.
```
enum {
	a, b: "bar", c
}
a // 0
b // "bar"
c // 2
```
Enums can be used in classes
```
class Foo {
	static enum { a, b, c }
	enum { d, e, f }
	new() {
		this.d // 0
	}
}
Foo.a // 0
Foo.b // 1
new Foo().d // 0
```
Or for extra fun you could use a struct, function, class, etc as the value of an enum item
```
enum IpAddr {
	v4: (ip) => { ip },
	v6: String,
	iDunno: struct {
		String lol
	}
}

let home = new IpAddr.v4("127.0.0.1");
let loopback = IpAddr.v6("::1");
let thing = IpAddr.iDunno("haha").lol;
```

## Arrays
Arrays are a special type of Object where each property is an int rather than a String. Arrays can only store one type of data (eg: you cannot store ints and floats in the same array). Like with classes Arrays be be instantiated with or without the `new` keyword resulting in a locally persisting variable or a permanantly persisting variable respectively. No characters (including spaces) are allowed between the array's identifier and the open bracket. Arrays are created with the following syntaxes:
```
// auto detect array type (in this case int[])
let arr = [1, 2, 3];

// specify array type.
int[] arr = [1, 2, 3];
int[] arr = int[](3); // creates an array of length 3, is filled with 0's by default: [0, 0, 0]
int[] arr = new int[](3);

// !!!!!ERROR!!!!! int[] can NOT store float[]
int[] arr = float[3];

// Array can store any type of array
Array arr = new int[](3);
Array arr = new float[](3);

// Object can store any type of object including arrays, functions, and Strings
Object arr = new int[](3);
Object arr = new float[](3);

// You can use an Object array to store different types of objects. null counts as an Object
Object[] arr = [new House(), null, new Person()];

// You can create 2D arrays like so
int[][] arr = [
	[1,  2,  3,  4],
	[5,  6,  7,  8],
	[9, 10, 11, 12], // one trailing comma is allowed
];
int[][] arr = new int[](3, 4); // results in the same layout as directly above but is filled with 0's by default
// And 3D arrays
int[][][] arr = [
	[
		[1],
		[2],
	],
	[
		[3],
		[4],
	],
	[
		[5],
		[6],
	],
];
int[][][] arr = new int[](3, 2, 1);

// !!!!!ERROR!!!!! Cannot store 1D array in 2D array
int[][] arr = [];
```
To access an item in an array use `arr[index]` (eg: `arr[0]`). This same syntax is used when writing to an index in an array `arr[index] = 0;`. Indices start at zero. Arrays can only store 2^31 items. Accessing an index that is less than 0 will wrap around to the end of the array (`arr[-1]` returns the last element in the array). Accessing an index that is greater than the length of the array will throw a reference error. To access the length of the array use the readonly length property `arr.length` which returns the number of items in the array. If you need to grow or shrink the array use `arr.size(newLength);` method which will resize the array to the specified size. If the array is shrunk all the clipped off data is lost. If grown, the array's added indices will follow the pattern specified at the arrays initilization. To take a slice of an array you can use the slice method `arr.slice(0, 10)` or use the bracket notation` arr[0:10]`. If the first number is unspecified (eg: `arr[:10]`) then it is 0, if the second number is unspecified (eg: `arr.slice(0)` or `arr[0:]`) then it is the length of the array. If no parameters are specified (eg: `arr[:]` or `arr.slice()`) then it shallow clones the entire array. If you do not have a colon inside of the bracket notation like so `arr[]` then it is a syntax error. No characters (including spaces) are allowed between the array's identifier and the open bracket.

Array methods:
Array.push - `arr.push(123)` is functionally equivelant to `arr.grow(arr.length+1); arr[arr.length-1] = 123;`. You can also push multiple elements at the same time `arr.push(123, 456)`

Array.pop - `arr.pop(0)` removes an item from an array at a specified index. The following elements are then shifted left to take its place and the array is shrunk. Multiple items can be popped from an array at the same time `arr.pop(0, 1, 2)`.

Array.contains - `arr.contains(123)` returns a true or false depending on whether the array contains the given item

Array.indexOf - `arr.indexOf(123)` returns the index of an item in an array. Returns -1 if the item is not included.

Array.toString - `arr.toString(str)` converts each item to a String and joins them together seperated by the value of `str` and returns the resulting String. If no arguments are given the default str is a comma.

Array.filter - `arr.filter(fn (item, index) { item % 2 == 0 });` takes a function that is given two parameters, the function is then called on each item in the array and is provided the item and its index. The method returns a sub array containing only the items that returned true when run through the function.

Array.map - `arr.map(fn (item, index) { item + 1 })` Creates a shallow clone of the array and sets each item to the result of running the item and its index through the given function

Array.forEach - `arr.forEach((fn (item, index) { println(item) })` Runs the given function on each item in the array. The parameters given to the function are the item and the index in the array.

Array.find - `arr.find(fn (item, index) { item % 2 == 1 });` takes a function that is given two parameters, the function is then called on each item in the array and is provided the item and its index. This happens until the given function returns true. The find method then returns the item that resulted in true.

Array.concat - `arr.concat(arr2)` concatenates two arrays together and returns a new array. If the items in the second array are not the same type as the first, the items will cast to the type of the original and will throw an error if fail. Multiple arrays can be concatenated together at the same time `arr.concat(arr2, arr3)`

Array.reverse - `arr.reverse()` reverses all items in the array so that the first item is the last and the last is the first

Array.sort - `arr.sort(fn (a, b) { return a - b })` if the items are numbers and no argument is given then they will be sorted into order from smallest to largest. If items are Strings and no argument is given they will be sorted according their ASCII values from smallest to largest. If items are neither numbers nor Strings a function must be given as an argument that takes two items and returns a number, otherwise is a type error.

## Functions
Functions are declared using the following syntax. If two functions with the same identifier and argument types is declared in the same scope then a syntax error is thrown. However function overloading is allowed if the argument types are not the same. If no return type is specified then any return type is allowed rather than void. If you want to enforce the function to return void then you must explicitly declare it as void.
```
// regular function
fn myFuncIdentifier(type param, type param2) returnType {
	// body
}

// arrow function (is just syntactical sugar). Arrow functions can't have identifiers
() => {
	// body
}
```
Examples:
```
// untyped function declaration (can return any type)
fn add(a, b) {
	return a + b
}

// untyped function expression being assigned to a variable (can return any type)
let add = fn (a, b) {
	return a + b
};

// untyped arrow function expression being assigned to a variable (can return any type)
Function add = (a, b) => a + b;

// typed functions (they can only return floats)
fn add(float a, float b) float {
	return a + b
}
let f = fn(float a, float b) float {
	return a + b
};
let f = (float a, float b) => float {
	a + b
};
```
The types in arrow functions must be after the arrow. Function declarations are hoisted while function expressions are not. If an arrow function's body contains a single expression then that expression will be returned from the function unless the function explicitly has a void return type. Regular functions do not do this. Methods are a special type of function that only exist as properties of a class. They are different because they have a `this` keyword available to them that refers to the object the method is being called on. Normal functions do not have the `this` keyword. A function is called with its identifier followed by immediately by parenthesis. No characters (including spaces) are allowed between the functions's identifier and the open parenthesis. The arguments for the function are entered between the parenethesis seperated by commas.
```
myFunction(1, 2, 3);
```
The identifier `main` is a special function name that if declared in the top level scope will get called without you calling it. Although JITLang lets you declare a main function, it is not necessary to do so.
```
fn main(String[] args) {
	// this function gets called automatically when the program starts without the programmer needing to call it.
	// Depending on where the code is being run the main method might be given an array of Strings. For example if you were writing a command line program.
	println(args);
}
```

## Function Overloading
Function overloading can be used to change which function is being called depending on the types of the arguments. If multiple functions have the same name then the one who's parameters match the arguments given will be called. If none match then the version of the function that has no specified type is used.
```
fn myFunc(int a) {
	println("handle int");
}

fn myFunc(float a) {
	println("handle float");
}

fn myFunc(a) {
	println("handle all other types");
}

myFunc(1); // prints handle int
myFunc(1.0); // prints handle float
myFunc(""); // prints handle all other types
```

## Operator Overloading
Operator overloading on classes is done by adding the operator symbol as the identifier of a method on the class. It will accept one value as an argument which will be the value that is being operated on with the instance. Overloaded operator methods can also be overloaded.
```
class vec3 {
	float x, y, z;

	new(float a, float b, float c) {
		x = a;
		y = b;
		z = c;
	}

	+(value) {
		// this gets called when a value of any type is added to an instance of Thing
		throw "vec3 cannot be added with non vectors"
	}

	+(float value) {
		// this gets called when an integer is added to an instance of Thing
		return new vec3(x + value, y + value, z + value);
	}

	+(vec3 value) {
		// this gets called when another vec3 is added to an instance of Thing
		return new vec3(x + value.x, y + value.y, z + value.z);
	}
}

let myVec = vec3(1, 2, 3) + vec3(4, 5, 6); // results in vec3(5, 7, 9)
let myVec = vec3(0, 0, 0) + 1; // results in vec3(1, 1, 1)
let myVec = vec3(0, 0, 0) + "Hello World"; // !!!!! ERROR !!!!! throws "vec3 cannot be added with non vectors"

// The order in which the operands are operated on does matter. However if the first operand doesn't have any overloaded operators the VM will check for overloaded operators on the second operand before throwing a type error. This means that the vec3 will work regardless of the order in this case.
let myVec = 1 + vec3(0, 0, 0); // results in vec3(1, 1, 1). So much more readable and concise than doing something like vec3.add(vec3(0, 0, 0), 1)
```

### Returning from a function
The `return` keyword is used to return a value from a function. When the return keyword is encountered the function returns the expression that is after it and exits the function. If there is no expression after it then it returns void;
```
fn thing() {
	println(1);
	return 2;
	println(3); // this code is unreachable and will throw a compiler warning
}
println("got " + thing());
/*
1
got 2
*/
```
Any code after a return statement that is unreachable will throw a compiler warning. Note that if a value is on the line after the return statement it still gets returned
```
fn() {
	return
	1
}
// is equivelant to
fn() {
	return 1;
}
```

## Macros
Macros are a preprocessor that can expand commonly used short identifiers into inlined code. Macros are created with the syntax `#def MACRO_IDENTIFIER REPLACEMENT` and a macro is terminated by a newline character. Here is an example of a simple macro:
```
#def PI 3.1415
println(PI);
```
At compile time the `PI` gets replaced with `3.1415` resulting in `println(3.1415)`. You can also create functional macros:
```
#def sayIt() println("It")
sayIt!();
```
When using functional macros you must place an exclamation mark `!` between the identifier and the opening parethesis. But note that the `!` is not present in the macro declaration. At compile time the `sayIt!()` gets replaced with `println("It")`. You can also give functional macros arguments like so:
```
#def printJoin(a, b, c) println(a + "-" + b + "-" + c)
printJoin!(1, 2, 3);
```
`printJoin!(1, 2, 3)` becomes `println(1 + "-" + 2 + "-" + 3)`. You can make multiple functional macros with the same identifier and different parameters
```
#def printJoin(a, b) println(a + "-" + b)
#def printJoin(a, b, c) println(a + "-" + b + "-" + c)
printJoin!(1, 2);
printJoin!(1, 2, 3);
```
becomes
```
println(1 + "-" + 2);
println(1 + "-" + 2 + "-" + 3);
```
You can also use variable-argument macros. To do so place a `#` inside the parentheis of the definition. Then you can access the arguments using `#` followed by the index of the argument:
```
#def printJoin(#) println(#0 + "-" + #1 + "-" + #2)
printJoin!(1, 2, 3, 4)
printJoin!(1, 2, 3)
printJoin!(1, 2)
```
which becomes
```
println(1 + "-" + 2 + "-" + 3)
println(1 + "-" + 2 + "-" + 3)
println(1 + "-" + 2 + "-" + )
```
Notice that when given 4 argumets it ignores the last one. And when given only 2 arguments it replaces the third with nothing and the trailing `+` will then result in a compiler error. To handle this use the ternary operator to check if the argument exists. This ternary operator must be wrapped in macro parethesis and the code segments being inserted must also be wrapped in macro parenthesis `#()`. `#(#0 ? #(#0) : #(null))` checks of the 0th argument exists, if it does then it replaces it with the 0th argument, otherwise it replaces it with null. If you want to replace it with nothing if it doesn't exist then you could do this `#(#0 ? #(#0) : #())`, but since we are replacing it with nothing the ` : #()` is redundant so we could simplify it to `#(#0 ? #(#0))`
```
#def printJoin(#) println(#0 #(#1 ? #(+ "-" + #1)) #(#2 ? #(+ "-" + #2)))
printJoin!(1, 2, 3)
printJoin!(1, 2)
printJoin!(1)
```
which becomes
```
println(1 + "-" + 2 + "-" + 3)
println(1 + "-" + 2)
println(1)
```
What you'll notice is that when performing the same operation on each argument in a macro, the macro becomes quite long. This can be solved using chain macros.
```
#def AAA 0
#def BBB AAA
println(BBB)
```
becomes
```
#def BBB 0
println(BBB)
```
becomes
becomes
```
println(0)
```
In constrast if we reversed the order of the macros:
```
#def BBB AAA
#def AAA 0
println(BBB)
```
becomes
```
#def AAA 0
println(AAA)
```
becomes
```
println(0)
```
So be careful of the order of your macros. 
```
#def printJoin(#) println(#0 jn!(#1) jn!(#2))
#def jn(a) #(a ? #(+ "-" + a))
printJoin!(1, 2, 3)
printJoin!(1, 2)
printJoin!(1)
```
becomes
```
#def jn(a) #(a ? #(+ "-" + a))
println(1 jn!(2) jn!(3))
println(1 jn!(2) jn!())
println(1 jn!() jn!())
```
becomes
```
println(1 + "-" + 2 + "-" + 3)
println(1 + "-" + 2)
println(1)
```
Macros are block scoped.
```
{
	#def PI 3.14
	PI
	PI
}
PI
```
becomes
```
{
	3.14
	3.14
}
PI
```
If the macro is not in a block then it applies to the entire file. If you want to undefine the macro before the end of the block use `#undef MACRO_IDENTIFER`
```
{
	#def PI 3.14
	PI
	#undef PI
	PI
}
PI
```
becomes
```
{
	3.14
	PI
}
PI
```
Undefining a macro before it is defined throws a compiler error as does trying to undefine a macro that has already been undefined.

### async/await
the `async` keyword modifies a function making it run asyncronously.
```
async fn myFunc() {
	println(1);
}
myFunc();
println(2);
// console output:
/*
2
1
*/
```
the `await` keyword can be used when calling a function to make the process wait for the asyncronous function to finish executing before continuing. The await keyword cannot be used the top level scope. It can only be used inside of async functions.
```
async fn myFunc() {
	println(1);
}

async fn main() {
	await myFunc();
	println(2);
}
// console output:
/*
1
2
*/
```
async functions can be chained together using the `.then` property. The `then` method takes one function as an argument. This one function also has one parameter which gets the value returned from the original async function.
```
async fn myFunc() {
	println(1);
	return 2;
}

myFunc().then((res) => {
	println(res);
})
// console output:
/*
1
2
*/
```

## Loops
A while loop continues until the condition is met. They are declared like so
```
let i = 0;
while (i < 10) {
	i++;
}
```
A variation of the while loop is the do/while loop. The difference is that the the do block is executed once before the condition is evalated compared to a normal while loop where the body is executed only after the condition has been evaluated.
```
let i = 0;
do {
	stuff();
	i++;
} while (i < 10);
// is functionally equivelant to
let i = 0;
stuff();
i++;
while (i < 10) {
	stuff();
	i++;
}
```
A for loop is just syntactical sugar for a while loop written with the following syntax `for (expression1; expression2; expression3) {`  
Expression 1 is executed (one time) before the execution of the code block.  
Expression 2 defines the condition for executing the code block.  
Expression 3 is executed (every time) after the code block has been executed.  
Each expression can be left blank like so `for (;;) {` however if expression 2 is left blank then it always evaluates to false resulting in an infinite loop
```
// Multiple variables can be declared in a single expression
for (let i = 0, j = 10; i < j; i++) {
	doStuff();
}
// the above for loop is functionally equivelant to the following while loop
{
	let i = 0, j = 10;
	while (i < j) {
		doStuff();
		i++;
	}
}
```
Some more syntactical sugar is the `for in` loop
```
for (let prop in thing) {
	println(prop);
}
// if arr is an Array then the above for in loop is functionally equivelant to the following loop
{
	// note that the array is cached so that you can't change its value or length during the loop body
	let thingCache = thing, lenCache = thingCache.length;
	for (let i = 0; i < lenCache; i++) { // the interator variable (i) will not be exposed to the loop body in a for in loop
		{
			let prop = i;
			println(prop);
		}
	}
}
// if thing is an Object then it is functionally equivelant to
{
	let keysCache = Object.keys(thing); // keysCache and i are not exposed to programmer
	for (let i = 0; i < keysCache.length; i++) {
		{
			let prop = keysCache[i];
			println(prop);
		}
	}
}
```
The `for of` loop is almost identical to the `for in` loop, except that it gives the user the item in the Array/Object rather than the index/key
```
for (let item of thing) {
	println(item)
}
// if arr is an Array then the above for in loop is functionally equivelant to the following loop
{
	let thingCache = thing, lenCache = thingCache.length;
	for (let i = 0; i < lenCache; i++) {
		{
			let item = thingCache[i];
			println(item);
		}
	}
}
// if thing is an Object then it is functionally equivelant to
{
	let thingCache = thing, keysCache = Object.keys(thing);
	for (let i = 0; i < keysCache.length; i++) {
		{
			let item = thingCache[keysCache[i]];
			println(item);
		}
	}
}
```
You can leave out the braces on a loop and as a result only the first expression following the loop is considered part of its body.
```
while (i < 10)
	i++;
	j++;
// because the above loop doesn't have braces it is equivelant to
while (i < 10) {
	i++;
}
j++;
```
In the case of do/while loops the braces are required and cannot be left out. Note: because Strings are actually Arrays you can loop over them too.

### Control flow in loops
**break**  the break keyword exits the innermost loop that it is called in. If the loop that is exited is inside a parent loop then the parent loop will continue to iterate.
```
for (let i = 0; i < 5; i++) {
	if (i == 2) break;
	println(i);
}
/*
0
1
**/
```
**continue** the continue keyword skips to the end of the loops iteration
```
for (let i = 0; i < 5; i++) {
	if (i == 2) continue;
	println(i);
}
/*
0
1
3
4
**/
```

### Labels
Labels provide functionality somewhat similiar to goto statements. A label is any identifier that is not a reserved word followed by a colon (eg: `label:`). The label is then attached to the following statement or loop. The `break` keyword can be used followed by the name of the label to exit the statement that the label is attached to
```
myLabel: {
	println(1);
	break myLabel;
	println(2);
}
println(3);
/*
1
3
*/
```
the `continue` keyword works similarily but can only be used with loop statements
```
myLabel: for (let i = 0; i < 3; i++) {
	for (let j = 100; j > 0; j--) {
		if (j == 98) continue myLabel;
        	println(i + " " + j);
	}
}
/*
0 100
0 99
1 100
1 99
2 100
2 99
*/
```
Labels can only be applied to statements and not declarations
```
// !!!SYNTAX ERROR!!!
myLabel: func() {}
```

## if, else/if, else, and switch statements
An `if` statement is declared with the following syntax
```
if (condition) {
	doStuff();
}
```
just like loops, if the braces are exluded then only the immediate following expression/statement is attached
```
if (condition) doStuff() doMoreStuff();
// is the same as
if (condition) {
	doStuff();
}
doMoreStuff();
```
`else if` can be chained onto an `if` statment like so
```
if (a) { doStuff() } else if (b) { doOtherStuff() }
```
The else if statement will only be evalated and ran if the first if statement's condition evaluates to false. The else statement also works the same except that it doesn't have a condition and therefore is always executed
```
if (a) {
	println("a is true")
} else if (b) {
	println("a is false and b is true")
} else {
	println("a is false and b is false")
}
```
A lack of brackets can cause ambiguity. For example
```
// Does the else belong to the inner or outer if statement?
if (a)
	if (b) doStuff()
else doOtherStuff()

// the answer is that like other C-based languages the else statement belongs to the innermost if statment so the above is equivelant to 
if (a) {
	if (b) {
		doStuff()
	} else {
		doOtherStuff()
	}
}
```
Note that without brackets only a statement can be inside the if statement not a declaration.
```
// !!!ERROR!!!
if (a) let b = 1;
// !!!ERROR!!!
if (a) fn myFunc() {}

// OK
let b;
if (a) b = 1;

// OK
let b;
if (a) b = fn myFunc() {}
```

### switch statment
Chaining many if statements together can be tedious and messy. Therefore the switch statement is provided which is written as follows. 
```
switch (myValue) {
	case 1:
		println("myValue equals 1");
		return;
	case 2:
		println("myValue equals 2");
		return;
	default:
		println("myValue was neither 1 nor 2");
		return;
}
```
The switch statement starts at the top case and if the provided value matches the value following the `case` keyword then it evaluates the code following it. If the code after the case returns then the switch statement is exited and no further conditions are evaluated. However if there is no return statement then it falls through and checks the next case. To demonstrate this idea
```
switch (1) {
	case 1:
		println("1");
		return;
	case 2:
		println("2");
		return;
	default:
		println("any");
		return;
}
// the above switch statement prints:
/*
1
*/

// in constrast
switch (1) {
	case 1:
		println("1");
	case 2:
		println("2");
	default:
		println("any");
}
// the above switch statement prints:
/*
1
any
*/
```
Unlike most languages which use `break` JITLang only uses `return` to exit switch statements. Switch statements also return a value and return void if not value is returned
```
let res = switch (2) {
	case 1:
		return "a";
	case 2:
		return "b";
};
println(res); // prints "b"
```
All variables declared inside of a switch statement are in the same scope. However each fork can be given its own scope using a code block
```
switch (val) {
	case 1: {
		let test = 1;
		return;
	}
	case 2: {
		let test = 2; // YAY! this is no longer an error
		return;
	}
}
```

## Throwing and catching errors
### throw keyword
Errors can be throw using the `throw` keyword. The value thrown must be a String. If the value is an Object then it will have its toString method run and if it lacks a toString method then it will be stringified. If you throw a value that is not a String or Object then it will be cast to a String.
```
throw "ono";
// console output will be
/*
ono
*/

throw {
	message: "ono",
	lineNumber: 12
};
// console output will be
/*
{
	message: "ono",
	lineNumber: 12
}
*/

throw {
	message: "ono",
	lineNumber: 12,
	toString: () => {
		return "HELLO";
	}
};
// console output will be
/*
HELLO
*/
```

### try/catch/finally statement
A try/catch statement can be used to catch errors and handle them according to the programmers discression. If an error happens inside the try statement then the code inside the catch statement is run
```
try {
	throw "ERROR!";
} catch (err) {
	println("Caught: " + err);
} finally {
	println("This runs regardless of if there is an error or not");
}
// console output: "Caught: ERROR!"
```
Unlike loops and if statements a try/catch/finally statement must have braces. Also only one parameter is allowed inside the parenthesis of the catch statement. If a error is not caught then it will crash the program, however if it is caught then it program will not crash. Anything inside of the finally block runs regardless of whether an error has occurred or not.

## Strings
`String`s are special char[] Arrays. Unlike JavaScript Strings are not primitives and are passed around by reference rather than value. Because Strings are Arrays, individual characters can be read and written to using the [] operator. Accessing an index that doesn't exist is a runtime error. Most of the time you want to check if two Strings contain the same character rather than checking if they are the same Object. For this reason `==` checks if two Strings contain the same characters. If you want to check if two Strings are exactly the same object use `str1 === str2`. Calling `String()` on any value attempts to cast it to a String.
```
let str = "123"; // stack allocated string
let str2 = new "123"; // heap allocated string
let str3 = String("456") // stack allocated
let str3 = new String("456") // heap allocated

str == str2 // true because the Strings contain the same characters
str === str2 // false because they are not the exact same Object

str2 = str;
str === str2 // true
```
Just like arrays, use the `.length` property to read the length of the String. Strings inherit all of Array's methods however it also has added methods and some methods are redefined.

### String methods:
String.charAt - `"A".charAt(0)` -> `'A'` returns returns the character at a given index. Is functionally equivelant to `"A"[0]`

String.charCodeAt - `"A".charCodeAt(0)` -> `65` returns the ASCII value of the of the character as a certain index

String.startsWith - `"Abc".startsWith("Ab")` -> `true` returns whether the beginning characters of the String match the given String

String.endsWith - `"Abc".endsWith("bc")` -> `true` returns whether the last characters of the String match the given String

String.contains - `"Abc".contains("bc")` -> `true` returns whether the String contains the given String

String.indexOf - `"Abc".indexOf("bc")` -> `1` returns the index of the given String inside of the original String. Returns -1 if the String doesn't contain the given String

String.padStart - `"0".padStart(3, '1')` -> `"110"` takes two arguments. The first is a number which is the new length of the String. The second is the character to pad with. If no character is specified then a space character (' ') is used. It then pads the beginning of the String with the character until it reaches the specified length.

String.padEnd - `"0".padEnd(3, '1')` -> `"011"` takes two arguments. The first is a number which is the new length of the String. The second is the character to pad with. If no character is specified then a space character (' ') is used. It then pads the end of the String with the character until it reaches the specified length.

String.repeat - `"ab_".repeat(3)` -> `"ab_ab_ab_"` copies the String onto itself a given number of times

String.replace - `"caat".replace("a", 'b')` -> `"cbat"` replaces the first instance of a String with a new String. If no replacement String is specified it is replaced with an empty String "". `"caat".replace("a")` -> `"cat:`

String.replaceAll - `"caat".replaceAll("a", 'b')` -> `"cbbt"` functions the same as String.replace except it replaces every instance of the given String with the replacement String. Note: The method only does one scan through the loop so `"abab".replaceAll("a", "ab")` results in `abbabb` rather than an infinite loop.

String.split - `"aa_bb_cc".split("_")` -> `["aa", "bb", "cc"]` splits the String into an array of substrings and returns the array. It splits the String at every instance of a specified character/String and if no parameter is given then an empty String is used resulting in the String being split at each character.

String.toUpperCase - `"abc".toUpperCase()` -> `"ABC"` converts each character in the String to its upper case equivelant

String.toLowerCase - `"ABC".toLowerCase()` -> `"abc"` converts each character in the String to its lower case equivelant

String.trim - `"   abc   ".trim()` -> `"abc"` removes all whitespace characters from both ends of the String

String.trimStart - `"   abc   ".trimStart()` -> `"abc   "` removes all whitespace characters from the start of the String

String.trimEnd - `"   abc   ".trimEnd()` -> `"   abc"` removes all whitespace characters from the end of the String

String.equals - `new String("abc").equals(new String("abc"))` -> `true` returns whether or not all the characters in the original and given String are identical

### String static methods
String.fromCharCode - `String.fromCharCode(65)` -> `"A"` converts an ASCII value into a String if the argument is a number. If the argument given is an array then it goes through the array converting each item to a String and then joins the result. `String.fromCharCode([65, 66, 67])` -> `"ABC"`

### creating chars/Strings
Single quotes ('') are used for creating a char not a String. Putting more than one character between two single quotes is a syntax error. Also chars do not have any methods as they are a primitive data type. For many functions and operations if you try using a char as a String then JITLang will automatically convert the char into a String. Double Quotes ("") are used for creating a primitive String. To get an Object String you need to use the String constructor. Backticks are used to declare template literals. Template literals are String, but they have special behavior at declaration time allowing them to have multiple lines and interpolate data. Data is interpolated by escaping the String with `${value}` and you can insert a value or identifier between the curly braces.

```
char c = 'a'; // this is not a string
String s = new String("a"); // this is a String
let b = "TEST";
String s = `this
is a ${b}
multi-line String!`; // "this\nis a TEST\nmulti-line string!"
```

### escaping in Strings
You can escape characters in a String by placing a backslash (\) behind it. Escaping can be used to have quotes or backticks inside of a String without closing it.
```
"he said \"blah blah\" on wednesday"
`he said \`blah blah\` on wednesday`
`\${test}` // this is equal to "${test}" because the '$' character was escaped
```
Most characters when escaped are themselves however there are special escape characters  
"\n" -> line feed  
"\t" -> tab  
"\r" -> carriage return  
"\f" -> form feed  
"\b" -> backspace character  
If you want to have backslashes in your String you need to escape the backslash
```
// prints out a single backslash becuase the first one escapes the second one
println("\\");
```
Other special escape sequences are for representing non-ASCII characters in a String. You can use hexadecimal or unicode escape sequences. Hexadecimal escape sequences start with "\x" which is followed with exactly 2 hexadecimal characters. If the hexidecimal for your character is only one character long it must be padded with a leading 0. Unicode escape sequences start with "\u" which is followed with exactly 4 hexadecimal characters. If the hexidecimal for your character is less than 4 characters long it must be padded with leading zeros. The hexidecimal characters in the escape sequence are case insensitive ("A" and "a" are the same).
```
"\xA9" // ©
"\u00A9 // ©
```

## Object(s)
JITLang also allows you to create anonymous objects. Objects can be created in the same format as JavaScript:
```
let myValue = "exampleKey";
Object myObj = {
	long key1: 123, // keys follow the same rules as all other identifiers; you can put a type before the identifier to set the values type
	"456": 789, // keys must be Strings, you can put the identifier in a String literal
	[myValue]: 1011, // if you put a variable name in brackets then the value of the variable becomes the name of the key; also one trailing comma is allowed
};

// values can be read/set using the dot operator or brackets operator
typeof myObj.key1 == long // returns true
myObj["key1"]  // returns 123
myObj["465"]  // returns 789
myObj.exampleKey  // returns 1011
myObj.exampleKey = 9999; // sets property to new value
myObj.newKey // returns void
myObj.newKey = "hi"; // you can create set new properties on objects that don't already exist
```
While regular Objects can have new properties dynamically assigned on them, Arrays, Functions/Structs, Classes, and Strings can not.

## typeof()
typeof is a built in keyword that returns the type of a value
```
typeof 1 // returns int
typeof 1.0 // returns double
typeof "" // returns String
typeof [] // returns Array
typeof {} // returns Objec
typeof () => {} // returns Function
```

## BigInt
BigInts are integers of arbitrarily big size. BigInts are a primitive data type. They work with all arithmetic and bitwise operators in the same way a regular integer would. Arithmetic operators on a BigInt can only be done with another BigInt. Trying to add a BigInt and a regular int will result in a type error. 
```
// BigInts can be created using the BigInt function
BigInt a = BigInt("123"); // The BigInt function expects Strings
BigInt b = BigInt(123); // 123 is implicitly cast to a String and then a BigInt
let c = 123n; // for the sake of concise code adding an "n" after a number converts it into a BigInt
let d = BigInt("123.99"); // becomes 123 because all floating point data is truncated
```

## Module System
A jitl file can export a value and another jitl files can import values from other files. 

### export
Any type of value can be exported, however only global values can be exported. To export a value simply use the `export` keyword followed by an expression. Note that a file can only contain a single export, trying to export more than one item per file will throw a compiler error. It is convention to use the export at the bottom of your file. To export multiple items use an Array or an Object. Here are some examples of how to use export. Pretend each `// --------------------` is the end of a file the following code block contains multiple files.
```
const num = 123.456;
export num;
// --------------------
fn someFunc() {
	println("Hello")
}
export someFunc;
// --------------------
export fn() {
	println("Hello")
};
// --------------------
export [1, 2, 3];
// --------------------
enum NUMBERS {
	a, b, c
}
export {
	nums: NUMBERS,
	compile: fn() {},
	transpile: fn() {},
	genAST: fn() {}
};
// --------------------
enum NUMBERS {
	a, b, c
}
fn compile() {}
fn transpile() {}
fn genAST() {}
export {
	NUMBERS,
	compile,
	transpile,
	genAST
};
```

### import
Any type of value can be imported, however you can only import values from files that have exported them. You can also only use an import statement in the global scope/ If the file you are importing is exporting a non object (Arrays not included) value then you import like so `import IDENTIFER from "PATH_TO_FILE"`. Note that IDENTIFIER can what any valid identifier. If the file you are importing exported an object (Arrays not included) then you can import like so `import PROP1, PROP2, PROP3 from "PATH_TO_FILE"` to import select properties from the object into the current scope. Or you can use `import IDENTIFER from "PATH_TO_FILE"` to import the entire object as a single variable. However if your object has a lot of properties you may want to use the spread syntax `import ... from "PATH_TO_FILE"` which will import every property from the object into the current scope. The "PATH_TO_FILE" can contain both absolute and relative URLs. If using a relative URL then the URL is relative to the file using `import` rather than relative to the compiler. Relative URLS start with "./". The convention is to use forward slashes `"./lib`, but because of Windows backward slashes are also allowed `".\lib"`. Note that the path must be a double quote or single quote literal (Multi-line Strings are NOT allowed and neither are variables). You do not need to specify `.jitl` at the end of the path. Circular imports are not allowed. You can also import from website URLs.

### Example 1
src/lib.jitl
```
enum OpCodes {
	RETURN,
	ADD,
	MUL
}
export OpCodes;
```
src/main1.jitl
```
import theCodes from "./lib"
println(theCode.RETURN)
println(theCode.ADD)
println(theCode.MUL)
```
src/main2.jitl
```
import ... from "./lib"
println(RETURN)
println(ADD)
println(MUL)
```
src/main3.jitl
```
import RETURN, ADD from "./lib"
println(RETURN)
println(ADD)
// Note: SUB was not imported
```

### Example 2
src/random.jitl
```
fn random(start, stop) {
	return <int> (Math.random() * (stop - start) + start);
}
```
src/main.jitl
```
import myRandom from "./random"
println(myRandom(0, 5));
```

### Example 3
src/main.jitl
```
import test from "./lib/myLib"
println(test + "3") // "123"
```
src/lib/myLib.jitl
```
import dep from "./myLibDependency"
export dep + "2" 
```
src/lib/myLibDependency.jitl
```
export "1";
```

### Example 4
src/main.jitl
```
import test from "https://example.com/library.jitl"
println(test + "3") // "123"
```

Lastly if you are using the conventional module system then you can simply use the name of the module in your import statement. When you use a plain name in your import statement then the compiler will check for a `lib` directory relative to the compiler. It when searches for a directory with that name. Then inside that it searches for a `module.jitl` file. Because the `lib` is relative to the path where the compiler is run modules inside lib can import other modules that are in lib.
```
project/
	lib/
		my_library/
			aaa.jitl
			bbb.jitl
			module.jitl
		my_other_library/
			module.jitl
	main.jitl
```
main.jitl
```
import ... from "my_library"
import ... from "my_other_library"
```
is the same as  
main.jitl
```
import ... from "./lib./my_library/module.jitl"
import ... from "./lib/my_other_library/module.jitl"
```

### arithmetic operators
`+` add two numbers or concatenate Strings  
`-` substract two numbers  
`*` multiply two numbers  
`/` divide two numbers  
`**` raise one number to the power of another  
`%` modulus (the remainder from division)  

### assignment operators
`++` increment a number variable by 1  
`--` decrement a number variable by 1  
`=` assignment operator (assigns a value to a variable)  
`+=` increments a number variable by a given amount  
`-=` decrements a number variable by a given amount  
`*=` multiplies a number variable by a given amount  
`/=` divides a number variable by a given amount  
`%=` sets number variable to itself modulus given amount  
`**=` sets number variable to itself to the power of given amount  

### comparison operators
`==` equality operator (checks if two values are equal)  
`===` strict equality operator (checks if two values have the exact same memory address)  
`!=` inequality operator (checks if two values are not equal)  
`>` greater than operator (checks if one number is greater than another)  
`<` less than operator (checks if one number is less than another)  
`>=` greater than or equal to operator (checks if one number is greater than or equal to another)  
`<=` less than or equal to operator (checks if one number is less than or equal to another)  
`? : ` ternary operator (basically a shorthand if statement that returns a value)  

### logical operators
`&&` checks if one boolean and another boolean are both true  
`||` check if one boolean, another boolean, or both is true  
`!` check if one boolean is not true  

### bitwise operators
bitwise operators convert their operands into 32 bit integers and then the operation is performed on each pair of bits  
`&` bitwise AND  
`|` bitwise OR  
`~` bitwise NOT  
`^` bitwise XOR (exclusive or aka ((A || B) && !(A && B)))  
`<<` left bit shift (shifts the bits of the number left. Bits do not wrap aka are discarded and empty bits are 0)  
`>>` right bit shift (shifts the bits of the number right. Bits do not wrap aka are discarded and empty bits are 0)  
`>>>` unsigned right bit shift (The sign bit is set to 0. shifts the bits of the number right. Bits do not wrap aka are discarded and empty bits are 0)  

### bracket operators
`[val]` The bracket operator is used to access arrays `arr[number]` (see Arrays section). It is also can be used to access properties of an object `obj[String]`. It is also used to create arrays `type[] = new int[](number);`  
`.val` The dot operator is used to access properties of an object `obj.prop`  
`<type>` casting operator explicitly casts a value to a new type  

# JITLang VM
JITLang code is compiled to JITLang bytecode. The bytecode is then run in the JITLang VM which can then compile the bytecode to native machine code. Each instruction is a single byte allowing for 256 unique instructions. Each value is 32 bits. 64 bit values are represented by 2 sequential 32 bit values.
