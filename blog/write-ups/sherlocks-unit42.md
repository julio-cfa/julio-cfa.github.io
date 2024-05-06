---
layout: post
date: 06-05-2024
author: Julio
---

<div class="center"><img src="https://labs.hackthebox.com/storage/challenges/abd815286ba1007abfbb8415b83ae2cf.png" width="350"></div>

# Unit42

## Introduction

<p>Unit42 is a "Very Easy" challenge We have the following scenario: "In this Sherlock, you will familiarize yourself with Sysmon logs and various useful EventIDs for identifying and analyzing malicious activities on a Windows system. Palo Alto's Unit42 recently conducted research on an UltraVNC campaign, wherein attackers utilized a backdoored version of UltraVNC to maintain access to systems. This lab is inspired by that campaign and guides participants through the initial access stage of the campaign."</p>
<p>We need to download a file called "unit42.zip". After decompressing it, we get a file called "Microsoft-Windows-Sysmon-Operational.evtx".</p>

## Questions

### How many Event logs are there with Event ID 11?

<p>We will be using a tool called <custom-code>evtx_dump</custom-code> written by omerbenamram. You can find it here: <a href="https://github.com/omerbenamram/evtx">https://github.com/omerbenamram/evtx</a>.</p>

<p>We can either use this tool to work with XML output or with JSON output.</p>

<P>XML:</p>

```bash
./evtx-dump Microsoft-Windows-Sysmon-Operational.evtx
[...snip]
Record 169
<?xml version="1.0" encoding="utf-8"?>
<Event xmlns="http://schemas.microsoft.com/win/2004/08/events/event">
  <System>
    <Provider Name="Microsoft-Windows-Sysmon" Guid="5770385F-C22A-43E0-BF4C-06F5698FFBD9">
    </Provider>
    <EventID>12</EventID>
    <Version>2</Version>
    <Level>4</Level>
    <Task>12</Task>
    <Opcode>0</Opcode>
    <Keywords>0x8000000000000000</Keywords>
    <TimeCreated SystemTime="2024-02-14T03:43:26.887066Z">
    </TimeCreated>
    <EventRecordID>118915</EventRecordID>
    <Correlation>
    </Correlation>
    <Execution ProcessID="3028" ThreadID="4412">
    </Execution>
    <Channel>Microsoft-Windows-Sysmon/Operational</Channel>
    <Computer>DESKTOP-887GK2L</Computer>
    <Security UserID="S-1-5-18">
    </Security>
  </System>
  <EventData>
    <Data Name="RuleName">technique_id=T1546.001,technique_name=Change Default File Association</Data>
    <Data Name="EventType">CreateKey</Data>
    <Data Name="UtcTime">2024-02-14 03:43:26.880</Data>
    <Data Name="ProcessGuid">817BDDF3-311F-65CC-0A01-000000001900</Data>
    <Data Name="ProcessId">1116</Data>
    <Data Name="Image">C:\Windows\Explorer.EXE</Data>
    <Data Name="TargetObject">HKU\S-1-5-21-3393683511-3463148672-371912004-1001\Software\Microsoft\Windows\CurrentVersion\Explorer\FileExts\.evtx</Data>
    <Data Name="User">DESKTOP-887GK2L\CyberJunkie</Data>
  </EventData>
</Event>
```

JSON:

```bash
./evtx-dump Microsoft-Windows-Sysmon-Operational.evtx -o json | grep -v "Record 1*" | jq
[...snip]
{
  "Event": {
    "#attributes": {
      "xmlns": "http://schemas.microsoft.com/win/2004/08/events/event"
    },
    "EventData": {
      "EventType": "CreateKey",
      "Image": "C:\\Windows\\Explorer.EXE",
      "ProcessGuid": "817BDDF3-311F-65CC-0A01-000000001900",
      "ProcessId": 1116,
      "RuleName": "technique_id=T1546.001,technique_name=Change Default File Association",
      "TargetObject": "HKU\\S-1-5-21-3393683511-3463148672-371912004-1001\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\FileExts\\.evtx",
      "User": "DESKTOP-887GK2L\\CyberJunkie",
      "UtcTime": "2024-02-14 03:43:26.880"
    },
    "System": {
      "Channel": "Microsoft-Windows-Sysmon/Operational",
      "Computer": "DESKTOP-887GK2L",
      "Correlation": null,
      "EventID": 12,
      "EventRecordID": 118915,
      "Execution": {
        "#attributes": {
          "ProcessID": 3028,
          "ThreadID": 4412
        }
      },
      "Keywords": "0x8000000000000000",
      "Level": 4,
      "Opcode": 0,
      "Provider": {
        "#attributes": {
          "Guid": "5770385F-C22A-43E0-BF4C-06F5698FFBD9",
          "Name": "Microsoft-Windows-Sysmon"
        }
      },
      "Security": {
        "#attributes": {
          "UserID": "S-1-5-18"
        }
      },
      "Task": 12,
      "TimeCreated": {
        "#attributes": {
          "SystemTime": "2024-02-14T03:43:26.887066Z"
        }
      },
      "Version": 2
    }
  }
}
```

