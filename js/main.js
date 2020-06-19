// JavaScript Document

$("#error-alert").hide();
$("#copy-alert").hide();

var unicode_from = 19968;
var password = "takuron.top";
var word_str = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=";
var word_list = word_str.split('');

String.prototype.replaceAll = function (s1, s2) {
	var reg = new RegExp(s1, "g");
	return this.replace(reg, s2);
}

function encrypt() {
	var msg = $("#text-decryped").val();
	var key = $("#text-key").val();

	if (msg.length < 1) {
		$("#error-alert").show();
		$("#copy-alert").hide();
		$("#error-alert").text("你不说，瞎子怎么算？（请输入待加密的明文）");
	} else {
		if (key.length < 1) {
			key = password;
		}

		$("#text-encryped").val(togod(msg, key));
		$("#error-alert").hide();
		$("#copy-alert").hide();
	}

}

function decrypt() {
	var msg = $("#text-decryped").val();
	var key = $("#text-key").val();

	if (msg.length < 1) {
		$("#error-alert").show();
		$("#copy-alert").hide();
		$("#error-alert").text("你不说，瞎子怎么算？（请输入待解密的密文）");
	} else {
		if (msg.substring(0, 4) != "瞎子曰：") {
			$("#error-alert").show();
			$("#copy-alert").hide();
			$("#error-alert").text("胡言乱语，解不得。（不是命词，请确定密文来源本网站并且密文以“瞎子曰：开头”）");
		} else {
			if (key.length < 1) {
				key = password;
			}

			try {
				$("#error-alert").hide();
				var str = toman(msg, key);
			} catch (err) {
				$("#error-alert").show();
				$("#copy-alert").hide();
				$("#error-alert").text("胡言乱语，解不得。（命词有误，请确定密钥正确并未被篡改）");
			} finally {
				$("#text-encryped").val(str);
			}
		}
	}
}


function copyUrl2() {
	var Url2 = document.getElementById("text-encryped");
	Url2.select();
	document.execCommand("Copy");
	$("#copy-alert").show();
	$("#error-alert").hide();
}

function togod(msg, key) {
	var str = CryptoJS.AES.encrypt(msg, key).toString();
	str = str.substring(10);

	if (str.length % 2 != 0) {
		str += '=';
	}

	var asc_arr = [];
	var unicode_arr = [];
	var un_arr = [];
	var tmp_arr = str.split('');
	for (var i = 0; i < tmp_arr.length; i++) {
		asc_arr.push(word_list.indexOf(tmp_arr[i]));

		if (i % 2 == 1) {
			var un = asc_arr[i - 1] * word_list.length + asc_arr[i];
			unicode_arr.push(un);
			un_arr.push(String.fromCharCode(unicode_from + parseInt(un)));
		}
	}
	console.log('togod', msg, msg.length, str, str.length, tmp_arr, asc_arr, unicode_arr, un_arr);
	return "瞎子曰：" + un_arr.join('');
}

function toman(msg, key) {
	str = msg.substring(4);

	var unicode_arr = [];
	var asc_arr = [];
	var un_arr = [];
	var tmp_arr = str.split('');
	for (var i = 0; i < tmp_arr.length; i++) {
		var un = tmp_arr[i].charCodeAt(0).toString(10) - unicode_from
		unicode_arr.push(un);

		var t0 = parseInt(un / word_list.length);
		var t1 = parseInt(un % word_list.length);
		asc_arr.push(t0);
		asc_arr.push(t1);

		un_arr.push(word_list[t0]);
		un_arr.push(word_list[t1]);
	}

	console.log('toman', msg, msg.length, str, str.length, tmp_arr, asc_arr, unicode_arr, un_arr);

	var st = CryptoJS.AES.decrypt("U2FsdGVkX1" + un_arr.join(''), key).toString(CryptoJS.enc.Utf8);
	return st;
}
