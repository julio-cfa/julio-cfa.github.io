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
    padding-left: 1.8rem;
  }

  /* square node */
  .t-item::before{
    content: "";
    position: absolute;
    left: .72rem;
    top: 1.75rem;
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
  .c-rocketchat { color: #ff7b7b; }
  .c-loadsmart  { color: #9be59b; }
  .c-openzeppelin  { color: #7ad0ff; }
  .c-berghem     { color: #ffbf6b; }

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
    list-style: none;
    border: 1px solid rgba(255,255,255,.14);
    background: rgba(255,255,255,.04);
    padding: .35rem 2.10rem;
    border-radius: 999px;
    font-size: .95rem;
    color: rgba(255,255,255,.8);
  }
</style>

<div class="whoami-wrap">
  <h1>Whoami</h1>

  <p class="lead">
    My name is Julio Araujo and I'm currently working as a technical security leader. I'd like to use this blog as a way to help others in their careers, share knowledge, and so forth. Here's my most recent professional experience:
  </p>

  <div class="timeline" aria-label="Career timeline">
    <!-- Present roles -->
    <div class="t-item">
      <p class="t-role">
        Head of Security <span class="at">@</span>
        <a class="c-rocketchat" href="https://rocket.chat" target="_blank" rel="noopener">Rocket.Chat</a>
        <span class="badge">Present</span>
      </p>
      <p class="t-meta">Security Leadership • Strategy • Governance • AppSec  •  Cloud Security  • IT Security</p>
    </div>

    <div class="t-item">
      <p class="t-role">
        Senior Application Security Engineer <span class="at">@</span>
        <a class="c-rocketchat" href="https://rocket.chat" target="_blank" rel="noopener">Rocket.Chat</a>
        <span class="badge">Past</span>
      </p>
      <p class="t-meta">Secure SDLC • Threat Modeling • Code Reviews • Automation</p>
    </div>

    <div class="t-item">
      <p class="t-role">
        Senior Offensive Security Engineer <span class="at">@</span>
        <a class="c-loadsmart" href="https://loadsmart.com" target="_blank" rel="noopener">Loadsmart</a>
        <span class="badge">Past</span>
      </p>
      <p class="t-meta">Pentesting • Adversary Simulation • Phishing Assessments</p>
    </div>

    <div class="t-item">
      <p class="t-role">
        Senior IT Security Engineer <span class="at">@</span>
        <a class="c-openzeppelin" href="https://openzeppelin.com" target="_blank" rel="noopener">OpenZeppelin</a>
        <span class="badge">Past</span>
      </p>
      <p class="t-meta">Cloud Security • IAM • IT Security • Compliance • Pentesting </p>
    </div>

    <div class="t-item">
      <p class="t-role">
        Lead Cybersecurity Consultant <span class="at">@</span>
        <a class="c-berghem" href="https://berghem.com.br" target="_blank" rel="noopener">Berghem</a>
        <span class="badge">Past</span>
      </p>
      <p class="t-meta">Security Leadership • Web App/API Pentesting • Active Directory Pentesting • AWS Pentesting • Mobile App (Android/iOS) Pentesting</p>
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
      <li>CPTS</li>
      <li>CWES (formerly CBBH)</li>
      <li>eWPTXv2</li>
      <li>eWPTv1</li>
      <li>eJPTv1</li>
      <li>CRTO</li>
      <li>BSCP</li>
      <li>GCRTP</li>
      <li>CKA</li>
      <li>PNPT</li>
      <li>AWS CLF-C01</li>
      <li>DCPT</li>
      <li>PDPF</li>
      <li>ISFS</li>
    </ul>

    <p class="lead" style="margin-top:1.25rem;">
      Find me on
      <a href="https://linkedin.com/in/julio-cfa" target="_blank" rel="noopener">LinkedIn</a>
      or
      <a href="https://github.com/julio-cfa" target="_blank" rel="noopener">GitHub</a>.
    </p>
  </div>
</div>
