---
author: Julio
date: 2024-05-05
title: An (Offensive) Introduction To C Pointers
---

<div class="center"><img src="/assets/images/my_pointers.png" width="450" alt="C Pointers"></div>

# An (Offensive) Introduction To C Pointers

## Introduction

What is a pointer? It is a question that lived rent-free in my head for a long time. It was simply too hard for me to understand what the hell a pointer was. Not only that, most people I talked to - programmers and security folks alike - tried to avoid this question and told me that pointers were incomprehensible. After reading <a href="https://beej.us/guide/bgc/">Beej's Guide To C Programming</a> (please read it), I realized that this couldn't be further from the truth.

Okay, so... What the hell is a pointer? Well, a pointer is a reference to an address in memory. Yeah, I know, it's still complicated. Let's break it down a little further.

## Using Pointers

Take the following code as an example:

```c
#include <stdio.h>

int main (void) {
    int my_number;

    my_number = 10;

    printf("%d", my_number);
}
```

Here, we are defining an `int` called `my_number`. Then, we assign `10` to `my_number`. This value has to live somewhere in memory, and that location has an address. The exact address is decided by the program at runtime, so it will vary from execution to execution.

To store a variable's address and then access the value at that address, we can use a pointer. In short, a pointer is a variable whose value is a memory address. Let's take a look at this in practice:

```c
#include <stdio.h>

int main (void) {
    int my_number;
    int *pointer; // We can also write int* pointer. It is the same thing.

    my_number = 10;
    pointer = &my_number;

    printf("The address of my_number is: %p\n", (void *)pointer);
    printf("The value of my_number using pointers is: %d\n", *pointer);
}
```

We can compile this code with `gcc myprogram.c -o myprogram` and execute it with `./myprogram`. The output should be something like:

```
./myprogram
The address of my_number is: 0x16d82721c // this value may vary
The value of my_number using pointers is: 10
```

Let's break it down a little bit better:

- `int *pointer;` is how we define a pointer to an integer. We could also have written it as `int* pointer;` as it is the same thing.
- `&my_number` is the address that we want to store in a pointer. You can read it as "address of". The whole line is something like "pointer gets the address of my_number".
- `pointer` in the `printf()` prints the address of `my_number` in hexadecimal form.
- `*pointer` in the `printf()` function is how we dereference it and access the value stored at that address. More on that soon, but know that the asterisk here is different from when we are creating a pointer.

## Dereferencing

I've just mentioned that we can dereference a pointer. This means, in short, that we can access the value stored at the address that the pointer holds. This is why when we pass `pointer` to something that prints its value we get an address in hexadecimal, and when we pass `*pointer` we get the value stored there.

In the latter case, we are dereferencing the pointer. We are basically telling it: "show me the value stored at the address you contain".

We can also use dereferencing to change the value stored at the address held by the pointer. Let's see an example:

```c
#include <stdio.h>

int main (void) {
    int my_number;
    int* pointer;

    my_number = 10;
    pointer = &my_number;

    printf("The value of my_number using pointers is: %d\n", *pointer);

    *pointer = 11; // Here we are using the pointer to change the value of my_number. We are doing so by dereferencing it.

    printf("The value of my_number using pointers is now: %d\n", *pointer);
    printf("And we can confirm that my_number is now also: %d\n", my_number);
}
```

This should generate the following output:

```
./myprogram
The value of my_number using pointers is: 10
The value of my_number using pointers is now: 11
And we can confirm that my_number is now also: 11
```

## Void Pointers

So, we can have pointers of different data types. For example:

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

    printf("We can use a pointer to print:\n- An int: %d\n- A float: %f\n- A string: %s\n- A char: %c\n", *n_pointer, *f_pointer, *s_pointer, *c_pointer);
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

A void pointer, on the other hand, is a pointer type with no specific pointee type attached to it. That means a `void *` can hold the address of any object type, and then be typecasted (read: converted) back to the correct pointer type before dereferencing. Let's see an example:

