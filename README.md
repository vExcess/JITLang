# JITLang (originally VexScript)
A Just In Time compiled language that aims to be a hybrid language combining features from both lower level and higher level languages. For example function return types and arguments are by default dynamically typed, but they can be explicitly declared to be a certain type resulting in static typing behavior. Some people argue that defaulting to dynamic typing is prone to bugs; if you can't remember to type your functions then that's a skill issue, but regardless to make development as convienent as possible, I will add compiler flags which you can use to ensure type safety.

## Feedback Appreciated
If you find any discrepancies or ambiguous cases in my specification please let me know so that I can fix them.

## Notes:
  - I've tried to write a complete specification, but I'm sure there are details and edge cases I haven't thought about.
  - The language is theoretically capable of being faster than JavaScript, however at the moment my runtime is about 10,000x slower.
  - It's runtime is currently only implemented in JavaScript (which is quite slow) and it only supports a very small subset of the language (which is why I haven't publicly released it yet)
  - I am planning to implement Web Assembly as a compilation target for JITLang which would result in the unique ability to easily write code for the web that has near native performance. Currently if you want to compile code to Web Assembly, you'll need to use Emscripten which is a big native executable which can't run in a browser. In comparison JITLang will be able to compile inside your web browser and will be much more lightweight. 

## Purpose
To be a language that combines the high-level features and syntax of JavaScript with lower-level features from Java and C++. The language is meant to allow the programmer flexible and concise code while maintaining simplicity and fast execution speed. While JavaScript forces you to write unoptimizable code that is easy to understand and C++ forces you to write dangerously complex code that is highly optimizable, JIT-Lang lets you write performant code where it matters and simple code where convenient. JitLang is designed to be JavaScript the way JavaScript should have been designed. It gets rid of the stupid features of JavaScript that nobody uses. For example in JavaScript Object plus Array equals Number, and Array plus Number equals String which makes complete logical sense (love this video https://www.destroyallsoftware.com/talks/wat). JavaScript also has a lot of ambiguous syntax that JitLang does away with. It is superior to Java because "I love being forced to type out ‘class Main { public static void main(String[] args) {} }’ every time I want to start a program said no programmer ever" (Also highly recommend https://www.youtube.com/watch?v=m4-HM_sCvtQ). OOP is great and all, but making literally everything its own class is going too far. In C++, the specification for the language is vague so never know if the int you are using is 4 bytes or 2 bytes. JitLang also adds features that neither JS nor Java support such as multiple inheritance and operator overloading which are incredibly helpful for writing concise and clean code.

## Execution
JitLang source code are stored as ".jitl" files synonymous with ".java" files. Source code files are then compiled to JITLang bytecode/syntax tree files stored as ".jitt" which are the equivalent to Java’s ".class" files. The ".jitt" files are then run in the JITLang VM. JITLang can also be compiled directly to native executables or Web Assembly. Depending on the complexity of the code the executable may be larger if the compiler needs to bundle the JITLang VM inside of the executable.

## Semicolons
There is a big argument between whether languages should require semicolons or frown upon them. JavaScript says both are good. However the way JavaScript did it is absolutely awful. While JS makes semicolons technically optional, the use or lack thereof can drastically change the meaning of the code which very often leads to frustrating bugs. JITLang on the other hand makes semicolons completely optional, meaning they are only for asthetics. However unlike JS, the usage or lack of semicolons make no change to the meaning of the code.

## Special Words
### Keywords
let, const, if, else, do, while, for, struct, class, private, static, super, extends, inherit, enum, try, catch, throw, return, switch, case, default, break, continue, func, new, this, true, false, Infinity, import, export, from, as, async, await
### Built in data types
bool, byte, short, char, int, uint, long, ulong, float, double, void, null, string, vec, BigInt
Object, Array, Function, String

## Primitive Data Types
Primitive data types are passed by value rather than by reference.  
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
**string** - A special type of array of characters. Despite actually being an object, strings are treated like primitives.  
**vec** - A vector that can hold 2, 3, or 4 values  
**BigInt** - Capable of holding signed integers of arbitrarily large size  

## Non-primitive Data Types
Non-primitive data types are passed by reference rather than value  
**Object** - The root class of all other classes and objects  
**Array** - A special type of object where each key is an integer that can be read/write using the [] operator  
**Function** - Functions are objects so that they can be treated like first class functions and be passed around by reference  
**String** - Strings are just an object version of the primitive string data type  

## Variables
Variables are created in the format
```
type foo = bar;
```
Rules for naming identifier
- Names can contain letters, digits, underscores, dollar signs, and most other Unicode characters (Yes, you can use emojis for variable names).
- Names cannot begin with a number
- Names are case-sensitive (a and A are different variables).
- Reserved words cannot be used as names.
You can use `let` rather than a specific type. The compiler will automatically detect the variable’s data type. If the variable is left uninitialized it will hold the value of `void` until assigned a value. Re-declaring a variable that has already been declared in the same scope will throw a syntax error. If you attempt to assign a variable a value with a different data type than the variable has then JITLang will attempt to implicitly cast the value and throws a type error if it fails. If the variable is to be a constant you can use the `const` modifier before its type ex: `const int a = 1;`. If the variable is being declared with modifiers (const, private, static, export) and the variable type is unspecified then you can leave out the `let` ex:
```
const a = 1;
```
Accessing a variable that hasn’t been declared throws a reference error. All variables are block scoped
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
Having to memorize various different casting rules can be a big pain and manually needing to cast each parameter going into an operation is both tedious and makes for long code. One of the great features about JavaScript is that anything can be cast to anything else. Similarly, JITLang will attempt to implicitly cast any piece of data to the needed type for you.

The syntax for casting is:
```
int foo = <long> bar;
```
JITLangs implicit casting rules are very simple. All numbers can be cast to any other type of number. When operating on two numbers JITLang will promote the operand of a lesser type to the other operand's type in order to prevent data loss. For example if you multiply an int by a float it will automatically cast the int to a float before perfoming the operation.

### Number Casting Rules
1)  If one operand's type can store decimal values and the other operand's type cannot then the operand that cannot is promoted to the type of the one that can
2)  If no promotion occured in rule 1: if one operand is signed and the other isn't the unsigned one is cast to the type of the signed number.
3)  If no promotion occured in either rule 1 or rule 2: if one operand's type has less bits than the other, it is cast to the type that has more bits

