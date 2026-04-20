// JavaScript Document
// stego.js - 静态隐写算法库 (免 LLM)
// 参考: /Users/dray/Downloads/blind-fortune-teller-v2/src/lib/stego.ts

// ---- 依赖: CryptoJS (全局变量 CryptoJS) ---- //

// ---- 压缩/解压工具 (基于 LZString) ---- //
function compressToBase64Indices(text) {
  var base64Str = LZString.compressToBase64(text);
  var indices = [];
  var base64Chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  for (var i = 0; i < base64Str.length; i++) {
    var char = base64Str[i];
    if (char === '=') continue;
    var index = base64Chars.indexOf(char);
    if (index !== -1) indices.push(index);
  }
  return indices;
}

function decompressFromBase64Indices(indices) {
  var base64Chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  var base64Str = indices.map(function(i) { return base64Chars[i]; }).join('');
  return LZString.decompressFromBase64(base64Str) || "";
}

// ---- Emoji 字典 (用于纯 Emoji 模式) ---- //
// 仅使用单码点 emoji，避免多码点序列导致 indexOf 失败
// 移除了所有含 U+FE0F 变体选择符的 emoji
var DICT_EMOJIS = [
  '🐱', '🐶', '🚀', '🔮', '🍎', '🍔', '🍺', '🏀', '🚗', '🎸', '📱', '💡', '🔥', '💧', '☀', '🌙',
  '⭐', '🌈', '🌺', '🌲', '🍉', '🍓', '🍕', '🍣', '🍦', '🍩', '⚽', '🎾', '🚲', '🛸', '⌚', '💻',
  '📸', '📚', '🎉', '🎁', '🎈', '❤', '💔', '👍', '👎', '👏', '🙌', '👑', '💍', '💎', '💰', '💣',
  '💯', '✅', '❌', '⚠', '☢', '☯', '♋', '🎵', '🃏', '🏁', '🏳', '🏴', '👽', '👻', '🤖', '🎃'
];

// ==================== 静态算法 ==================== //

// ---- 1. 火星文 (异体字字典替换) ---- //
var MARTIAN_MAP = {
  '明':'朙', '天':'兲', '早':'皁', '上':'丄', '八':'⑧', '点':'嚸',
  '银':'唫', '行':'荇', '门':'冂', '口':'囗', '集':'嵴', '合':'盒',
  '啊':'吖', '别':'莂', '让':'禳', '你':'伱', '们':'扪', '老':'佬',
  '婆':'嘙', '知':'蜘', '道':'檤', '我':'莪', '去':'厾', '网':'蛧',
  '吧':'蚆', '玩':'琓', '一':'①', '整':'愸', '的':'啲', '是':'媞',
  '不':'吥', '好':'妤', '很':'狠', '人':'朲', '有':'囿', '和':'咊',
  '就':'僦', '在':'茬', '了':'ろ', '没':'莈', '么':'庅'
};

function encodeMartian(text) {
  var out = '';
  for (var i = 0; i < text.length; i++) {
    out += MARTIAN_MAP[text[i]] || text[i];
  }
  return out;
}

function decodeMartian(text) {
  var reverseMap = {};
  for (var k in MARTIAN_MAP) { reverseMap[MARTIAN_MAP[k]] = k; }
  var out = '';
  for (var i = 0; i < text.length; i++) {
    out += reverseMap[text[i]] || text[i];
  }
  return out;
}

// ---- 2. 喵星密码 (4进制编码) ---- //
var MEOW_DICT = ["喵", "咪", "呜", "嗷"];

function encodeMeow(text) {
  var b64Indices = compressToBase64Indices(text);
  var out = "";
  var noise = ['nya~ ', 'meow.. ', '🐱 ', '，', '。', '？', '！'];

  for (var i = 0; i < b64Indices.length; i++) {
    var index = b64Indices[i];
    out += MEOW_DICT[(index >> 4) & 3];
    out += MEOW_DICT[(index >> 2) & 3];
    out += MEOW_DICT[index & 3];
    if (Math.random() > 0.65) {
      out += noise[Math.floor(Math.random() * noise.length)];
    }
  }
  return out;
}