```c
#include <stdio.h>

int main (void) {
    int my_number = 10;
    char* my_string = "Hello World";

    void *pointer;

    pointer = &my_number;
    printf("Pointer holds the address of my_number, which is: %p\n", pointer);

    pointer = my_string;
    printf("Now pointer holds the address of the first character of my_string, which is %p\n", pointer);
}
```

This should have the following output:

```
./myprogram
Pointer holds the address of my_number, which is: 0x16bb2b21c
Now pointer holds the address of the first character of my_string, which is 0x16bb2b210
```

The problem is that we cannot dereference a `void *` directly. If we want to access the value at the address it stores, we first need to convert it to the correct pointer type. For example:

```c
#include <stdio.h>

int main (void) {
    int my_number;
    void *pointer;

    my_number = 10;
    pointer = &my_number;

    printf("%d\n", *(int*)pointer); // First we convert the void pointer to int*. Then we dereference that int*.
}
```

This should output:

```
./myprogram
10
```

## Void Pointers And Malloc

So, we kind of understood what void pointers are. But what is a practical application of them? A very common one is `malloc()`.

This is the definition of the function: `void *malloc(size_t size);`. The function takes a `size_t` telling it how many bytes of memory it needs to allocate.

This function returns a void pointer, and we can then assign that returned address to a pointer of the correct type and store data there. It gets easier to understand with an example:

```c
#include <stdio.h>
#include <stdlib.h>

int main(void) {
    int *pointer = malloc(sizeof(*pointer)); // Allocate enough bytes for one int.

    if (pointer == NULL) {
        return 1;
    }

    *pointer = 42;

    printf("The address allocated is %p and the value stored is %d\n", (void *)pointer, *pointer);

    free(pointer);
}
```

This should output:

```
./myprogram
The address allocated is 0x60000391c020 and the value stored is 42
```

What we did here, in short, was assign the address returned by `malloc()` to an integer pointer. We could do the same thing with a string pointer, char pointer, float pointer, and so forth, as long as we allocate enough space for the target type.

A void pointer is useful here because `malloc()` should work for any kind of object. If void pointers did not exist, we would need several functions like `int *malloc_int(size_t size);`, `float *malloc_float(size_t size);`, and so on.

## Function Pointers

So far we have talked about pointers that point to a specific data type and pointers that can handle any data types (void pointers). However, we can also have pointers that will point to functions - these are called "function pointers".

These can be really tricky to understand and their practical application may be a bit confusing as well, so let's try to break them down and go over each piece.

Take the following code as an example:

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

Here, we are creating a function called `my_function` that takes two `int` values. Then, inside `main()`, we create a pointer to a function with `void (*p_function)(int, int);`. The parentheses matter: without them, we would be declaring a function, not a pointer to one.

We point the function pointer to `my_function` with `p_function = &my_function;`. Lastly, we call `my_function` using the function pointer with `(*p_function)(10, 20);`.

The output should be:

```
./myprogram
This function takes two numbers: 10 and 20
```

So, you may be wondering: "ok, what about function pointers in the wild?". Well, an example of a function pointer in use is in the `qsort()` function (which is part of `stdlib.h`).

This function sorts an array and it takes a function pointer to define how elements should be compared. In other words, the comparator function tells `qsort()` what "comes before" and what "comes after".

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

This article is called "An (Offensive) Introduction To C Pointers" for a reason. The very first time I saw a pointer being used in actual code was during a malware development course - shout out to <a href="https://maldevacademy.com/">MalDevAcademy</a>.

I could not understand why pointers were chosen for specific parts of the code presented by the modules and I could not understand how exactly they were being used. It is true that, at the time, I really lacked C knowledge and was much more of a Python guy.

## Payload Encryption

