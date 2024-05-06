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
