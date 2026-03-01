---
title: Programming & Tooling
permalink: /programming-and-tooling/
---

# Programming & Tooling

{% assign posts = site.programming | sort: "date" | reverse %}
{% for post in posts %}
- [{{ post.title }}]({{ post.url | relative_url }})
{% endfor %}
