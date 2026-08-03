---
title: Journal
permalink: /journal/
---

<p class="eyebrow">&gt; journal</p>

# Journal

{% assign entries = site.journal | sort: "date" | reverse %}
{% for entry in entries %}
- [{{ entry.title }}]({{ entry.url | relative_url }})
{% endfor %}
