---
layout: post
author: Julio
date: 05-05-2024
title: An (Offensive) Introduction To C Pointers
---

<img src="/assets/images/my_pointers.png" width=500 class="center">

# An (Offensive) Introduction To C Pointers

## Introduction

<p>What is a pointer? It is a question that lived rent-free in my head for a long time. It was simply too hard for me to understand what the hell a pointer was. Not only that, most people I talked to - programmers and security folks alike - tried to avoid this question and told me that pointers were incomprehensible. After reading <a href="https://beej.us/guide/bgc/">Beej's Guide To C Programming</a> (please read it), I realized that this couldn't be further from the truth.</p>
<p>Okay, so... What the hell is a pointer? Well, a pointer is a reference to an address in memory. Yeah, I know, it's still complicated. Let's break it down a little further.</p>

## Using Pointers

<p>Take the following code as an example:</p>

```c
#include <stdio.h>

int main (void) {
    int my_number;

    my_number = 10;

    printf("%d", my_number);
}
```

<p>Here, we are defining an <custom-code>int</custom-code> called <custom-code>my_number</custom-code>. Then, we assign <custom-code>10</custom-code> to <custom-code>my_number</custom-code>. This value will have to be stored somewhere in memory, and this location will receive an address - which is usually a random number. We can call it an address in memory, a location in memory, a reference, call it whatever makes it easier for you to understand it.</p>
<p>To retrieve a variable's address (and value) from memory, we can use a pointer. In short, a pointer is something that points to the address of a variable. Let's take a look at this in practice:</p>

```c
#include <stdio.h>

int main (void) {
    int my_number;
    int *pointer; // We can also write int* pointer. It is the same thing.

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

<p>Let's break it down a little bit better:</p>
<ul>
<li><custom-code>int *pointer;</custom-code> is how we define a pointer to an integer. We could also have written it as <custom-code>int* pointer;</custom-code> as it is the same thing.</li>
<li><custom-code>&my_number;</custom-code> is the address that we want to store in a pointer. You can read it as "adress of". The whole line is something like "pointer is the address of my_number".</li>
<li><custom-code>pointer</custom-code> in the <custom-code>printf()</custom-code> will print out the address of <custom-code>my_number</custom-code> in hexadecimal.</li>
<li><custom-code>*pointer</custom-code> in the <custom-code>printf()</custom-code> function is how we de-reference it and access the value stored at that address. More on that soon, but know that the asterisk here is different from when we are creating a pointer.</li>
</ul>

## De-referencing

<p>I've just mentioned that we can de-reference a pointer. This means, in short, that we can access the value stored in the address that the pointer holds. This is why when we pass <custom-code>pointer</custom-code> to a function that prints out its value we get the address in hexadecimal and when we pass <custom-code>*pointer</custom-code> (with an asterisk) we get the value.</p>
<p>In the latter, we are de-referencing the pointer. We are basically telling the pointer "hey, tell me what value is stored inside the address you have".</p>
<p>We can also use de-referencing to change the values that are stored in the address held by the pointer. Let's see an example:</p>

```c
#include <stdio.h>

int main (void) {
    int my_number;
    int* pointer;

    my_number = 10;
    pointer = &my_number;

    printf("The value of my_number using pointers is: %d\n", *pointer);

    *pointer = 11; // Here we are using the pointer to change the value of my_number. We are doing so by de-referencing it.

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

    printf("We can print use a pointer to print:\n- An int: %d\n- A float: %f\n- A string: %s\n- A char: %c\n", *n_pointer, *f_pointer, *s_pointer, *c_pointer);
}
```

The output of the above code should be:

```
./myprogram
We can use a pointer to print:
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

<p>The problem is that we cannot de-reference a void pointer. Well, at least not without having it converted (i.e. typecasted) first. So, if we want to access the value that a void pointer stores we would need to define its type before de-referencing it. For example:</p>

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
    int *pointer = malloc(1); // We allocated 1 byte of memory: 00000000

    *pointer = 42; // We stored 42 and memory may look like this now: 00101010

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

<p>So far we have talked about pointers that point to a specific data type and pointers that can handle any data types (void pointers). However, we can also have pointers that will point to functions - these are called "function pointers".</p>
<p>These can be really tricky to understand and its practical application may be a bit confusing as well, so let's try to break it down and go over each piece</p>
<p>Take the following code as an example:</p>

```c
#include <stdio.h>

void my_function (int num1, int num2) {
    printf("This function takes two numbers: %d and %d\n", num1, num2);
}

int main (void) {
    void (*p_function)(int, int);
    p_function = &my_function;

    (*p_function)(10, 20);

    return 0;
}
```

