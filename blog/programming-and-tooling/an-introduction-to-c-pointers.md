---
layout: default
---

# An (Offensive) Introduction To C Pointers

## Introduction

What is a pointer? Well, this is a question that lived rent-free in my head for a long time. It was just too hard for me to understand what the hell a pointer was. Not only that, everyone I talked to - programmers and security folks - about it would try to avoid this question and tell me that pointers were incomprehensible. After reading <a href="https://beej.us/guide/bgc/">Beej's Guide To C Programming</a> I understood that that couldn't be farther from the truth.<br>
Ok, so... What the hell is a pointer then? Well, a pointer is a reference to an address in memory. Yeah, I know, that's still a bit complicated. Let's break it down a bit more.<br>

```c
#include <stdio.h>

int main (void) {
    int my_number;

    my_number = 10;

    printf("%d", my_number);
}
```

Here, we are defining an `int` called `my_number`. Then, we assign `10` to `my_number`. This value will have to be stored somewhere in memory and that place will receive an address - which is generally a random number. We can call it an address in memory, a location in memory, a reference, call it whatever makes it easier for you to understand it.<br>
To retrieve the address of a variable (and its value) in memory, we can use something call a pointer. It is something that points to the address of a variable. Let's see it in practice:<br>

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

We can compile this code with `gcc myprogram.c -o myprogram` and execute it with `./myprogram`. The output should be something like:<br>

```
./myprogram
The address of my_number is 0x16d82721c
The value of my_number using pointers is 10
```
