# Postman

<img width="592" alt="postman_profile" src="https://user-images.githubusercontent.com/53229208/68391513-c9314300-01a2-11ea-9708-bde8ccacf56a.png">

**Summary**
1. Upload SSH public key via unauthenticated Redis service. 
1. Gain a foothold by performing SSH key login. 
1. Identify an SSH private key file and a user account. 
1. Recover the passphrase which protects the SSH private key.
1. Login to Webmin with the identified user account, and with the recovered passphrase as password. 
1. Gain root privilege by exploiting the known Webmin exploit (CVE-2019-12840). 

## Port Scan
```
PORT      STATE SERVICE VERSION
22/tcp    open  ssh     OpenSSH 7.6p1 Ubuntu 4ubuntu0.3 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   2048 46:83:4f:f1:38:61:c0:1c:74:cb:b5:d1:4a:68:4d:77 (RSA)
|   256 2d:8d:27:d2:df:15:1a:31:53:05:fb:ff:f0:62:26:89 (ECDSA)
|_  256 ca:7c:82:aa:5a:d3:72:ca:8b:8a:38:3a:80:41:a0:45 (ED25519)
80/tcp    open  http    Apache httpd 2.4.29 ((Ubuntu))
|_http-server-header: Apache/2.4.29 (Ubuntu)
|_http-title: The Cyber Geek's Personal Website
6379/tcp  open  redis   Redis key-value store 4.0.9
10000/tcp open  http    MiniServ 1.910 (Webmin httpd)
|_http-title: Site doesn't have a title (text/html; Charset=iso-8859-1).
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel
```

## Advance on
1. No authentication required on the Redis service. 
   <img width="639" alt="redis-no-auth" src="https://user-images.githubusercontent.com/53229208/68392069-eb779080-01a3-11ea-827d-dcc84dda39a3.png">

1. Generate our SSH key pairs and upload the generated public key file via the Redis service. 
   * `ssh-keygen -t rsa -f htb` 
   * `(echo -e "\n\n"; cat htb.pub; echo -e "\n\n") > key.txt`

   **[Related Reference](https://packetstormsecurity.com/files/134200/Redis-Remote-Command-Execution.html)**

1. Gain a foothold, by performing SSH login with the generated private key.
   <img width="1271" alt="redis" src="https://user-images.githubusercontent.com/53229208/68392951-e0bdfb00-01a5-11ea-93d9-3a15cdf7016b.png">

1. Upload, execute and study the LinEnum.sh's output. The output shows an interesting SSH private key file `/opt/id_rsa.bak`, own by a user account name **Matt**.  
   ```
   -rwxr-xr-x 1 Matt Matt 1743 Aug 26 00:11 /opt/id_rsa.bak  
   ```
1. Download the SSH private key file and recover its passphase, **computer2008**.  
   <img width="1674" alt="ssh2john" src="https://user-images.githubusercontent.com/53229208/68394187-57f48e80-01a8-11ea-8b28-07fbf49864bc.png">
   
1. With `Matt` as the login ID and the recovered passphrase `computer2008` as the password, we can access the Webmin portal https://10.10.10.160:10000/. 
    * NOTE: Unable to perform SSH login with the recovered username `Matt` and SSH private key with passphase. 

1. The running Webmin version is known to be vulnerable to **CVE-2019-12840**, Webmin 1.910 - 'Package Updates' Remote Command Execution, which is also available in Metasploit `exploit/linux/http/webmin_packageup_rce`. With the known exploit and Webmin running with root access, we able to gain a reverse shell with root privilege.
   <img width="1228" alt="msf-cve-2" src="https://user-images.githubusercontent.com/53229208/68397695-8d03df80-01ae-11ea-82a7-012436e1e33e.png">



