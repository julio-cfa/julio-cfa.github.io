---
layout: default
---

# An (Offensive) Introduction To C Pointers

## Introduction

<p>What is a pointer? Well, this is a question that lived rent-free in my head for a long time. It was just too hard for me to understand what the hell a pointer was. Not only that, everyone I talked to - programmers and security folks - about it would try to avoid this question and tell me that pointers were incomprehensible. After reading <a href="https://beej.us/guide/bgc/">Beej's Guide To C Programming</a> I understood that that couldn't be farther from the truth.</p>
<p>Ok, so... What the hell is a pointer then? Well, a pointer is a reference to an address in memory. Yeah, I know, that's still a bit complicated. Let's break it down a bit more.</p>

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

    printf("The address of my_number is %p\n", pointer);
    printf("The value of my_number using pointers is %d\n", *pointer);
}
```

<p>We can compile this code with <custom-code>gcc myprogram.c -o myprogram</custom-code> and execute it with <custom-code>./myprogram</custom-code>. The output should be something like:</p>

```
./myprogram
The address of my_number is 0x16d82721c
The value of my_number using pointers is 10
```

<p>A few things to consider here:</p>
<ol>
<li><custom-code>int *pointer</custom-code> is how we define a pointer to an integer. We could also have written it as <custom-code>int* pointer</custom-code>. It is pretty much the same thing.</li>
</ol>
