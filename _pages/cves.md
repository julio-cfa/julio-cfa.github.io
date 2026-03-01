---
title: CVEs
permalink: /cves/
---

# CVEs

{% assign cves = site.cves | sort: "date" | reverse %}
{% for cve in cves %}
- [{{ cve.title }}]({{ cve.url | relative_url }})
{% endfor %}
