---
author: Julio
date: 2024-05-07
title: RogueOne Write-Up
series: Sherlocks
---

<div class="center"><img src="https://labs.hackthebox.com/storage/challenges/8b16ebc056e613024c057be590b542eb.png" width="350"></div>

# RogueOne Write-Up

## Introduction

RogueOne is an "Easy" sherlock on HackTheBox. This is the scenario:

> Your SIEM system generated multiple alerts in less than a minute, indicating potential C2 communication from Simon Stark's workstation. Despite Simon not noticing anything unusual, the IT team had him share screenshots of his task manager to check for any unusual processes. No suspicious processes were found, yet alerts about C2 communications persisted. The SOC manager then directed the immediate containment of the workstation and a memory dump for analysis. As a memory forensics expert, you are tasked with assisting the SOC team at Forela to investigate and resolve this urgent incident.

We start with a file called `RogueOne.zip` and when decompressed we get `20230810.mem`.

## Questions

### 1. Please identify the malicious process and confirm process id of malicious process.

First, we can run the following command to get the tree of processes and redirect the output to a file:

```bash
python3 vol.py -f ../20230810.mem windows.pstree >> pstree.txt
```

Then, after analyzing the processes, we noticed that one of the processes was started from a `svchost.exe` file in the Downloads folder.

```bash
cat pstree.txt
Volatility 3 Framework 2.7.0

PID	PPID	ImageFileName	Offset(V)	Threads	Handles	SessionId	Wow64	CreateTime	ExitTime	Audit	CmdPath
[...snip]
*** 936	7436	svchost.exe	0x9e8b8cd89080	0	-	1	False	2023-08-10 11:22:31.000000 	2023-08-10 11:27:51.000000 	\Device\HarddiskVolume3\Users\simon.stark\Downloads\svchost.exe	-	-
*** 6812	7436	svchost.exe	0x9e8b87762080	3	-	1	False	2023-08-10 11:30:03.000000 	N/A	\Device\HarddiskVolume3\Users\simon.stark\Downloads\svchost.exe	"C:\Users\simon.stark\Downloads\svchost.exe" 	C:\Users\simon.stark\Downloads\svchost.exe
[...snip]
```

The right answer is `6812`.

### 2. The SOC team believe the malicious process may spawned another process which enabled threat actor to execute commands. What is the process ID of that child process?

We can grep for the `PID`:

```bash
cat pstree.txt | grep 6812
*** 6812	7436	svchost.exe	0x9e8b87762080	3	-	1	False	2023-08-10 11:30:03.000000 	N/A	\Device\HarddiskVolume3\Users\simon.stark\Downloads\svchost.exe	"C:\Users\simon.stark\Downloads\svchost.exe" 	C:\Users\simon.stark\Downloads\svchost.exe
**** 4364	6812	cmd.exe	0x9e8b8b6ef080	1	-	1	False	2023-08-10 11:30:57.000000 	N/A	\Device\HarddiskVolume3\Windows\System32\cmd.exe	C:\WINDOWS\system32\cmd.exe	C:\WINDOWS\system32\cmd.exe
```

The right answer is `4364`.

### 3. The reverse engineering team need the malicious file sample to analyze. Your SOC manager instructed you to find the hash of the file and then forward the sample to reverse engineering team. Whats the md5 hash of the malicious file?

We can scan for files and save hte output to a text file:

```bash
python3 vol.py -f ../20230810.mem windows.filescan >> all_files.txt
```

Then, we can grep for the file so we can find its virtual address:

```bash
cat all_files.txt | grep svchost.exe | grep simon.stark
0x9e8b909045d0	\Users\simon.stark\Downloads\svchost.exe	216
0x9e8b91ec0140	\Users\simon.stark\Downloads\svchost.exe	216
```

We can then dump it with the following command:

```bash
python3 vol.py -f ../20230810.mem windows.dumpfiles --virtaddr 0x9e8b909045d0
Volatility 3 Framework 2.7.0
Progress:  100.00		PDB scanning finished
Cache	FileObject	FileName	Result

DataSectionObject	0x9e8b909045d0	svchost.exe	Error dumping file
ImageSectionObject	0x9e8b909045d0	svchost.exe	file.0x9e8b909045d0.0x9e8b957f24c0.ImageSectionObject.svchost.exe.img
```

And we can get its MD5:

```bash
md5 file.0x9e8b909045d0.0x9e8b957f24c0.ImageSectionObject.svchost.exe.img
MD5 (file.0x9e8b909045d0.0x9e8b957f24c0.ImageSectionObject.svchost.exe.img) = 5bd547c6f5bfc4858fe62c8867acfbb5
```

The right answer is `5bd547c6f5bfc4858fe62c8867acfbb5`.

### 4. In order to find the scope of the incident, the SOC manager has deployed a threat hunting team to sweep across the environment for any indicator of compromise. It would be a great help to the team if you are able to confirm the C2 IP address and ports so our team can utilise these in their sweep.

We can scan for network connections:

```bash
python3 vol.py -f ../20230810.mem windows.netscan >> net.txt
```

And we can trip to grep for the process ID of the malicious process to see if there is an established connection:

```bash
cat net.txt | grep 6812
0x9e8b8cb58010	TCPv4	172.17.79.131	64254	13.127.155.166	8888	ESTABLISHED	6812	svchost.exe	2023-08-10 11:30:03.000000
```

Then, the right answer is `13.127.155.166:8888`.

### 5. We need a timeline to help us scope out the incident and help the wider DFIR team to perform root cause analysis. Can you confirm time the process was executed and C2 channel was established?

We can answer this question with the output of the previous command. The right answer is `10/08/2023 11:30:03`.

### 6. What is the memory offset of the malicious process?

We can use the process tree once again to find the memory offset of the process.

```bash
cat pstree.txt| grep svchost | grep Downloads
*** 936	7436	svchost.exe	0x9e8b8cd89080	0	-	1	False	2023-08-10 11:22:31.000000 	2023-08-10 11:27:51.000000 	\Device\HarddiskVolume3\Users\simon.stark\Downloads\svchost.exe	-	-
*** 6812	7436	svchost.exe	0x9e8b87762080	3	-	1	False	2023-08-10 11:30:03.000000 	N/A	\Device\HarddiskVolume3\Users\simon.stark\Downloads\svchost.exe	"C:\Users\simon.stark\Downloads\svchost.exe" 	C:\Users\simon.stark\Downloads\svchost.exe
```

The right answer is `0x9e8b87762080`.

### 7. You successfully analyzed a memory dump and received praise from your manager. The following day, your manager requests an update on the malicious file. You check VirusTotal and find that the file has already been uploaded, likely by the reverse engineering team. Your task is to determine when the sample was first submitted to VirusTotal.

We can use the MD5 hash that we retrieved before and submit it to VirusTotal. Under the "Details" tab, we will see the following information:

```
First Submission
2023-08-10 11:58:10 UTC
```

The right answer is `10/08/2023 11:58:10`.

## Conclusion

This was an interesting challenge that made me go deeper into understanding Volatility and memory analysis. I'd definitely recommend it to anyone who's currently understanding DFIR.

## References

- <a href="https://app.hackthebox.com/sherlocks/RogueOne">https://app.hackthebox.com/sherlocks/RogueOne</a>
- <a href="https://book.hacktricks.xyz/generic-methodologies-and-resources/basic-forensic-methodology/memory-dump-analysis/volatility-cheatsheet">https://book.hacktricks.xyz/generic-methodologies-and-resources/basic-forensic-methodology/memory-dump-analysis/volatility-cheatsheet</a>
- <a href="https://github.com/volatilityfoundation/volatility3">https://github.com/volatilityfoundation/volatility3</a>