### String Casting Rules
- If concatenating a char and a string, the char will automatically be cast to a string.
- If casting a string to a char, the result will be the first character in the string.
- When any number is being cast to a string the result will be the decimal text of the number (eg: `<string>(65)` -> `"65"`). The exception to this is the char number type. When chars are cast to a string they form a single character long string where the character is based on the ASCII value of the char. Essentially `<string>(myChar)` is equivelant to `String.fromCharCode(myChar)` (eg: `<string>(<char> 65)` -> `"A"`)

### Literal Casting Rules
Any number literals are a double if it has decimal points, or is an int if there are no decimal points.
```
let num = 1; // num is an int
let num = 1.0; // num is a double
let num = 1.; // also a double; trailing decimals are allowed
```

## Classes
Classes are created in the following format
```
class Animal {
	int age = 0; // variable declarations
	private name; // private variables
	static needsOxygen = true; // static makes a property/method belong to the class rather than an instance of the class
	Animal(string n) => { // constructor
		name = n; // define object properties
		getName(); // call methods
		this.getName(); // properties/methods can also be accessed using the `this` keyword
	}
	getName() => String { // methods
		return this.name;
	}
}
```
Multiple inheritance is supported. If a class has two parent classes with the same property/method it will inherit from the last parent. When creating properties without a type in a class the `let` is excluded.
```
class LandAnimal {
	thing = 1;
	LandAnimal() => {}
	move() => { println("Walk"); }
}
class WaterAnimal {
	thing = 2;
	WaterAnimal() {}
	move() => { println("Swim"); }
}
```
```
class Platypus extends LandAnimal, WaterAnimal {
	Platypus() => {}
}
new Platypus().move(); // prints "Swim" because WaterAnimal is the last class Platypus is extended from
new Platypus().thing // 2
```
Using `inherit … from …` and `inherit … from … as …` you can inherit a property/method from any class resulting in very powerful multi inheritance. This can also be used to overwrite the default behavior of inheriting the property/method from the class at the end of the extends list.
```
class Platypus extends WaterAnimal, LandAnimal {
	Platypus() => {}
	inherit move from WaterAnimal;
}
new Platypus().move(); // prints "Swim"
```
```
class Platypus extends WaterAnimal, LandAnimal {
	Platypus() => {}
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
	Parent() => {}
	a() => {}
	b() => {}
	c() => {}
}
class Child {
	Child() => {}
	inherit a, b, c from Parent as x, y, z;
}
```
A class can be created without a constructor, but a class without a constructor can not be instantiated. However child classes of the class can be instantiated if they have a constructor.
```
class Uninstantiable {
	int a = 1;
	static b = 1;
}
Uninstantiable.a // returns void
Uninstantiable.b // returns 1
new Uninstantiable(); // throws an error
```