Malware, more often than not, will need a way to encrypt payloads. It will generally use encryption and decryption functions to do so. The code we will discuss below is an adapted version of an RC4 encryption routine that is taught in <a href="https://maldevacademy.com/">MalDevAcademy</a>'s malware development course. You should definitely check it out as it is one of the best - if not the best - malware development courses out there.

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

unsigned char shell_code[] = "This is not shellcode. Just a string, but it works with raw bytes too.";

void RInit(RContext* Ctx, const unsigned char* crypt_key, size_t length)
{
	unsigned int i;
	unsigned int j;
	unsigned char tmp;

	if (Ctx == NULL || crypt_key == NULL)
		return;

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

int main(void) {

	RContext Ctx = { 0 };
	RInit(&Ctx, crypt_key, sizeof(crypt_key));

	// Encryption
	size_t shell_code_len = strlen((char *)shell_code);

	unsigned char* Ciphertext = calloc(shell_code_len, sizeof(unsigned char));
	if (Ciphertext == NULL) {
		return 1;
	}

	RCipher(&Ctx, shell_code, Ciphertext, shell_code_len);
	printf("[i] Address of Ciphertext: %p \n", (void *)Ciphertext);

	printf("[i] Ciphertext: ");
	for (size_t i = 0; i < shell_code_len; i++) {
		printf("%02x", Ciphertext[i]);
	}
	printf("\n");

	RInit(&Ctx, crypt_key, sizeof(crypt_key));

	// Decryption
	unsigned char* PlainText = calloc(shell_code_len + 1, sizeof(unsigned char));
	if (PlainText == NULL) {
		free(Ciphertext);
		return 1;
	}

	RCipher(&Ctx, Ciphertext, PlainText, shell_code_len);

	printf("[i] PlainText: \"%s\" \n", (char*)PlainText);

	free(Ciphertext);
	free(PlainText);
	return 0;

}
```

The expected output should be:

```
./RC4_Encrypt
[i] Address of Ciphertext: 0x13ee04570
[i] Ciphertext: 19954c5095b60c82c627807ff6013daacd814ab3d9c49b7fc116c0dbc60a2e17bfd620a18cf70b99768201a7623e5e7bdfaab5d4cf4f30cac4271a025059530391e6f2493288
[i] PlainText: "This is not shellcode. Just a string, but it works with raw bytes too."
```

Yes, I know. This is long code and it may include some concepts you've never seen before or aren't comfortable with. We'll try to break it down as much as we can. After all, the idea here is to get you to understand what pointers are and to give you a taste of offensive security with malware development.

The important pointer-related parts are these:

- `RContext* Ctx` means we are passing the address of the RC4 state structure into the functions. That lets the function work on the original structure instead of a copy.
- `const unsigned char* input` and `unsigned char* output` are pointers to byte buffers. The function walks those buffers one byte at a time with `input++` and `output++`.
- `unsigned char* s = Ctx->s;` creates a pointer to the first byte of the internal RC4 state array so the code can index and mutate it directly.
- `*output = *input ^ ...` dereferences both pointers, reads one byte from the input buffer, transforms it, and writes one byte to the output buffer.

That last point is a good example of why pointers show up everywhere in low-level code. When a function needs to process raw bytes, it is usually easier and faster to pass around addresses and operate on memory directly than to copy everything over and over again.

## Minimal Shellcode Loader

On Windows, basic shellcode loaders commonly rely on two key APIs: `VirtualAlloc()` to reserve and commit a region of executable memory, and `CreateThread()` to begin execution at an address of our choosing.

The core pointer concepts remain straightforward:

- One API returns a pointer to a freshly allocated memory region.
- Another API accepts a pointer to a thread entry-point function, plus an optional pointer-sized argument that gets passed to that function.

This example builds directly on those ideas - but takes the next logical step for a loader: we allocate memory with **executable permissions**, copy machine code (shellcode) into it, and then execute that code by treating the memory address as callable function.

```c
#include <windows.h>
#include <stdio.h>
#include <string.h>

DWORD WINAPI shellcode_thread(LPVOID parameter) {
    unsigned char *buffer = (unsigned char *)parameter;

    printf("Thread received code pointer at %p\n", (void *)buffer);

    printf("About to execute code at %p ...\n", (void *)buffer);

    ((void(*)())buffer)();

    printf("Code execution returned (back in thread)\n");
    return 0;
}

int main(void) {
    const unsigned char shellcode[] = {
        0x48, 0x83, 0xEC, 0x28,                                     // sub rsp, 40                  ; shadow space
        0x48, 0x31, 0xC9,                                           // xor rcx, rcx                 ; hWnd = NULL
        0x48, 0x31, 0xD2,                                           // xor rdx, rdx                 ; lpText = NULL (or set pointer)
        0x4D, 0x31, 0xC0,                                           // xor r8, r8                   ; lpCaption = NULL
        0x4D, 0x31, 0xC9,                                           // xor r9, r9                   ; uType = 0
        // ... (resolve & call MessageBoxA / MessageBoxW – omitted for brevity)
        // Full payloads resolve kernel32/user32 via PEB walking.
        0xC3                                                        // ret                          ; return cleanly
    };

    SIZE_T length = sizeof(shellcode);

    printf("Shellcode size: %zu bytes\n", length);

    // Step 1: Allocate memory that is readable, writable **and executable**
    unsigned char *buffer = (unsigned char *)VirtualAlloc(
        NULL,
        length,
        MEM_RESERVE | MEM_COMMIT,
        PAGE_EXECUTE_READWRITE                  // ← critical: makes the region executable
    );

    if (buffer == NULL) {
        printf("VirtualAlloc failed: %lu\n", GetLastError());
        return 1;
    }

    printf("Allocated RWX memory at %p\n", (void *)buffer);

    // Step 2: Copy the raw machine code into our executable region
    memcpy(buffer, shellcode, length);

    printf("Shellcode copied into memory\n");

    // Step 3: Create a thread whose entry point is our wrapper function,
    //         passing the shellcode address as the parameter.
    HANDLE thread_handle = CreateThread(
        NULL,
        0,
        shellcode_thread,           // wrapper that will call the shellcode
        buffer,                     // argument passed to thread = pointer to shellcode
        0,
        NULL
    );

    if (thread_handle == NULL) {
        printf("CreateThread failed: %lu\n", GetLastError());
        VirtualFree(buffer, 0, MEM_RELEASE);
        return 1;
    }

    printf("Thread created — waiting for shellcode execution to complete...\n");

    WaitForSingleObject(thread_handle, INFINITE);

    CloseHandle(thread_handle);
    VirtualFree(buffer, 0, MEM_RELEASE);

    printf("Cleanup complete.\n");
    return 0;
}
```

In this code, pointers are central to dynamic memory management and execution flow. `VirtualAlloc()` returns a pointer (`buffer`) to the allocated executable region, which is used by `memcpy()` to copy shellcode bytes into it. This same pointer is passed as a parameter to `CreateThread()`, where it's received as `LPVOID` and cast back to `unsigned char *`. Finally, inside the thread, the pointer is reinterpreted as a function pointer (`void(*)()`) and called to execute the shellcode. Pointers enable flexible interpretation of memory addresses - as data buffers, function entry points, or parameters - allowing the code to allocate, populate, and invoke arbitrary instructions at runtime, which is the essence of a shellcode loader.

## Conclusion

Pointers stop feeling mysterious once you reduce them to what they really are: variables that store memory addresses. From there, the rest is practice - learning when to take an address, when to dereference it, and how low-level code uses pointers to move through memory, share state, and call functionality dynamically. If you are interested in exploit development, malware analysis, or systems programming in general, getting comfortable with pointers is not optional; it is one of the core skills that makes the rest of the field much easier to understand.

## References

- <a href="https://beej.us/guide/bgc/">https://beej.us/guide/bgc/</a><br>
- <a href="https://maldevacademy.com/">https://maldevacademy.com/</a>
