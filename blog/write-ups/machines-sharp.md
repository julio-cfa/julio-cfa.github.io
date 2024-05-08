---
layout: post
author: Julio
date: 09-05-2024
title: Sharp Write-Up
---

# Sharp Write-Up

## Introduction

## First Steps

<p>We should start running Nmap to find out how many ports are open. We found the following ports:</p>

```bash
sudo nmap -p- -T5 --open 10.10.10.219
Starting Nmap 7.95 ( https://nmap.org ) at 2024-05-09 00:14 CEST
Stats: 0:00:59 elapsed; 0 hosts completed (1 up), 1 undergoing SYN Stealth Scan
SYN Stealth Scan Timing: About 86.96% done; ETC: 00:16 (0:00:09 remaining)
Nmap scan report for 10.10.10.219
Host is up (0.028s latency).
Not shown: 65529 filtered tcp ports (no-response)
Some closed ports may be reported as filtered due to --defeat-rst-ratelimit
PORT     STATE SERVICE
135/tcp  open  msrpc
139/tcp  open  netbios-ssn
445/tcp  open  microsoft-ds
5985/tcp open  wsman
8888/tcp open  sun-answerbook
8889/tcp open  ddi-tcp-2

Nmap done: 1 IP address (1 host up) scanned in 66.02 seconds
```

<p>We can then run Nmap with -sC and -sV flags to retrieve which services are running on these ports.</p>

```bash
sudo nmap -p 135,139,445,5985,8888,8889 -T3 -sC -sV --open 10.10.10.219
Starting Nmap 7.95 ( https://nmap.org ) at 2024-05-09 00:17 CEST
Nmap scan report for 10.10.10.219
Host is up (0.054s latency).

PORT     STATE SERVICE            VERSION
135/tcp  open  msrpc              Microsoft Windows RPC
139/tcp  open  netbios-ssn        Microsoft Windows netbios-ssn
445/tcp  open  microsoft-ds?
5985/tcp open  http               Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)
|_http-title: Not Found
|_http-server-header: Microsoft-HTTPAPI/2.0
8888/tcp open  storagecraft-image StorageCraft Image Manager
8889/tcp open  mc-nmf             .NET Message Framing
Service Info: OS: Windows; CPE: cpe:/o:microsoft:windows

Host script results:
| smb2-security-mode:
|   3:1:1:
|_    Message signing enabled but not required
| smb2-time:
|   date: 2024-05-08T22:18:14
|_  start_date: N/A

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 104.59 seconds
```

<p>Since SMB ports are open, we can try listing the shares and checking if we can read any of them without having valid credentials.</p>

```bash
smbclient -L \\\\10.10.10.219\\
Can't load /opt/homebrew/etc/smb.conf - run testparm to debug it
Password for [WORKGROUP\julio]:
Anonymous login successful

	Sharename       Type      Comment
	---------       ----      -------
	ADMIN$          Disk      Remote Admin
	C$              Disk      Default share
	dev             Disk
	IPC$            IPC       Remote IPC
	kanban          Disk
SMB1 disabled -- no workgroup available
```

```bash
smbclient \\\\10.10.10.219\\kanban
Can't load /opt/homebrew/etc/smb.conf - run testparm to debug it
Password for [WORKGROUP\julio]:
Anonymous login successful
Try "help" to get a list of possible commands.
smb: \> ls
  .                                   D        0  Sat Nov 14 19:56:03 2020
  ..                                  D        0  Sat Nov 14 19:56:03 2020
  CommandLine.dll                     A    58368  Wed Feb 27 09:06:14 2013
  CsvHelper.dll                       A   141312  Wed Nov  8 14:52:18 2017
  DotNetZip.dll                       A   456704  Wed Jun 22 22:31:52 2016
  Files                               D        0  Sat Nov 14 19:57:59 2020
  Itenso.Rtf.Converter.Html.dll       A    23040  Thu Nov 23 17:29:32 2017
  Itenso.Rtf.Interpreter.dll          A    75776  Thu Nov 23 17:29:32 2017
  Itenso.Rtf.Parser.dll               A    32768  Thu Nov 23 17:29:32 2017
  Itenso.Sys.dll                      A    19968  Thu Nov 23 17:29:32 2017
  MsgReader.dll                       A   376832  Thu Nov 23 17:29:32 2017
  Ookii.Dialogs.dll                   A   133296  Thu Jul  3 23:20:12 2014
  pkb.zip                             A  2558011  Thu Nov 12 21:04:59 2020
  Plugins                             D        0  Thu Nov 12 21:05:11 2020
  PortableKanban.cfg                  A     5819  Sat Nov 14 19:56:01 2020
  PortableKanban.Data.dll             A   118184  Thu Jan  4 22:12:46 2018
  PortableKanban.exe                  A  1878440  Thu Jan  4 22:12:44 2018
  PortableKanban.Extensions.dll       A    31144  Thu Jan  4 22:12:50 2018
  PortableKanban.pk3                  A     2080  Sat Nov 14 19:56:01 2020
  PortableKanban.pk3.bak              A     2080  Sat Nov 14 19:55:54 2020
  PortableKanban.pk3.md5              A       34  Sat Nov 14 19:56:03 2020
  ServiceStack.Common.dll             A   413184  Wed Sep  6 13:18:22 2017
  ServiceStack.Interfaces.dll         A   137216  Wed Sep  6 13:17:30 2017
  ServiceStack.Redis.dll              A   292352  Wed Sep  6 13:02:24 2017
  ServiceStack.Text.dll               A   411648  Wed Sep  6 05:38:18 2017
  User Guide.pdf                      A  1050092  Thu Jan  4 22:14:28 2018

		3803903 blocks of size 4096. 1457272 blocks available

```

## User Flag

## Root Flag
