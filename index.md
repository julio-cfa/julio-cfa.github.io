---
layout: default
---

# Latest Posts

{% assign latest_posts = site.writeups | concat: site.programming | concat: site.cves | concat: site.certifications | concat: site.journal | sort: "date" | reverse %}
{% for post in latest_posts %}
{% assign post_label = post.collection %}
{% if post.collection == "writeups" %}
  {% assign post_label = "Write-Up" %}
{% elsif post.collection == "programming" %}
  {% assign post_label = "Programming & Tooling" %}
{% elsif post.collection == "cves" %}
  {% assign post_label = "CVE" %}
{% elsif post.collection == "certifications" %}
  {% assign post_label = "Certification" %}
{% elsif post.collection == "journal" %}
  {% assign post_label = "Journal" %}
{% endif %}
- [{{ post.title }}]({{ post.url | relative_url }}) <small>{{ post.date | date: "%Y-%m-%d" }} · {{ post_label }}</small>
{% endfor %}