<p>As seen above, each event has an <custom-code>EventID</custom-code>. We can use the following command to filter retrieve how many IDs were "11".</p>

```bash
./evtx-dump Microsoft-Windows-Sysmon-Operational.evtx -o json | grep -v "Record 1*" | jq .Event.System.EventID | grep 11 | uniq -c
  56 11
```

<p>As seen above, "56" is the right answer</p>

### Whenever a process is created in memory, an event with Event ID 1 is recorded with details such as command line, hashes, process path, parent process path, etc. This information is very useful for an analyst because it allows us to see all programs executed on a system, which means we can spot any malicious processes being executed. What is the malicious process that infected the victim's system?

<p>We can use the following command to filter the IDs of the events and grep for the command line arguments:</p>

```bash
./evtx-dump Microsoft-Windows-Sysmon-Operational.evtx -o json | grep -v "Record 1*" | jq '.[] | select(.System.EventID == 1)' | egrep '"CommandLine"'
    "CommandLine": "\"C:\\Program Files\\Mozilla Firefox\\pingsender.exe\" https://incoming.telemetry.mozilla.org/submit/telemetry/cb88145b-129d-471c-b605-4fdf09fec680/event/Firefox/122.0.1/release/20240205133611?v=4 C:\\Users\\CyberJunkie\\AppData\\Roaming\\Mozilla\\Firefox\\Profiles\\avsa4d81.default-release\\saved-telemetry-pings\\cb88145b-129d-471c-b605-4fdf09fec680 https://incoming.telemetry.mozilla.org/submit/telemetry/6fcd92a2-cc60-4df6-b6fb-66356dd011c1/main/Firefox/122.0.1/release/20240205133611?v=4 C:\\Users\\CyberJunkie\\AppData\\Roaming\\Mozilla\\Firefox\\Profiles\\avsa4d81.default-release\\saved-telemetry-pings\\6fcd92a2-cc60-4df6-b6fb-66356dd011c1",
    "CommandLine": "\"C:\\Users\\CyberJunkie\\Downloads\\Preventivo24.02.14.exe.exe\" ",
    "CommandLine": "C:\\Windows\\system32\\msiexec.exe /V",
    "CommandLine": "C:\\Windows\\syswow64\\MsiExec.exe -Embedding 5364C761FA9A55D636271A1CE8A6742D C",
    "CommandLine": "\"C:\\Windows\\system32\\msiexec.exe\" /i \"C:\\Users\\CyberJunkie\\AppData\\Roaming\\Photo and Fax Vn\\Photo and vn 1.1.2\\install\\F97891C\\main1.msi\" AI_SETUPEXEPATH=C:\\Users\\CyberJunkie\\Downloads\\Preventivo24.02.14.exe.exe SETUPEXEDIR=C:\\Users\\CyberJunkie\\Downloads\\ EXE_CMD_LINE=\"/exenoupdates  /forcecleanup  /wintime 1707880560  \" AI_EUIMSI=\"\"",
    "CommandLine": "C:\\Windows\\syswow64\\MsiExec.exe -Embedding 5250A3DB12224F77D2A18B4EB99AC5EB",
```

<p>The most suspicious one is <custom-code>Preventivo24.02.14.exe.exe</custom-code> and it is the right answer.</p>

### Which Cloud drive was used to distribute the malware?