function decodeMeow(text) {
  var regex = new RegExp('[^' + MEOW_DICT.join('') + ']', 'g');
  var cleanText = text.replace(regex, '');
  // 允许末尾多余字符（可能是截断残留），只取最长可整除的前缀
  var remain = cleanText.length % 3;
  if (remain !== 0) {
    cleanText = cleanText.slice(0, cleanText.length - remain);
  }
  if (cleanText.length === 0) return "";

  var b64Indices = [];
  for (var i = 0; i < cleanText.length; i += 3) {
    var v1 = MEOW_DICT.indexOf(cleanText[i]);
    var v2 = MEOW_DICT.indexOf(cleanText[i+1]);
    var v3 = MEOW_DICT.indexOf(cleanText[i+2]);
    b64Indices.push((v1 << 4) | (v2 << 2) | v3);
  }
  try {
    var decoded = decompressFromBase64Indices(b64Indices);
    if (decoded === "") return "";  // empty is valid
    return decoded || "解密失败内容为空";
  } catch (e) {
    return "解密错误。";
  }
}

// ---- 3. 乱码视界 (符号装饰) ---- //
function encodeSymbolic(text) {
  var symbols = ['❀','✦','✺','✵','✶','✷','✸','✹','✻','✼','✽','✾','✿','❁','❂','❃','❄','❅','❆','❇','❈','❉','❊','❋'];
  var out = '';
  for (var i = 0; i < text.length; i++) {
    var c = text[i];
    if (/[，。！？、\n\s]/.test(c)) {
      out += c;
    } else {
      out += c + symbols[Math.floor(Math.random() * symbols.length)];
    }
  }
  return out;
}

function decodeSymbolic(text) {
  var symbolsRegex = /[❀✦✺✵✶✷✸✹✻✼✽✾✿❁❂❃❄❅❆❇❈❉❊❋]/g;
  return text.replace(symbolsRegex, '');
}

// ---- 4. 瞎子算命 (AES + 天干地支) ---- //
var BLIND_AES_KEY = 'blind-fortune-teller-key-2020';
var FORTUNE_DICT = [
  '子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥',
  '甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸',
  '金', '木', '水', '火', '土', '阳', '阴', '雷', '风', '雨',
  '电', '天', '地', '玄', '黄', '宇', '宙', '洪', '荒', '日',
  '月', '盈', '仄', '星', '宿', '列', '张', '寒', '来', '暑',
  '往', '秋', '收', '冬', '藏', '闰', '余', '成', '岁', '律', '吕', '调'
];

function encodeBlindFortune(text) {
  try {
    var encrypted = CryptoJS.AES.encrypt(text, BLIND_AES_KEY).toString();
    var b64chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    var shift = Math.floor(Math.random() * 64);
    var cipher = "老衲掐指一算：" + FORTUNE_DICT[shift];

    for (var i = 0; i < encrypted.length; i++) {
      var charIdx = b64chars.indexOf(encrypted[i]);
      if (charIdx !== -1 && charIdx < 64) {
        cipher += FORTUNE_DICT[(charIdx + shift) % 64];
      } else if (encrypted[i] === '=') {
        cipher += '！';
      } else {
        cipher += encrypted[i];
      }
    }
    return cipher;
  } catch(e) {
    return "算命失败！";
  }
}

function decodeBlindFortune(text) {
  try {
    var stripped = text.replace("老衲掐指一算：", "");
    if (stripped.length === 0) return "解密失败";

    var shiftToken = stripped.substring(0, 1);
    var shift = FORTUNE_DICT.indexOf(shiftToken);
    if (shift === -1) return "天机被篡改 (未找到位移码)";

    stripped = stripped.substring(1);
    var b64chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    var base64 = "";

    for (var i = 0; i < stripped.length; i++) {
      if (stripped[i] === '！') {
        base64 += '=';
      } else {
        var dictIdx = FORTUNE_DICT.indexOf(stripped[i]);
        if (dictIdx !== -1) {
          base64 += b64chars[(dictIdx - shift + 64) % 64];
        } else {
          base64 += stripped[i];
        }
      }
    }
    var decryptedBytes = CryptoJS.AES.decrypt(base64, BLIND_AES_KEY);
    var originalText = decryptedBytes.toString(CryptoJS.enc.Utf8);
    return originalText || "解密失败内容为空";
  } catch(e) {
    return "破解天机失败。";
  }
}

