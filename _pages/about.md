---
title: Whoami
permalink: /about/
---

<style>
  .whoami-wrap{
    color: #e8e8e8;
  }

  /* === Timeline === */
  .timeline{
    position: relative;
    padding-left: 2.25rem; /* room for rail + nodes */
    margin-top: 1.5rem;
  }

  /* vertical rail */
  .timeline::before{
    content: "";
    position: absolute;
    left: .9rem;
    top: .25rem;
    bottom: .25rem;
    width: 2px;
    background: rgba(255,255,255,.12);
  }

  .t-item{
    position: relative;
    padding: 1.15rem 0 1.15rem 0;
  }

  /* square node */
  .t-item::before{
    content: "";
    position: absolute;
    left: .72rem;
    top: 1.45rem;
    width: .55rem;
    height: .55rem;
    background: rgba(255,255,255,.55);
    box-shadow: 0 0 0 3px rgba(255,255,255,.08);
  }

  .t-role{
    font-size: 1.35rem;
    line-height: 1.35;
    margin: 0;
    display: flex;
    gap: .5rem;
    flex-wrap: wrap;
    align-items: baseline;
  }

  .at { opacity: .8; }

  .t-meta{
    margin: .35rem 0 0 0;
    font-size: 1rem;
    color: rgba(255,255,255,.55);
  }

  /* status label */
  .badge{
    display: inline-block;
    padding: .15rem .5rem;
    border: 1px solid rgba(255,255,255,.14);
    border-radius: 999px;
    font-size: .85rem;
    color: rgba(255,255,255,.65);
    margin-left: .4rem;
  }

  /* company accent variants (optional) */
  .c-rocketchat { color: #7bbcff; }
  .c-loadsmart  { color: #9be59b; }
  .c-snowflake  { color: #7ad0ff; }
  .c-google     { color: #ffd36b; }

  /* Small intro paragraph style */
  .lead{
    color: rgba(255,255,255,.72);
    font-size: 1.05rem;
    line-height: 1.75;
    margin: 0 0 1.25rem 0;
  }

  /* Certifications block */
  .certs{
    margin-top: 2.25rem;
    padding-top: 1.25rem;
    border-top: 1px dashed rgba(255,255,255,.12);
    color: rgba(255,255,255,.72);
  }
  .certs strong{ color: rgba(255,255,255,.9); }

  /* Nice pill list */
  .pill-list{
    display: flex;
    flex-wrap: wrap;
    gap: .5rem;
    margin: .75rem 0 0 0;
    padding: 0;
    list-style: none;
  }
  .pill-list li{
    border: 1px solid rgba(255,255,255,.14);
    background: rgba(255,255,255,.04);
    padding: .35rem .6rem;
    border-radius: 999px;
    font-size: .95rem;
    color: rgba(255,255,255,.8);
  }
</style>

<div class="whoami-wrap">
  <h1>Whoami</h1>

  <p class="lead">
    I am Julio Araujo, currently working in security leadership and application security.
    My recent experience includes:
  </p>

  <div class="timeline" aria-label="Career timeline">
    <!-- Present roles -->
    <div class="t-item">
      <p class="t-role">
        Head of Security <span class="at">@</span>
        <a class="c-rocketchat" href="https://rocket.chat" target="_blank" rel="noopener">Rocket.Chat</a>
        <span class="badge">Present</span>
      </p>
      <p class="t-meta">Security leadership • Strategy • Governance • AppSec enablement</p>
    </div>

    <div class="t-item">
      <p class="t-role">
        Senior Application Security Engineer <span class="at">@</span>
        <a class="c-rocketchat" href="https://rocket.chat" target="_blank" rel="noopener">Rocket.Chat</a>
        <span class="badge">Past</span>
      </p>
      <p class="t-meta">Secure SDLC • Threat modeling • Reviews • Automation</p>
    </div>

    <div class="t-item">
      <p class="t-role">
        Senior Offensive Security Engineer <span class="at">@</span>
        <a class="c-loadsmart" href="https://loadsmart.com" target="_blank" rel="noopener">Loadsmart</a>
        <span class="badge">Past</span>
      </p>
      <p class="t-meta">Red teaming • Pentesting • Adversary simulation</p>
    </div>

    <!-- Optional: add more entries in the same format -->
    <!--
    <div class="t-item">
      <p class="t-role">
        Role <span class="at">@</span>
        <a class="c-snowflake" href="..." target="_blank" rel="noopener">Company</a>
        <span class="badge">Past</span>
      </p>
      <p class="t-meta">Short description of impact or scope</p>
    </div>
    -->
  </div>

  <div class="certs">
    <h2>Certifications</h2>
    <ul class="pill-list" aria-label="Certifications">
      <li>CBBH</li>
      <li>eWPTXv2</li>
      <li>eWPTv1</li>
      <li>eJPTv1</li>
      <li>CRTO</li>
      <li>BSCP</li>
    </ul>

    <p class="lead" style="margin-top:1.25rem;">
      Find me on
      <a href="https://linkedin.com/in/julio-cfa" target="_blank" rel="noopener">LinkedIn</a>
      or
      <a href="https://github.com/julio-cfa" target="_blank" rel="noopener">GitHub</a>.
    </p>
  </div>
</div>