<p>Events with the ID of 22 are documented as "DNSEvent (DNS query)". According to Sysmon's documentation, "this event is generated when a process executes a DNS query, whether the result is successful or fails, cached or not. The telemetry for this event was added for Windows 8.1 so it is not available on Windows 7 and earlier". We can use this event to look for which sites were requested.</p>

```bash
./evtx-dump Microsoft-Windows-Sysmon-Operational.evtx -o json | grep -v "Record 1*" | jq '.[] | select(.System.EventID == 22) | .EventData.QueryName'
"uc2f030016253ec53f4953980a4e.dl.dropboxusercontent.com"
"d.dropbox.com"
"www.example.com"
```

<p>The right response, then, is "DropBox".</p>

### The initial malicious file time-stamped (a defense evasion technique, where the file creation date is changed to make it appear old) many files it created on disk. What was the timestamp changed to for a PDF file?

<p>Referring to Sysmon's documentation again, we can see that events that have the ID of 2 are "a process changed a file creation time". We can then use the following command to find our answer:</p>

```bash
./evtx-dump Microsoft-Windows-Sysmon-Operational.evtx -o json | grep -v "Record 1*" | jq '.[] | select(.System.EventID == 2) | .EventData' | egrep "CreationUtcTime|TargetFilename"  | grep pdf -B2
  "CreationUtcTime": "2024-01-14 08:10:06.029",
  "PreviousCreationUtcTime": "2024-02-14 03:41:58.404",
  "TargetFilename": "C:\\Users\\CyberJunkie\\AppData\\Roaming\\Photo and Fax Vn\\Photo and vn 1.1.2\\install\\F97891C\\TempFolder\\~.pdf"
```

<p>The answer is "2024-01-14 08:10:06".</p>

### The malicious file dropped a few files on disk. Where was "once.cmd" created on disk? Please answer with the full path along with the filename.

```bash
./evtx-dump Microsoft-Windows-Sysmon-Operational.evtx -o json | grep -v "Record 1*" | jq '.[] | select(.System.EventID == 11) | .EventData' | grep "once.cmd"
  "TargetFilename": "C:\\Users\\CyberJunkie\\AppData\\Roaming\\Photo and Fax Vn\\Photo and vn 1.1.2\\install\\F97891C\\WindowsVolume\\Games\\once.cmd",
  "TargetFilename": "C:\\Games\\once.cmd",
```

<p>The answer is <custom-code>C:\Users\CyberJunkie\AppData\Roaming\Photo and Fax Vn\Photo and vn 1.1.2\install\F97891C\WindowsVolume\Games\once.cmd</custom-code>.</p>

### The malicious file attempted to reach a dummy domain, most likely to check the internet connection status. What domain name did it try to connect to?

<p>We already have this information from the question we looked for DNS queries. The right answer is <custom-code>www.example.com</custom-code>.</p>

### Which IP address did the malicious process try to reach out to?

<p>Event ID 3 logs all network connections. We can find the destination IPs with the following command:</p>

```bash
./evtx-dump Microsoft-Windows-Sysmon-Operational.evtx -o json | grep -v "Record 1*" | jq '.[] | select(.System.EventID == 3) | .EventData' | grep Ip
  "DestinationIp": "93.184.216.34",
  "DestinationIsIpv6": false,
  "SourceIp": "172.17.79.132",
  "SourceIsIpv6": false,
```

<p>It seems like there was only one connection. The answer is <custom-code>93.184.216.34</custom-code></p>

### The malicious process terminated itself after infecting the PC with a backdoored variant of UltraVNC. When did the process terminate itself?

<p>Lastly, Event ID 5 logs all entries of terminated processes. We can use the following command to find the processes that were terminated:</p>

```bash
./evtx-dump Microsoft-Windows-Sysmon-Operational.evtx -o json | grep -v "Record 1*" | jq '.[] | select(.System.EventID == 5) | .EventData'
{
  "Image": "C:\\Users\\CyberJunkie\\Downloads\\Preventivo24.02.14.exe.exe",
  "ProcessGuid": "817BDDF3-3684-65CC-2D02-000000001900",
  "ProcessId": 10672,
  "RuleName": "-",
  "User": "DESKTOP-887GK2L\\CyberJunkie",
  "UtcTime": "2024-02-14 03:41:58.795"
}
```

<p>The answer is <custom-code>2024-02-14 03:41:58</custom-code>.</p>
