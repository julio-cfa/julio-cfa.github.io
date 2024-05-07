---
layout: post
author: Julio
date: 07-05-2024
title: RogueOne Write-Up
---

<div class="center"><img src="https://labs.hackthebox.com/storage/challenges/8b16ebc056e613024c057be590b542eb.png" width="350"></div>

# RogueOne Write-Up

## Introduction

<p>RogueOne is an "Easy" sherlock on HackTheBox. This is the scenario: "Your SIEM system generated multiple alerts in less than a minute, indicating potential C2 communication from Simon Stark's workstation. Despite Simon not noticing anything unusual, the IT team had him share screenshots of his task manager to check for any unusual processes. No suspicious processes were found, yet alerts about C2 communications persisted. The SOC manager then directed the immediate containment of the workstation and a memory dump for analysis. As a memory forensics expert, you are tasked with assisting the SOC team at Forela to investigate and resolve this urgent incident."</p>

<p>We start with a file called <custom-code>RogueOne.zip</custom-code> and when decompressed we get <custom-code>20230810.mem</custom-code>.</p>

## Questions

### 1.

<p>First, we can run the following command to get the tree of processes and redirect the output to a file:</p>

```bash
python3 vol.py -f ../20230810.mem windows.pstree >> pstree.txt
```

<p>Then,</p>

```bash
cat pstree.txt
Volatility 3 Framework 2.7.0

PID	PPID	ImageFileName	Offset(V)	Threads	Handles	SessionId	Wow64	CreateTime	ExitTime	Audit	CmdPath
[...snip]
*** 936	7436	svchost.exe	0x9e8b8cd89080	0	-	1	False	2023-08-10 11:22:31.000000 	2023-08-10 11:27:51.000000 	\Device\HarddiskVolume3\Users\simon.stark\Downloads\svchost.exe	-	-
*** 6812	7436	svchost.exe	0x9e8b87762080	3	-	1	False	2023-08-10 11:30:03.000000 	N/A	\Device\HarddiskVolume3\Users\simon.stark\Downloads\svchost.exe	"C:\Users\simon.stark\Downloads\svchost.exe" 	C:\Users\simon.stark\Downloads\svchost.exe
[...snip]
```
