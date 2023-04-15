# JITLang
A Just In Time compiled language that aims to be JavaScript the way JavaScript should have been designed.
The language combines features from lower level languages and higher level languages together to get a hybrid language.

## Notes:
  - The language is FAR from being complete. It's just barely a usable language at the moment.
  - The language is theoretically capabable of being faster than JavaScript, however at the moment my runtime is about 10,000x slower.
  - I implemented it's runtime in JavaScript which happens to be very very slow, but in the future I will rewrite VexScript's runtime in C++ which should make it much more performant.

## Purpose
To be a language that combines the high-level features and syntax of JavaScript with lower-level features from Java and C++. The language is meant to allow the programmer flexible and concise code while maintaining simplicity and fast execution speed. While JavaScript forces you to write unoptimizable code that is easy to understand and C++ forces you to write dangerously complex code that is highly optimizable, JIT-Lang lets you write performant code where it matters and simple code where convenient. JitLang is designed to be JavaScript the way JavaScript should have been designed. It gets rid of the stupid features of JavaScript that nobody uses. For example in JavaScript Object plus Array equals Number, and Array plus Number equals String which makes complete logical sense (love this video https://www.destroyallsoftware.com/talks/wat). JavaScript also has a lot of ambiguous syntax that JitLang does away with. It is superior to Java because “I love being forced to type out ‘class Main { public static void main(String[] args) {} }’ every time I want to start a program said no programmer ever” (Also highly recommend https://www.youtube.com/watch?v=m4-HM_sCvtQ). OOP is great and all, but making literally everything its own class is going too far. In C++, the specification for the language is vague so don’t know if the int you are using is 4 bytes or 2 bytes. JitLang adds features from C++ that neither JS nor Java supports such as multiple inheritance and operator overloading which are incredibly helpful for writing concise and understandable code.

## Execution
JitLang source code are stored as “.jitl” files synonymous with “.java” files. Source code files are then compiled to JitLang bytecode/syntax tree files stored as “.jitt” which are the equivalent to Java’s “.class” files. The “.jitt” files are then run in the JitLang VM. JitLang source code can be compiled to native executables for ease of distribution. However, compiling to a native executable may result in a large file size if the JitLang compiler needs to bundle the JitLang Virtual Machine into the executable.

## Special Words
### Keywords
let, const, if, else, do, while, for, struct, class, private, static, super, extends, inherit, enum, try, catch, throw, return, switch, case, default, break, continue, func, new, this, true, false, Infinity, import, export, from, as
### Built in data types
bool, byte, short, char, int, uint, long, ulong, float, double, void, null, string, vec, BigInt
Object, Array, Function

## Primitive Data Types
Primitive data types are passed by value rather than by reference.
**bool** A boolean value storing either `true` or `false`  
**byte** - An unsigned 8-bit integer  
**short** - A signed 16-bit integer  
**char** - An unsigned 16-bit integer that can store a Unicode character  
**int** - A signed 32-bit integer  
**uint** - An unsigned 32-bit integer  
**long** - A signed 64-bit integer  
**ulong** - An unsigned 64-bit integer  
**float** - A signed 32-bit floating point number  
**double** - A signed 64-bit floating point number  
**void** - A special primitive data type that is a placeholder for nothing.  
**null** - Similar to void, null is a special primitive data type that points to nothing. Object and Array variables that are undefined point to null.  
**string** - A special type of array of characters. Despite actually being an object, strings are treated like primitives.  
**vec** - A vector that can hold 2, 3, or 4 values  
**BigInt** - Capable of holding signed integers of arbitrarily large size  

## Non-primitive Data Types
Non-primitive data types are passed by reference rather than value
**Object** - The root class of all other classes and objects  
**Array** - A special type of object where each key is an integer that can be read/write using the [] operator  
**Function** - Functions are objects so that they can be treated like first class functions and be passed around by reference  

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
You can use `let` rather than a specific type. The compiler/runtime will then automatically detect the variable’s data type. If the variable is left uninitialized it will hold the value of `void` until assigned a value. Re-declaring a variable that has already been declared in the same scope will throw a syntax error. If the variable is to be a constant you can use the `const` modifier before its type ex: `const int a = 1;`. If the variable is being declared with modifiers (const, private, static, export) and the variable type is unspecified then you can leave out the `let` ex:
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

Important rules to note is that false and 0 get cast to each other, true and 1 get cast to each other.
JITLangs implicit casting rules are pretty common sense.
You can also use explicit casts. Both a Java-like syntax and a functional syntax for casting are allowed.
```
int foo = (long) bar;
```
Or you can also use functional syntax
```
int foo = long(bar);
```

## Classes
Classes are created in the following format
```
class Animal {
	int age = 0; // variable declarations
	private name; // private variables
	static needsOxygen = true; // static makes a property/method belong to the class rather than an instance of the class
	Animal(string n) { // constructor
		name = n; // define object properties
		getName(); // call methods
		this.getName(); // properties/methods can also be accessed using the `this` keyword
	}
	string getName() { // methods
		return this.name;
	}
}
```
Multiple inheritance is supported. If a class has two parent classes with the same property/method it will inherit from the last parent. When creating properties without a type in a class the `let` is excluded.
```
class LandAnimal {
	thing = 1;
	LandAnimal() {}
	move() { println(“Walk”); }
}
class WaterAnimal {
	thing = 2;
	WaterAnimal() {}
	move() { println(“Swim”); }
}
```
```
class Platypus extends LandAnimal, WaterAnimal {
	Platypus() {}
}
new Platypus().move(); // prints “Swim” because WaterAnimal is the last class Platypus is extended from
new Platypus().thing // 2
```
Using `inherit … from …` and `inherit … from … as …` you can inherit a property/method from any class resulting in very powerful multi inheritance. This can also be used to overwrite the default behavior of inheriting the property/method from the class at the end of the extends list.
```
class Platypus extends WaterAnimal, LandAnimal {
	Platypus() {}
	inherit move from WaterAnimal;
}
new Platypus().move(); // prints “Swim”
```
```
class Platypus extends WaterAnimal, LandAnimal {
	Platypus() {}
	inherit move from LandAnimal as walk;
	inherit move from WaterAnimal as swim;
}
new Platypus().walk(); // prints “Walk”
new Platypus().swim(); // prints “Swim”
new Platypus().thing // 1
```
When inheriting multiple properties from one class you can use a comma separated list
```
class Parent {
	Parent() {}
	a() {}
	b() {}
	c() {}
}
class Child {
	Child () {}
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
	a, b = “bar”, c
}
a // 0
b // “bar”
c // 2
```
Enums can be used in classes
```
class Foo {
	static enum { a, b, c }
	enum { d, e, f }
	Foo() {
		this.d // 
	}
}
Foo.a // 1
Foo.b // 2
Foo.c // 3
```

## Semicolons
Semicolons are completely optional in JitLang. The language’s syntax is specifically designed so that having semi-colons versus not having them makes no difference to the meaning of the code.

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

// Object can store any type of object including arrays
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
To access an item in an array use `arr[index]` (eg: arr[0]). This same syntax is used when writing to an index in an array `arr[index] = 0;`. Indices start at zero. Accessing an index that is less than 0 or greater than the length of the array will throw a reference error. To access the length of the array use `arr.length` which returns the number of items in the array. If you need to grow or shrink the array use `arr.size(newLength);` method which will resize the array to the specified size. If the array is shrunk all the clipped off data is lost. If grown the array’s added indices will follow the pattern specified at the arrays initilization. To take a slice of an array you can use the slice method `arr.slice(0, 10)` or use the bracket notation` arr[0:10]`. If the first number is unspecified (eg: `arr[:10]`) then it is 0, if the second number is unspecified (eg: `arr.slice(0)` or `arr[0:]`) then it is the length of the array. If no parameters are specified (eg: `arr[:]` or `arr.slice()`) then it shallow clones the entire array. If you do not have a colon inside of the bracket notation like so `arr[]` then it is a syntax error.

Other array methods:
Array.push - `arr.push(123)` is functionally equivelant to `arr.grow(arr.length+1); arr[arr.length-1] = 123;`. You can also push multiple elements at the same time `arr.push(123, 456)`

Array.pop - `arr.pop(0)` removes an item from an array at a specified index. The following elements are then shifted left to take its place and any remaining places are set to null. Multiple items can be popped from an array at the same time `arr.pop(0, 1, 2)`

Array.includes - `arr.includes(123)` returns a true or false depending on whether the array includes the given item

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
Functions are declared using the following syntaxes.
```
// function expression
let f = func() {}

// function declaration
func f() {}

// arrow function expression
let f = A => B

// arrow function expression with parenthesis and brackets
let f = (A, B) => {}

// typed functions
let f = int() {} // auto detect
Function f = int() {} // explicit
let f = int A => B
let f = int (A) => {B}
```
Function declarations are hoisted while function expressions are not. Arrow functions are simply shorthand for function expressions. Methods are a special type of function that only exist as properites of a class. They are different because they have a `this` keyword available to them that refers to the object the method is being called on. Normal functions do not have the `this` keyword.

