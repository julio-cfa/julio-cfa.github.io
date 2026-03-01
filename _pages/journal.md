---
title: Journal
permalink: /journal/
---

# Journal

{% assign entries = site.journal | sort: "date" | reverse %}
{% if entries.size > 0 %}
{% for entry in entries %}
- [{{ entry.title }}]({{ entry.url | relative_url }})
{% endfor %}
{% else %}
No journal entries yet.
{% endif %}
