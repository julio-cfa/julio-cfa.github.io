---
layout: post
date: 06-05-2024
author: Julio
---

<img src="https://labs.hackthebox.com/storage/challenges/abd815286ba1007abfbb8415b83ae2cf.png" width=450>

# Unit42

## Introduction

<p>Unit42 is a "Very Easy" challenge We have the following scenario: "In this Sherlock, you will familiarize yourself with Sysmon logs and various useful EventIDs for identifying and analyzing malicious activities on a Windows system. Palo Alto's Unit42 recently conducted research on an UltraVNC campaign, wherein attackers utilized a backdoored version of UltraVNC to maintain access to systems. This lab is inspired by that campaign and guides participants through the initial access stage of the campaign."</p>
<p>We need to download a file called "unit42.zip". After decompressing it, we get a file called "Microsoft-Windows-Sysmon-Operational.evtx".</p>

## Questions

### How many Event logs are there with Event ID 11?

<p>We will be using a tool called <custom-code>evtx_dump<custom-code> written by omerbenamram. You can find it here: <a href="https://github.com/omerbenamram/evtx">https://github.com/omerbenamram/evtx</a></p>

<p>We can either use this tool to work with XML output or with JSON output.</p>

<P>XML:</p>

```bash
../evtx-dump Microsoft-Windows-Sysmon-Operational.evtx
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
../evtx-dump Microsoft-Windows-Sysmon-Operational.evtx -o json | grep -v "Record 1*" | jq
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