// ---- 5. 与佛论禅 (AES + 佛经字符) ---- //
var BUDDHA_DICT = [
  '如','是','我','闻','一','时','佛','在','舍','卫','国','只','树','给','孤','独',
  '园','与','大','比','丘','众','千','二','百','五','十','人','俱','尔','世','尊',
  '食','著','衣','持','钵','入','城','乞','于','其','中','次','第','已','还','至',
  '本','处','饭','讫','收','洗','足','敷','座','而','坐','般','若','波','罗','蜜'
];

function encodeBuddha(text) {
  try {
    var encrypted = CryptoJS.AES.encrypt(text, BLIND_AES_KEY).toString();
    var b64chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    var shift = Math.floor(Math.random() * 64);
    var cipher = "佛曰：" + BUDDHA_DICT[shift];
    for (var i = 0; i < encrypted.length; i++) {
      var charIdx = b64chars.indexOf(encrypted[i]);
      if (charIdx !== -1 && charIdx < 64) {
        cipher += BUDDHA_DICT[(charIdx + shift) % 64];
      } else if (encrypted[i] === '=') {
        cipher += '！';
      } else {
        cipher += encrypted[i];
      }
    }
    return cipher;
  } catch(e) { return "论禅失败！"; }
}

function decodeBuddha(text) {
  try {
    var stripped = text.replace("佛曰：", "");
    if (stripped.length === 0) return "解密失败";

    var shiftToken = stripped.substring(0, 1);
    var shift = BUDDHA_DICT.indexOf(shiftToken);
    if (shift === -1) return "佛法被破 (未找到位移码)";

    stripped = stripped.substring(1);
    var b64chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    var base64 = "";
    for (var i = 0; i < stripped.length; i++) {
      if (stripped[i] === '！') {
        base64 += '=';
      } else {
        var dictIdx = BUDDHA_DICT.indexOf(stripped[i]);
        if (dictIdx !== -1) base64 += b64chars[(dictIdx - shift + 64) % 64];
        else base64 += stripped[i];
      }
    }
    var decryptedBytes = CryptoJS.AES.decrypt(base64, BLIND_AES_KEY);
    return decryptedBytes.toString(CryptoJS.enc.Utf8) || "解密失败内容为空";
  } catch(e) { return "破解佛法失败。"; }
}

// ---- 6. 狗子汪汪 (4进制汪语) ---- //
var DOGE_DICT = ['汪', '呜', '嗷', '嘤'];

function encodeDoge(text) {
  var indices = compressToBase64Indices(text);
  var dogeStr = "🐾";
  var puncts = ['，', '。', '！', '？', '…', ' ', '~~'];
  for (var i = 0; i < indices.length; i++) {
    var idx = indices[i];
    dogeStr += DOGE_DICT[(idx >> 4) & 3];
    dogeStr += DOGE_DICT[(idx >> 2) & 3];
    dogeStr += DOGE_DICT[idx & 3];
    if (Math.random() > 0.6) {
      dogeStr += puncts[Math.floor(Math.random() * puncts.length)];
    }
  }
  return dogeStr + "🐾";
}

function decodeDoge(text) {
  var clean = text.replace(/[^汪呜嗷嘤]/g, '');
  var indices = [];
  for (var i = 0; i < clean.length; i += 3) {
    var chunk = clean.slice(i, i + 3);
    if (chunk.length < 3) break;
    var v1 = DOGE_DICT.indexOf(chunk[0]);
    var v2 = DOGE_DICT.indexOf(chunk[1]);
    var v3 = DOGE_DICT.indexOf(chunk[2]);
    indices.push((v1 << 4) | (v2 << 2) | v3);
  }
  return decompressFromBase64Indices(indices);
}

// ---- 7. 点阵盲文 (Unicode 盲文点阵) ---- //
function encodeBraille(text) {
  try {
    var payload = LZString.compressToUint8Array(text);
    if (!payload) return "编码错误";

    var sum = 0;
    for (var i = 0; i < payload.length; i++) sum = (sum + payload[i]) % 256;

    var result = String.fromCharCode(0x2800 + sum);
    for (var i = 0; i < payload.length; i++) {
      result += String.fromCharCode(0x2800 + payload[i]);
    }
    return result;
  } catch(e) {
    return "盲文加密失败";
  }
}

