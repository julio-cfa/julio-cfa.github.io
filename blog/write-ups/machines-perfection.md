---
layout: post
author: Julio
date: 11-05-2024
title: Perfection Write-Up
---

# Perfection Write-Up

## Introduction

## First Steps

<p>We will first run an Nmap scan to discover all open ports:</p>

```bash
sudo nmap -p- -T4 --open -Pn 10.10.11.253
Starting Nmap 7.95 ( https://nmap.org ) at 2024-05-11 17:06 CEST
Nmap scan report for 10.10.11.253
Host is up (0.052s latency).
Not shown: 65533 closed tcp ports (reset)
PORT   STATE SERVICE
22/tcp open  ssh
80/tcp open  http

Nmap done: 1 IP address (1 host up) scanned in 34.85 seconds

```

<p>We can then run scripts to get the services and their versions.</p>

```bash
sudo nmap -sC -sV -p22,80 10.10.11.253 --open -Pn
Starting Nmap 7.95 ( https://nmap.org ) at 2024-05-11 17:09 CEST
Nmap scan report for 10.10.11.253
Host is up (0.030s latency).

PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 8.9p1 Ubuntu 3ubuntu0.6 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey:
|   256 80:e4:79:e8:59:28:df:95:2d:ad:57:4a:46:04:ea:70 (ECDSA)
|_  256 e9:ea:0c:1d:86:13:ed:95:a9:d0:0b:c8:22:e4:cf:e9 (ED25519)
80/tcp open  http    nginx
|_http-title: Weighted Grade Calculator
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 8.70 seconds

```

<p>We can access the website and we will get a calculator</p>

<div class="center"><img src="/assets/images/screenshots/htb-perfection-website1.png"></div>
