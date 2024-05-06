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

<p>Judging my the scenario description, we are dealing with a memory dump. We can use a tool called "Volatility" to interact with it. Assuming the memory dump was taken from a Windows machine, we can run the following command to get more information on the system:</p>

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

## When was the memory dump created?

<p>The previous command also answers this one. The dump time is the system time. The right answer is <custom-code>2022-12-19 16:07:30</custom-code>.</p>
