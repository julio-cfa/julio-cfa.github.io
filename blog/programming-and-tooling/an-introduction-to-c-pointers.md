---
layout: default
---

# An (Offensive) Introduction To C Pointers

## Introduction

<p>What is a pointer? Well, this is a question that lived rent-free in my head for a long time. It was just too hard for me to understand what the hell a pointer was. Not only that, everyone I talked to - programmers and security folks - about it would try to avoid this question and tell me that pointers were incomprehensible. After reading <a href="https://beej.us/guide/bgc/">Beej's Guide To C Programming</a> I understood that that couldn't be farther from the truth.</p>
<p>Ok, so... What the hell is a pointer then? Well, a pointer is a reference to an address in memory. Yeah, I know, that's still a bit complicated. Let's break it down a bit more.</p>

## Pointers

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

<p>So, I just mention that we can de-reference a pointer. Well, that means, in short, that we will access the value stored in the address that the pointer holds and not the address itself. That's why when we pass <custom-code>pointer</custom-code> to a function that prints out its value we get the address in hexadecimal and when we pass <custom-code>*pointer</custom-code> we get the value. We are basically telling the pointer "hey, tell me what value is inside your address".</p>
<p>We can also use this to change values the values that are stored in the address of the pointer. Let's see an example:</p>

```c
#include <stdio.h>

int main (void) {
    int my_number;
    int* pointer;

    my_number = 10;
    pointer = &my_number;

    printf("The value of my_number using pointers is: %d\n", *pointer);

    *pointer = 11;

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

## Function Pointers

```

```
