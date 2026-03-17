---
title: Journal
permalink: /journal/
---

# Journal

{% assign entries = site.journal | sort: "date" | reverse %}
{% for entry in entries %}
- [{{ entry.title }}]({{ entry.url | relative_url }})
{% endfor %}