function decodeBraille(text) {
  try {
    var clean = text.replace(/[^\u2800-\u28FF]/g, '');
    if (clean.length < 2) return "未检测到有效的盲文载荷";

    var bytes = new Uint8Array(clean.length);
    for (var i = 0; i < clean.length; i++) bytes[i] = clean.charCodeAt(i) - 0x2800;

    var checksum = bytes[0];
    var payload = bytes.slice(1);

    var sum = 0;
    for (var i = 0; i < payload.length; i++) sum = (sum + payload[i]) % 256;

    if (sum !== checksum) {
      return "数据指纹校验失败！密文可能在传输中被平台截断或篡改。";
    }

    var decompressed = LZString.decompressFromUint8Array(payload);
    if (decompressed === "") return "";  // empty is valid content
    if (!decompressed) return "解压内容为空";
    return decompressed;
  } catch(e) {
    return "盲文解码错误: " + (e.message || e);
  }
}

// ---- 8. 核心价值观 (Base8 编码) ---- //
var CORE_VALUES = ["富强", "民主", "文明", "和谐", "自由", "平等", "公正", "法治"];
var CONNECTORS = ["要坚持", "、", "，", "与", "以及", "全面落实", "积极践行", "，深刻领会", "的深刻内涵，"];

function encodeCoreValue(text) {
  var indices = compressToBase64Indices(text);
  var out = "社会主义核心价值观提示我们：";
  for (var i = 0; i < indices.length; i++) {
    var idx = indices[i];
    out += CORE_VALUES[Math.floor(idx / 8)];
    if (Math.random() > 0.5) out += CONNECTORS[Math.floor(Math.random() * CONNECTORS.length)];
    out += CORE_VALUES[idx % 8];
    if (i !== indices.length - 1 && Math.random() > 0.3) {
      out += CONNECTORS[Math.floor(Math.random() * CONNECTORS.length)];
    }
  }
  return out + "！";
}

function decodeCoreValue(text) {
  var matches = text.match(/(富强|民主|文明|和谐|自由|平等|公正|法治)/g);
  if (!matches) return "未检测到核心价值观载荷";

  var indices = [];
  for (var i = 0; i < matches.length; i += 2) {
    if (i + 1 >= matches.length) {
      // 单个残留的词（不应发生），尝试用最后一位补位后丢弃
      break;
    }
    var v1 = CORE_VALUES.indexOf(matches[i]);
    var v2 = CORE_VALUES.indexOf(matches[i + 1]);
    if (v1 !== -1 && v2 !== -1) {
      indices.push(v1 * 8 + v2);
    }
  }
  if (indices.length === 0) return "未检测到核心价值观载荷";
  return decompressFromBase64Indices(indices);
}

// ---- 9. 纯Emoji (静态一一映射) ---- //
function encodeEmojiStatic(text) {
  var indices = compressToBase64Indices(text);
  var noise = [' ✨ ', ' 👉 ', ' 💦 ', ' 🍃 ', ' 🍀 ', ' 💤 ', ' ', '，'];
  var out = "🤐";
  for (var i = 0; i < indices.length; i++) {
    out += DICT_EMOJIS[indices[i]];
    if (Math.random() > 0.7) {
      out += noise[Math.floor(Math.random() * noise.length)];
    }
  }
  return out + "🤐";
}

function decodeEmojiStatic(text) {
  var sortedEmojis = DICT_EMOJIS.slice().sort(function(a, b) { return b.length - a.length; });
  var escaped = sortedEmojis.map(function(e) { return e.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); });
  var regex = new RegExp('(' + escaped.join('|') + ')', 'gu');

  var cleanText = text.replace(/🤐/g, '');
  var matches = cleanText.match(regex);
  if (!matches) return "未检测到有效Emoji或者内容已损坏";

  var indices = matches.map(function(m) { return DICT_EMOJIS.indexOf(m); }).filter(function(idx) { return idx !== -1; });

  try {
    return decompressFromBase64Indices(indices);
  } catch(e) {
    return "解码错误: " + (e.message || e);
  }
}