## Enums
Enums are an easy way to group multiple variables together in an incrementative manner. All variables created with an enum are constants.
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
By default the enum variables value is the index of the variable name in the enum, but this can be overridden using the assignment operator.
```
enum {
	a, b = "bar", c
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
	Foo() => {
		this.d // 
	}
}
Foo.a // 1
Foo.b // 2
Foo.c // 3
```

## Arrays
Arrays are a special type of Object where each property is a 32 bit integer rather than a string. Arrays can only store one type of data (eg: you cannot store ints and floats in the same array). Arrays are created with the following syntaxes:
```
// auto detect array type (in this case int[])
let arr = [1, 2, 3];

// specify array type.
int[] arr = [1, 2, 3];
// The new keyword is optional when creating arrays
int[] arr = int[](3);
int[] arr = new int[](3);

// !!!!!ERROR!!!!! int[] can NOT store float[]
int[] arr = float[3];

// Array can store any type of array
Array arr = new int[](3);
Array arr = new float[](3);

// Object can store any type of object including arrays, functions, and strings
Object arr = new int[](3);
Object arr = new float[](3);

// You can use an Object array to store different types of objects
Object[] arr = [new House(), null, new Float()];

// You can create 2D arrays like so
int[][] = [
	[1,  2,  3,  4],
	[5,  6,  7,  8],
	[9, 10, 11, 12], // the trailing comma is allowed
];
int[][] = new int[](3, 4);
// And 3D arrays
int[][][] = [
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
int[][][] = new int[](3, 2, 1);
```
To access an item in an array use `arr[index]` (eg: arr[0]). This same syntax is used when writing to an index in an array `arr[index] = 0;`. Indices start at zero. Accessing an index that is less than 0 or greater than the length of the array will throw a reference error. To access the length of the array use the readonly length property `arr.length` which returns the number of items in the array. If you need to grow or shrink the array use `arr.size(newLength);` method which will resize the array to the specified size. If the array is shrunk all the clipped off data is lost. If grown the array’s added indices will follow the pattern specified at the arrays initilization. To take a slice of an array you can use the slice method `arr.slice(0, 10)` or use the bracket notation` arr[0:10]`. If the first number is unspecified (eg: `arr[:10]`) then it is 0, if the second number is unspecified (eg: `arr.slice(0)` or `arr[0:]`) then it is the length of the array. If no parameters are specified (eg: `arr[:]` or `arr.slice()`) then it shallow clones the entire array. If you do not have a colon inside of the bracket notation like so `arr[]` then it is a syntax error. No characters (including spaces) are allowed between the array's identifier and the open bracket.

Array methods:
Array.push - `arr.push(123)` is functionally equivelant to `arr.grow(arr.length+1); arr[arr.length-1] = 123;`. You can also push multiple elements at the same time `arr.push(123, 456)`

Array.pop - `arr.pop(0)` removes an item from an array at a specified index. The following elements are then shifted left to take its place and any remaining places are set to null. Multiple items can be popped from an array at the same time `arr.pop(0, 1, 2)`

Array.contains - `arr.contains(123)` returns a true or false depending on whether the array contains the given item

Array.indexOf - `arr.indexOf(123)` returns the index of an item in an array. Returns -1 if the item is not included.

Array.toString - `arr.toString(str)` converts each item to a string and joins them together seperated by the value of `str` and returns the resulting string. If no arguments are given the default str is a comma.

Array.filter - `arr.filter((item, index) => item % 2 == 0);` takes a function that is given two parameters, the function is then called on each item in the array and is provied the item and its index. The method returns a sub array containing only the items that returned true when run through the function.

Array.map - `arr.map((item, index) => item + 1)` Creates a shallow clone of the array and sets each item to the result of running the item and its index through the given function

Array.forEach - `arr.forEach((item, index) => item + 1)` Runs the given function on each item in the array. The parameters given to the function are the item and the index in the array.

Array.find - `arr.find((item, index) => item % 2 == 0);` takes a function that is given two parameters, the function is then called on each item in the array and is provied the item and its index. This happens until the given function returns true. The find method then returns the item that resulted in true.

