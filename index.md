---
layout: default
---

<p class="eyebrow">&gt; homepage</p>

# Latest Posts

{% assign latest_posts = site.writeups | concat: site.programming | concat: site.cves | concat: site.certifications | concat: site.journal | sort: "date" | reverse %}
{% assign total = latest_posts.size %}

<div class="listhead">
  <span>idx</span><span>date</span><span>rt</span><span>title &mdash; category</span>
</div>
<div class="listing" role="list">
{% for post in latest_posts %}
{% assign idx = total | minus: forloop.index0 %}
{% capture post_label %}{% include post-label.html collection=post.collection %}{% endcapture %}
{% capture rt %}{% include reading-time.html content=post.content %}{% endcapture %}
<a class="row" href="{{ post.url | relative_url }}">
  <span class="idx">{{ idx | prepend: '000' | slice: -3, 3 }}</span>
  <span class="date">{{ post.date | date: "%Y-%m-%d" }}</span>
  <span class="rt">{{ rt }}m</span>
  <span class="title-cell"><span class="title">{{ post.title }}</span> <span class="cat">{{ post_label }}</span></span>
</a>
{% endfor %}
</div>
