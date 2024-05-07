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

### 1. Please identify the malicious process and confirm process id of malicious process.

<p>First, we can run the following command to get the tree of processes and redirect the output to a file:</p>

```bash
python3 vol.py -f ../20230810.mem windows.pstree >> pstree.txt
```

<p>Then, after analyzing the processes, we noticed that one of the processes was started from a <custom-code>svchost.exe</custom-code> file in the Downloads folder.</p>

```bash
cat pstree.txt
Volatility 3 Framework 2.7.0

PID	PPID	ImageFileName	Offset(V)	Threads	Handles	SessionId	Wow64	CreateTime	ExitTime	Audit	CmdPath
[...snip]
*** 936	7436	svchost.exe	0x9e8b8cd89080	0	-	1	False	2023-08-10 11:22:31.000000 	2023-08-10 11:27:51.000000 	\Device\HarddiskVolume3\Users\simon.stark\Downloads\svchost.exe	-	-
*** 6812	7436	svchost.exe	0x9e8b87762080	3	-	1	False	2023-08-10 11:30:03.000000 	N/A	\Device\HarddiskVolume3\Users\simon.stark\Downloads\svchost.exe	"C:\Users\simon.stark\Downloads\svchost.exe" 	C:\Users\simon.stark\Downloads\svchost.exe
[...snip]
```

<p>The right answer is <custom-code>6812</custom-code>.</p>

### 2. The SOC team believe the malicious process may spawned another process which enabled threat actor to execute commands. What is the process ID of that child process?

<p>We can grep for the <custom-code>PID</custom-code>:</p>

```bash
cat pstree.txt | grep 6812
*** 6812	7436	svchost.exe	0x9e8b87762080	3	-	1	False	2023-08-10 11:30:03.000000 	N/A	\Device\HarddiskVolume3\Users\simon.stark\Downloads\svchost.exe	"C:\Users\simon.stark\Downloads\svchost.exe" 	C:\Users\simon.stark\Downloads\svchost.exe
**** 4364	6812	cmd.exe	0x9e8b8b6ef080	1	-	1	False	2023-08-10 11:30:57.000000 	N/A	\Device\HarddiskVolume3\Windows\System32\cmd.exe	C:\WINDOWS\system32\cmd.exe	C:\WINDOWS\system32\cmd.exe
```

<p>The right answer is <custom-code>4364</custom-code>.</p>

### 3. The reverse engineering team need the malicious file sample to analyze. Your SOC manager instructed you to find the hash of the file and then forward the sample to reverse engineering team. Whats the md5 hash of the malicious file?

<p>We can scan for files and save hte output to a text file:</p>

```bash
python3 vol.py -f ../20230810.mem windows.filescan >> all_files.txt
```

<p>Then, we can grep for the file so we can find its virtual address:</p>

```bash
cat all_files.txt | grep svchost.exe | grep simon.stark
0x9e8b909045d0	\Users\simon.stark\Downloads\svchost.exe	216
0x9e8b91ec0140	\Users\simon.stark\Downloads\svchost.exe	216
```

<p>We can then dump it with the following command:</p>

```bash
python3 vol.py -f ../20230810.mem windows.dumpfiles --virtaddr 0x9e8b909045d0
Volatility 3 Framework 2.7.0
Progress:  100.00		PDB scanning finished
Cache	FileObject	FileName	Result

DataSectionObject	0x9e8b909045d0	svchost.exe	Error dumping file
ImageSectionObject	0x9e8b909045d0	svchost.exe	file.0x9e8b909045d0.0x9e8b957f24c0.ImageSectionObject.svchost.exe.img
```

<p>And we can get its MD5:</p>

```bash
md5 file.0x9e8b909045d0.0x9e8b957f24c0.ImageSectionObject.svchost.exe.img
MD5 (file.0x9e8b909045d0.0x9e8b957f24c0.ImageSectionObject.svchost.exe.img) = 5bd547c6f5bfc4858fe62c8867acfbb5
```

<p>The right answer is <custom-code>5bd547c6f5bfc4858fe62c8867acfbb5</custom-code>.</p>

### 4. In order to find the scope of the incident, the SOC manager has deployed a threat hunting team to sweep across the environment for any indicator of compromise. It would be a great help to the team if you are able to confirm the C2 IP address and ports so our team can utilise these in their sweep.

<p>We can scan for network connections:</p>

```bash
python3 vol.py -f ../20230810.mem windows.netscan >> net.txt
```

then

```bash
cat net.txt | grep 6812
0x9e8b8cb58010	TCPv4	172.17.79.131	64254	13.127.155.166	8888	ESTABLISHED	6812	svchost.exe	2023-08-10 11:30:03.000000
```

<p>Then, the right answer is <custom-code>13.127.155.166:8888</custom-code>.</p>

### 5. We need a timeline to help us scope out the incident and help the wider DFIR team to perform root cause analysis. Can you confirm time the process was executed and C2 channel was established?

<p>We can answer this question with the output of the previous command. The right answer is <custom-code>10/08/2023 11:30:03</custom-code>.</p>

### 6. What is the memory offset of the malicious process?

<p>We can use the process tree once again to find the memory offset of the process.</p>

```bash
cat pstree.txt| grep svchost | grep Downloads
*** 936	7436	svchost.exe	0x9e8b8cd89080	0	-	1	False	2023-08-10 11:22:31.000000 	2023-08-10 11:27:51.000000 	\Device\HarddiskVolume3\Users\simon.stark\Downloads\svchost.exe	-	-
*** 6812	7436	svchost.exe	0x9e8b87762080	3	-	1	False	2023-08-10 11:30:03.000000 	N/A	\Device\HarddiskVolume3\Users\simon.stark\Downloads\svchost.exe	"C:\Users\simon.stark\Downloads\svchost.exe" 	C:\Users\simon.stark\Downloads\svchost.exe
golemax :: Downloads/Rogu
```

<p>The right answer is <custom-code>0x9e8b87762080</custom-code>.</p>

### 7. You successfully analyzed a memory dump and received praise from your manager. The following day, your manager requests an update on the malicious file. You check VirusTotal and find that the file has already been uploaded, likely by the reverse engineering team. Your task is to determine when the sample was first submitted to VirusTotal.

<p>We can use the MD5 hash that we retrieved before and submit it to VirusTotal. Under the "Details" tab, we will see the following information:</p>

```
First Submission
2023-08-10 11:58:10 UTC
```

<p>The right answer is <custom-code>10/08/2023 11:58:10</custom-code>.</p>

## Conclusion

## References

- <a href="https://app.hackthebox.com/sherlocks/RogueOne">https://app.hackthebox.com/sherlocks/RogueOne</a>
- <a href="https://github.com/volatilityfoundation/volatility3">https://github.com/volatilityfoundation/volatility3</a>