Array.concat - `arr.concat(arr2)` concatenates two arrays together and returns a new array. If the items in the second array are not the same type as the first, the items will cast to the type of the original and will throw an error if fail. Multiple arrays can be concatenated together at the same time `arr.concat(arr2, arr3)`

Array.reverse - `arr.reverse()` reverses all items in the array so that the first item is the last and the last is the first

Array.sort - `arr.sort((a, b) => return a - b)` if the items are numbers and no argument is given then they will be sorted into order from smallest to largest. If items are strings and no argument is given they will be sorted according their ASCII values from smallest to largest. If items are neither numbers nor strings a function must be given as an argument that takes two items and returns a number, otherwise is a type error.

## Functions
Functions are declared using the following syntax. If two functions with the same identifier and argument types is declared then a syntax error is thrown. If no return type is specified then any return type is allowed rather than void. If you want the enforce the function to return void then you must explicitly declare it as void.
```
nameIfIsADeclaration(type param, type param2) => returnType {
	// body
}
```
Examples:
```
// untyped functions (they can return any type)
f(a, b) => {return a + b} // function declaration
let f = (a, b) => {return a + b}; // function expression
let f = (a, b) => a + b; // function expression without curly brackets
Function f = (a, b) => {a + b}; // variable is explicitly a function

// typed functions (they can only return floats)
f(float a, float b) => float {return a + b}
let f = (float a, float b) => float {return a + b};
let f = (float a, float b) => float a + b;
```
Function declarations are hoisted while function expressions are not. If a function expression's body is a singular expression then the result of the expression is returned from the function unless the functions return type is void. Methods are a special type of function that only exist as properties of a class. They are different because they have a `this` keyword available to them that refers to the object the method is being called on. Normal functions do not have the `this` keyword. A function is called with its identifier followed by immediately by parenthesis. No characters (including spaces) are allowed between the functions's identifier and the open parenthesis. The arguments for the function are entered between the parenethesis seperated by commas.
```
myFunction(1, 2, 3);
```

## Function Overloading
Function overloading can be used to change which function is being called depending on the types of the arguments. If multiple functions have the same name then the one who's parameters match the arguments given will be called. If none match then the version of the function that has not specified type is used.
```
myFunc(int a) => {
	println("handle int");
}

myFunc(float a) => {
	println("handle float");
}

myFunc(a) => {
	println("handle all other types");
}

myFunc(1); // prints handle int
myFunc(1.0); // prints handle float
myFunc(""); // prints handle all other types
```

## Operator Overloading
Operator overloading is done by adding the operator symbol between the name of the method and the parenthesis. operator overloaded methods follow the same rules as overloaded functions.
```
class Thing {
	Thing() => {

	}

	myMethod + (value) => {
		// this gets called when a value of any type is added to an instance of Thing
	}

	myMethod + (int value) => {
		// this gets called when an integer is added to an instance of Thing
	}
}
```

### Returning from a function
The `return` keyword is used to return a value from a function. When the return keyword is encountered the function returns the expression that is after it and exits the function. If there is not expression after it then it returns void;
```
thing() => {
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
() =>  {
	return 
	1;
}
// is equivelant to
() =>  {
	return 1;
}
```

