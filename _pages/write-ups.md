---
title: Write-Ups
permalink: /write-ups/
---

# Write-Ups

## HackTheBox - Sherlocks

{% assign sherlocks = site.writeups | where: "series", "Sherlocks" | sort: "date" | reverse %}
{% for writeup in sherlocks %}
- [{{ writeup.title }}]({{ writeup.url | relative_url }})
{% endfor %}

## HackTheBox - Machines

{% assign machines = site.writeups | where: "series", "Machines" | sort: "date" | reverse %}
{% for writeup in machines %}
- [{{ writeup.title }}]({{ writeup.url | relative_url }})
{% endfor %}
