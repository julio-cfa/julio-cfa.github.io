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
    int my_number = 10;
    printf("%d", my_number);
}
```