### async/await
the `async` keyword modifies a function making it run asyncronously.
```
async myFunc() => {
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
the `await` keyword can be used when calling a function to make the process wait for the asyncronous function to finish executing before continuing. The await keyword cannot be used the top level scope, it can only be used inside of other async functions.
```
async myFunc() => {
	println(1);
}
(async () => {
	await myFunc();
	println(2);
})()
// console output:
/*
1
2
*/
```
async functions can be chained together using the `.then` property. The `then` method takes one function as an argument. This one function also has one parameter which gets the value returned from the original async function.
```
async myFunc() => {
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
	
}
// if arr is an Array then the above for in loop is functionally equivelant to the following loop
{
	let thingCache = thing;
	for (let i = 0; i < thingCache.length; i++) {
		{
			let prop = i;
			println(index);
		}
	}
}
// if thing is an Object then it is functionally equivelant to
{
	let keysCache = Object.keys(thing);
	for (let i = 0; i < keysCache.length; i++) {
		{
			let prop = keysCache[i];
			println(index);
		}
	}
}
```
The `for of` loop is almost identical to the `for in` loop, except that it gives the user the item in the Array/Object rather than the index/key
```
for (let prop of thing) {
	
}
// if arr is an Array then the above for in loop is functionally equivelant to the following loop
{
	let thingCache = thing;
	for (let i = 0; i < thingCache.length; i++) {
		{
			let prop = thingCache[i];
			println(index);
		}
	}
}
// if thing is an Object then it is functionally equivelant to
{
	let thingCache = thing, keysCache = Object.keys(thing);
	for (let i = 0; i < keysCache.length; i++) {
		{
			let prop = thingCache[keysCache[i]];
			println(index);
		}
	}
}
```
You can leave out the braces on a loop and as a result only the first expression following the loop is considered part of its body
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
In the case of do/while loops the braces are required and cannot be left out. Note: because strings are actually Arrays you can loop over them too.

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
Labels provide functionality somewhat similiar to goto statements. A label is any identifier that is not a reserved word followed by a colon (eg: `label:`). The label is then attached to the following statement. The `break` keyword can be used followed by the name of the label to exit the statement that the label is attached to
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
just like loops if the braces are exluded then only the immediate following command is attached
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
Not that without brackets only a statement can be inside the if statement not a declaration.
```
// !!!ERROR!!!
if (a) let b = 1;
// !!!ERROR!!!
if (a) func myFunc() {}

// OK
let b;
if (a) b = 1;

// OK
let b;
if (a) b = func myFunc() {}
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
Unlike most language which use `break` JITLang only uses `return` with switch statements. Switch statements also return a value and return void if not value is returned
```
let res = switch (2) {
	case 1:
		return "a";
	case 2:
		return "b";
};
println(res); // prints "b"
```
All variables declared inside of a switch statement are in the same scope
```
// !!!SYNTAX ERROR!!! test has already been declared
switch (val) {
	case 1:
		let test = 1;
		return;
	case 2:
		let test = 2;
		return;
}
// the above is a syntax error however you can give each case its own scope like so
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
Errors can be throw using the `throw` keyword. The value thrown must be a string. If the value is an Object then it will have its toString method run and if it lacks a toString method then it will be stringified. If you throw a value that is not a string or Object then it will be cast to a string.
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

### try/catch statement
A try/catch statement can be used to catch errors and handle them according to the programmers discression. If an error happens inside the try statement then the code inside the catch statement is run
```
try {
	throw "ERROR!";
} catch (err) {
	println("Caught: " + err);
}
// console output: "Caught: ERROR!"
```
Unlike loops and if statements a try/catch statement must have braces. Also only one parameter allowed inside the parenthesis of the catch statement. If a error is not caught then it will crash the program, however if it is caught then it program will not crash.

## strings and Strings
`string`s are special char[] Arrays. However despite being objects they act like primitive data types and are passed around by value rather than reference. But despite acting like primitives they have properties and methods like an object. On the contrast `String`s (with a capital S) are objects. They function the same as primitive strings except that they are passed around by reference rather than value. Because strings and Strings are Arrays individual characters can be read and written to using the [] operator. 
```
let str = "123", str2 = "123";
let strObj = new String("123"), strObj2 = new String("123");

str == str2 // true because since string is primitive it compares each value
strObj == strObj2 // false because even though they contain the same characters they are not the exact same object.

let str = "123", 
    str2 = str;
str2 += "a";
println(str); // 123
println(str2); // 123a

let str = new String("123"), 
    str2 = str;
str2 += "a";
println(str); // 123a
println(str2); // 123a
```
Just like arrays, use the `.length` property to read the length of the string. Strings inherit all of Array's methods however it also has added methods and some methods are redefined.

### string/String methods:
String.charAt - `"A".charAt(0)` -> `'A'` returns returns the character at a given index. Is functionally equivelant to `"A"[0]`

String.charCodeAt - `"A".charCodeAt(0)` -> `65` returns the ASCII value of the of the character as a certain index

String.startsWith - `"Abc".startsWith("Ab")` -> `true` returns whether the beginning characters of the string match the given string

String.endsWith - `"Abc".endsWith("bc")` -> `true` returns whether the last characters of the string match the given string

String.contains - `"Abc".contains("bc")` -> `true` returns whether the string contains the given string

String.indexOf - `"Abc".indexOf("bc")` -> `1` returns the index of the given string inside of the original string. Returns -1 if the string doesn't contain the given string

String.padStart - `"0".padStart(3, '1')` -> `"110"` takes two arguments. The first is a number which is the new length of the string. The second is the character to pad with. If no character is specified then a space character (' ') is used. It then pads the beginning of the string with the character until it reaches the specified length.

String.padEnd - `"0".padEnd(3, '1')` -> `"011"` takes two arguments. The first is a number which is the new length of the string. The second is the character to pad with. If no character is specified then a space character (' ') is used. It then pads the end of the string with the character until it reaches the specified length.

String.repeat - `"ab_".repeat(3)` -> `"ab_ab_ab_"` copies the string onto itself a given number of times

String.replace - `"caat".replace("a", 'b')` -> `"cbat"` replaces the first instance of a string with a new string. If no replacement string is specified it is replaced with an empty string "". `"caat".replace("a")` -> `"cat:`

