---
layout: default
---

# An (Offensive) Introduction To C Pointers

## Introduction

<p>What is a pointer? Well, this is a question that lived rent-free in my head for a long time. It was just too hard for me to understand what the hell a pointer was. Not only that, everyone I talked to - programmers and security folks - about it would try to avoid this question and tell me that pointers were incomprehensible. After reading <a href="https://beej.us/guide/bgc/">Beej's Guide To C Programming</a> I understood that that couldn't be farther from the truth.</p>
<p>Ok, so... What the hell is a pointer then? Well, a pointer is a reference to an address in memory. Yeah, I know, that's still a bit complicated. Let's break it down a bit more.</p>

## Using Pointers

<p>Let's take a look at the following code:</p>

```c
#include <stdio.h>

int main (void) {
    int my_number;

    my_number = 10;

    printf("%d", my_number);
}
```

<p>Here, we are defining an <custom-code>int</custom-code> called <custom-code>my_number</custom-code>. Then, we assign <custom-code>10</custom-code> to <custom-code>my_number</custom-code>. This value will have to be stored somewhere in memory and that place will receive an address - which is generally a random number. We can call it an address in memory, a location in memory, a reference, call it whatever makes it easier for you to understand it.</p>
<p>To retrieve the address of a variable (and its value) in memory, we can use something call a pointer. It is something that points to the address of a variable. Let's see it in practice:</p>

```c
#include <stdio.h>

int main (void) {
    int my_number;
    int *pointer;

    my_number = 10;
    pointer = &my_number;

    printf("The address of my_number is: %p\n", pointer);
    printf("The value of my_number using pointers is: %d\n", *pointer);
}
```

<p>We can compile this code with <custom-code>gcc myprogram.c -o myprogram</custom-code> and execute it with <custom-code>./myprogram</custom-code>. The output should be something like:</p>

```
./myprogram
The address of my_number is: 0x16d82721c
The value of my_number using pointers is: 10
```

<p>A few things to consider here:</p>
<ul>
<li><custom-code>int *pointer;</custom-code> is how we define a pointer to an integer. We could also have written it as <custom-code>int* pointer;</custom-code>. It is pretty much the same thing.</li>
<li><custom-code>&my_number;</custom-code> is how we indicate what is the address that we want to store in a pointer. You can read it as "adress of". The whole thing is something like "pointer is the address of my_number".</li>
<li><custom-code>pointer</custom-code> in the <custom-code>printf()</custom-code> will print out the address of <custom-code>my_number</custom-code> in hexadecimal.</li>
<li><custom-code>*pointer</custom-code> in the <custom-code>printf()</custom-code> function is how we de-reference it and access the actual value. More on that soon, but know that the asterisk here is different from when we are creating a pointer.</li>
</ul>

## De-referencing

<p>So, I've just mentioned that we can de-reference a pointer. Well, that means, in short, that we can access the value stored in the address that the pointer holds and not the address itself. That's why when we pass <custom-code>pointer</custom-code> to a function that prints out its value we get the address in hexadecimal and when we pass <custom-code>*pointer</custom-code> (with an asterisk) we get the value. In the latter, we are de-referencing. We are basically telling the pointer "hey, tell me what value is stored inside the address you have".</p>
<p>We can also use this to change values the values that are stored in the address of the pointer. Let's see an example:</p>

```c
#include <stdio.h>

int main (void) {
    int my_number;
    int* pointer;

    my_number = 10;
    pointer = &my_number;

    printf("The value of my_number using pointers is: %d\n", *pointer);

    *pointer = 11; // here we are using the pointer to change the value of my_number...

    printf("The value of my_number using pointers is now: %d\n", *pointer);
    printf("And we can confirm that my_number is now also: %d\n", my_number);
}
```

<p>This should generate the following output:</p>

```
./myprogram
The value of my_number using pointers is: 10
The value of my_number using pointers is now: 11
And we can confirm that my_number is now also: 11
```

## Void Pointers

<p>So, we can have pointers of different data types. For example:</p>

```c
#include <stdio.h>

int main (void) {
    int my_number = 10;
    float my_float = 3.14;
    char* my_string = "Hello World";
    char my_char = 'A';

    int *n_pointer = &my_number;
    float *f_pointer = &my_float;
    char* *s_pointer = &my_string;
    char *c_pointer = &my_char;

    printf("We can print:\n- An int: %d\n- A float: %f\n- A string: %s\n- A char: %c\n", *n_pointer, *f_pointer, *s_pointer, *c_pointer);
}
```

The output of the above code should be:

```
./myprogram
We can print:
- An int: 10
- A float: 3.140000
- A string: Hello World
- A char: A
```

<p>A void pointer, on the other hand, is a pointer that has no data type defined. No data type associated with it. That means that a void pointer can hold the address of any data type and it can also be typecasted (read converted) to any data type. Let's see an example:</p>

```c
#include <stdio.h>

int main (void) {
    int my_number = 10;
    char* my_string = "Hello World";

    void *pointer;

    pointer = &my_number;
    printf("Pointer holds the address of my_number, which is: %p\n", pointer);

    pointer = &my_string;
    printf("Now pointer holds the address of my_string, which is %p\n", pointer);
}
```

<p>This should have the following output:</p>

```
./myprogram
Pointer holds the address of my_number, which is: 0x16bb2b21c
Now pointer holds the address of my_string, which is 0x16bb2b210
```

<p>The problem is that we cannot de-reference a void pointer. Well, at least not without having it converted (i.e. typecasted) first. So, if we want to access the value that a void pointer stores we would need to define its type before. For example:</p>

```c
#include <stdio.h>

int main (void) {
    int my_number;
    void *pointer;

    my_number = 10;
    pointer = &my_number;

    printf("%d\n", *(int*)pointer); // We are converting the void pointer to an int pointer with (int*) - this will be executed before. Then, *pointer will be executed and de-referenced.
}
```

<p>This should output:</p>

```
./myprogram
10
```

## Voids Pointers And Malloc

<p>So, we kind of understood what void pointers are. But what is a practical application of such pointers? Well, a very common is when we are using the <custom-code>malloc()</custom-code> function.</p>
<p>This is the definition of the function: <custom-code>void *malloc(size_t size);</custom-code>. As seen, the function takes <custom-code>size_t</custom-code> (which is basically an integer) to know how many bytes of memory it needs to allocate.</p>
<p>This function returns a void pointer and we can then assign (or convert) this returned void pointer to a different data type and store data in it. It may get easier to understand with an example:</p>

```c
#include <stdio.h>
#include <stdlib.h>

int main(void) {
    int *pointer = malloc(2); // We allocate 2 bytes of memory: 00000000 00000000

    *pointer = 42; // We stored 42 and memory now looks like this: 00000000 00101010

    printf("The address allocated is %p and the value stored is %d\n", pointer, *pointer);

    free(pointer);
}
```

<p>This should output:</p>

```
./myprogram
The address allocated is 0x60000391c020 and the value stored is 42
```

<p>What we did here, in short, was assign the void pointer that was returned to an integer pointer - which automatically converted/typecasted it. We could have done the same thing with a string pointer, char pointer, float pointer, and so forth.</p>
<p>A void pointer, in this case, is very useful because there we do not know what kind of data someone will store. If void pointers did not exist, we would need several functions like <custom-code>int *malloc_int(size_t size);</custom-code>, <custom-code>float *malloc_float(size_t size);</custom-code>, and so on.</p>

## Function Pointers

## Pointers In Offensive Security

<p>This article is called "An (Offensive) Introduction To C Pointers" for a reason.</p>