<p>Here, we are creating a function called <custom-code>my_function</custom-code> that takes two <custom-code>int</custom-code> values. Then, inside the main function, we create a pointer to a function with <custom-code>void (*p_function)(int, int);</custom-code> (the syntax needs to have parenthesis because if it doesn't we would be just creating a normal function).</p>
<p>We point the function pointer to the address of <custom-code>my_function</custom-code> with <custom-code>p_function = &my_function;</custom-code>. Lastly, we call <custom-code>my_function</custom-code> using the function pointer with <custom-code>(*p_function)(10, 20);</custom-code></p>
<p>The output should be:</p>

```
./myprogram
This function takes two numbers: 10 and 20
```

<p>So, you may be wondering: "ok, what about function pointers in the wild?". Well, an example of a function pointer in use is in the <custom-code>qsort()</custom-code> function (which is part of <custom-code>stdlib.h</custom-code>).</p>
<p>This function sorts an array and it takes a function pointer to define how exactly it is going to sort it - that is, we can kind of customize if it is going to sort the array in an ascending or descending order.</p>

```c
#include <stdio.h>
#include <stdlib.h>

int values[] = { 20, 30, 10, 60, 40, 50 };

int compare_ints (const void *a, const void *b) {
    int i = *((int *)a);
    int j = *((int *)b);

    if (i > j) {
        return 1;
    }

    if (i < j) {
        return -1;
    }

    return 0;

}

int main (void) {
    int i;
    size_t n_of_elems = sizeof(values) / sizeof(int);

    qsort((void *)values, n_of_elems, sizeof(int), compare_ints);

    for (i = 0; i < n_of_elems; i++) {
        printf("%d ", values[i]);
    }
}
```

The output should be:

```
./myprogram
10 20 30 40 50 60
```

## Pointers In Offensive Security

<p>This article is called "An (Offensive) Introduction To C Pointers" for a reason. The very first time I saw a pointer being used in actual code was during a malware development course - shout out to <a href="https://maldevacademy.com/">MalDevAcademy</a>.</p>
<p>I could not understand why pointers were chosen for specific parts of the code presented by the modules and I could not understand how exactly they were being used. It is true that, at the time, I really lacked C knowledge and was much more of a Python guy.</p>

## Payload Encryption

<p>Malware, more often than not, will need a way to encrypt payloads. They will generally use encryption and decryption functions to do so. The code we will discuss below is an adapted version of an RC4 encryption payload that is taught in <a href="https://maldevacademy.com/">MalDevAcademy</a>'s malware development course. You should definitely check it out as it is one of the best - if not the best - malware development course out there.</p>

```c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

typedef struct
{
	unsigned int i;
	unsigned int j;
	unsigned char s[256];

} RContext;

unsigned char crypt_key[] = {
	0x6D, 0x61, 0x6C, 0x64, 0x65, 0x76, 0x31, 0x32, 0x33
};

unsigned char shell_code[] = "This is not shellcode. Just a string, but it works with shellcode too.";


void RInit(RContext* Ctx, const unsigned char* crypt_key, size_t length)
{
	unsigned int i;
	unsigned int j;
	unsigned char tmp;

	if (Ctx == NULL || crypt_key == NULL)
		printf("%s\n", "We have a problem");

	Ctx->i = 0;
	Ctx->j = 0;

	for (i = 0; i < 256; i++)
	{
		Ctx->s[i] = i;
	}

	for (i = 0, j = 0; i < 256; i++)
	{

		j = (j + Ctx->s[i] + crypt_key[i % length]) % 256;

		tmp = Ctx->s[i];
		Ctx->s[i] = Ctx->s[j];
		Ctx->s[j] = tmp;
	}

}


void RCipher(RContext* Ctx, const unsigned char* input, unsigned char* output, size_t length) {
	unsigned char tmp;

	unsigned int i = Ctx->i;
	unsigned int j = Ctx->j;
	unsigned char* s = Ctx->s;

	while (length > 0)
	{
		i = (i + 1) % 256;
		j = (j + s[i]) % 256;

		tmp = s[i];
		s[i] = s[j];
		s[j] = tmp;

		if (input != NULL && output != NULL)
		{

			*output = *input ^ s[(s[i] + s[j]) % 256];

			input++;
			output++;
		}

		length--;
	}

	Ctx->i = i;
	Ctx->j = j;
}

int main() {

	RContext Ctx = { 0 };
	RInit(&Ctx, crypt_key, sizeof(crypt_key));

	// Encryption
	unsigned char* Ciphertext = (unsigned char*)calloc(strlen(shell_code), sizeof(int));
	RCipher(&Ctx, shell_code, Ciphertext, strlen(shell_code));
	printf("[i] Address of Ciphertext: %p \n", Ciphertext);

	printf("[i] Ciphertext: ");
	int i;
    for (int i = 0; i < strlen(shell_code); i++) {
        printf("%02x", Ciphertext[i]);
    }
    printf("\n");

	RInit(&Ctx, crypt_key, sizeof(crypt_key));

	// Decryption
	unsigned char* PlainText = (unsigned char*)calloc(strlen(shell_code), sizeof(int));
	RCipher(&Ctx, Ciphertext, PlainText, strlen(shell_code));

	printf("[i] PlainText: \"%s\" \n", (char*)PlainText);

	free(Ciphertext);
	free(PlainText);
	return 0;

}
```

<p>The expected output should be:</p>

```
./RC4_Encrypt
[i] Address of Ciphertext: 0x13ee04570
[i] Ciphertext: 19954c5095b60c82c627807ff6013daacd814ab3d9c49b7fc116c0dbc60a2e17bfd620a18cf70b99768201a7623e5e7bdfaab5d4cf4f30cac4271a025059530391e6f2493288
[i] PlainText: "This is not shellcode. Just a string, but it works with shellcode too."

```

<p>Yes, I know. This is very long code and may have some concepts you've never seen before or aren't comfortable with. We'll try to break down the code as much as we can. After all, the idea here is to try to get you to understand what pointers are and to give you a taste of offensive security with malware development.</p>

## Shellcode Injection

## References

<a href="https://beej.us/guide/bgc/">https://beej.us/guide/bgc/</a><br>
<a href="https://maldevacademy.com/">https://maldevacademy.com/</a>