String.replaceAll - `"caat".replaceAll("a", 'b')` -> `"cbbt"` functions the same as String.replace except it replaces every instance of the given string with the replacement string. Note: The method only does one scan through the loop so `"abab".replaceAll("a", "ab")` results in `abbabb` rather than an infinite loop.

String.split - `"aa_bb_cc".split("_")` -> `["aa", "bb", "cc"]` splits the string into an array of substrings and returns the array. It splits the string at every instance of a specified character/string and if no parameter is given then an empty string is used resulting in the string being split at each character.

String.toUpperCase - `"abc".toUpperCase()` -> `"ABC"` converts each character in the string to its upper case equivelant

String.toLowerCase - `"ABC".toLowerCase()` -> `"abc"` converts each character in the string to its lower case equivelant

String.trim - `"   abc   ".trim()` -> `"abc"` removes all whitespace characters from both ends of the string

String.trimStart - `"   abc   ".trimStart()` -> `"abc   "` removes all whitespace characters from the start of the string

String.trimEnd - `"   abc   ".trimEnd()` -> `"   abc"` removes all whitespace characters from the end of the string

String.equals - `new String("abc").equals(new String("abc"))` -> `true` returns whether or not all the characters in the original and given string/String are identical

### String static methods
String.fromCharCode - `String.fromCharCode(65)` -> `"A"` converts an ASCII value into a string if the argument is a number. If the argument given is an array then it goes through the array converting each item to a string and then joins the result. `String.fromCharCode([65, 66, 67])` -> `"ABC"`

### creating chars/strings/Strings
Single quotes ('') are used for creating a char not a string. Putting more than one character between two single quotes is a syntax error. Also chars do not have any methods as they are a primitive data type. For many functions and operations if you try using a char as a string then JITLang will automatically convert the char into a string. Double Quotes ("") are used for creating a primitive string. To get an Object String you need to use the String constructor. Backticks are used to declare template literals. Template literals are strings, but they have special behavior at declaration time allowing them to have multiple lines and interpolate data. Data is interpolated by escaping the string with `${value}` and you can insert a value or identifier between the curly braces.

```
char c = 'a'; // this is not a string
string s = "a"; // this is a primitive string
String s = new String("a"); // this is an object string
let b = "TEST";
string s = `this
is a ${b}
multi-line string!`; // "this\nis a TEST\nmulti-line string!"
```

### escaping in strings
You can escape characters in a string by placing a backslash (\) behind it. Escaping can be used to have quotes or backticks inside of a string without closing it.
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
If you want to have backslashes in your string you need to escape the backslash
```
// prints out a single backslash becuase the first one escapes the second one
println("\\");
```
Other special escape sequences are for representing non-ASCII characters in a string. You can use hexadecimal or unicode escape sequences. Hexadecimal escape sequences start with "\x" which is followed with exactly 2 hexadecimal characters. If the hexidecimal for your character is only one character long it must be padded with a leading 0. Unicode escape sequences start with "\u" which is followed with exactly 4 hexadecimal characters. If the hexidecimal for your character is less than 4 characters long it must be padded with leading zeros. The hexidecimal characters in the escape sequence are case insensitive ("A" and "a" are the same).
```
"\xA9" // ©
"\u00A9 // ©
```

### arithmetic operators
`+` add two numbers or concatenate strings
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
`==` equality operator (checks if two values are strictly equal)
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
`[val]` The bracket operator is used to access arrays `arr[number]` (see Arrays section). It is also can be used to access properties of an object `obj[string]`. It is also used to create arrays `type[] = new int[](number);`
`.val` The dot operator is used to access properties of an object `obj.prop`
`<type>` casting operator explicitly casts a value to a new type
