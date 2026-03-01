---
title: Certifications
permalink: /certifications/
---

# Certifications

{% assign certifications = site.certifications | sort: "date" | reverse %}
{% for certification in certifications %}
- [{{ certification.title }}]({{ certification.url | relative_url }})
{% endfor %}
