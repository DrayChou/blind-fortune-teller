// JavaScript Document
// main.js - 幻影计划::MIRAGE 主逻辑

var currentMode = 'MEOW';
var modes = ['MEOW', 'MARTIAN', 'SYMBOLIC', 'BLIND', 'BUDDHA', 'DOGE', 'BRAILLE', 'CORE_VALUE', 'EMOJI_STATIC'];

var modeLabels = {
  MEOW: '喵星密码',
  MARTIAN: '火星文',
  SYMBOLIC: '乱码视界',
  BLIND: '瞎子算命',
  BUDDHA: '与佛论禅',
  DOGE: '狗子汪汪',
  BRAILLE: '点阵盲文',
  CORE_VALUE: '核心价值观',
  EMOJI_STATIC: '纯Emoji'
};

var modeHints = {
  MEOW: '提示: 已将文本全部转化为喵星语"喵咪呜嗷"！这种重复度极高且意义不明的拟声词组合，能直接穿透绝大多数关键词过滤系统。',
  MARTIAN: '提示: 火星文使用异体字替换常见汉字，需人工联系上下文看破。',
  BLIND: '提示: 瞎子算命使用AES加密+天干地支编码，原文以"老衲掐指一算："开头。',
  BUDDHA: '提示: 与佛论禅使用AES加密+佛经字符编码，原文以"佛曰："开头。',
  DOGE: '提示: 狗子汪汪使用4进制汪语编码，以"🐾"开头结尾。',
  BRAILLE: '提示: 点阵盲文使用Unicode盲文点阵编码，肉眼难辨。',
  CORE_VALUE: '提示: 核心价值观使用Base8编码，伪装为社会主义核心价值观宣传语。',
  EMOJI_STATIC: '提示: 纯Emoji使用静态emoji一一映射，以"🤐"开头结尾。',
  SYMBOLIC: '提示: 乱码视界在字符间穿插装饰符号，可通过去符号还原。'
};

var readabilityMap = {
  MEOW: '完全乱码 (需解密)',
  MARTIAN: '需人工联系上下文看破异体字',
  SYMBOLIC: '穿插符号 (解密后可还原)',
  BLIND: '看似古文 (AES加密)',
  BUDDHA: '看似佛经 (AES加密)',
  DOGE: '看似狗叫 (需解密)',
  BRAILLE: '盲文点阵 (肉眼难辨)',
  CORE_VALUE: '看似宣传语 (需解密)',
  EMOJI_STATIC: '看似表情包 (需解密)'
};

$(document).ready(function() {
  // 初始化模式按钮点击事件
  $('.mode-btn').on('click', function() {
    var mode = $(this).data('mode');
    setMode(mode);
  });

  // 设置默认模式
  setMode('MEOW');

  // 更新字符计数
  $('#secret-input').on('input', function() {
    var len = $(this).val().length;
    $('#encode-count').text(len + ' 字符');
  });

  // 清空解密输出当输入变化时
  $('#decode-input').on('input', function() {
    $('#decoded-output').html('<span class="placeholder-text">等待解密...</span>');
  });
});

function setMode(mode) {
  currentMode = mode;

  // 更新按钮状态
  $('.mode-btn').removeClass('active');
  $('.mode-btn[data-mode="' + mode + '"]').addClass('active');

  // 更新侧边栏显示
  $('#current-mode').text(modeLabels[mode]);
  $('#arch-val').text('静态算法 (前端直出)');
  $('#readability-val').text(readabilityMap[mode]);

  // 更新解密区placeholder
  var placeholders = {
    MEOW: '在此粘贴满屏的猫叫声解密原文...',
    MARTIAN: '在此粘贴火星文解密原文...',
    SYMBOLIC: '在此粘贴包含符号的文本...',
    BLIND: '老衲掐指一算...',
    BUDDHA: '佛曰：...',
    DOGE: '🐾...🐾',
    BRAILLE: '在此粘贴盲文点阵...',
    CORE_VALUE: '社会主义核心价值观提示我们...',
    EMOJI_STATIC: '🤐...🤐'
  };
  $('#decode-input').attr('placeholder', placeholders[mode] || '粘贴内容，清除杂讯还原原文...');

  // 清空输出
  $('#cypher-output').val('');
  $('#decoded-output').html('<span class="placeholder-text">等待解密...</span>');
  $('#hint-box').hide();
}

function handleEncode() {
  var text = $('#secret-input').val();
  if (!text) {
    alert('请输入需要隐藏的敏感信息');
    return;
  }

  var result = '';
  try {
    switch (currentMode) {
      case 'MEOW':
        result = encodeMeow(text);
        break;
      case 'MARTIAN':
        result = encodeMartian(text);
        break;
      case 'SYMBOLIC':
        result = encodeSymbolic(text);
        break;
      case 'BLIND':
        result = encodeBlindFortune(text);
        break;
      case 'BUDDHA':
        result = encodeBuddha(text);
        break;
      case 'DOGE':
        result = encodeDoge(text);
        break;
      case 'BRAILLE':
        result = encodeBraille(text);
        break;
      case 'CORE_VALUE':
        result = encodeCoreValue(text);
        break;
      case 'EMOJI_STATIC':
        result = encodeEmojiStatic(text);
        break;
      default:
        result = '未知模式';
    }
  } catch (e) {
    result = '生成错误: ' + String(e);
  }

  $('#cypher-output').val(result);

  // 显示提示
  if (modeHints[currentMode]) {
    $('#hint-box').html(modeHints[currentMode]).show();
  } else {
    $('#hint-box').hide();
  }
}

function handleDecode() {
  var text = $('#decode-input').val();
  if (!text) {
    alert('请输入需要解密的伪装文本');
    return;
  }

  var result = '';
  try {
    switch (currentMode) {
      case 'MEOW':
        result = decodeMeow(text);
        break;
      case 'MARTIAN':
        result = decodeMartian(text);
        break;
      case 'SYMBOLIC':
        result = decodeSymbolic(text);
        break;
      case 'BLIND':
        result = decodeBlindFortune(text);
        break;
      case 'BUDDHA':
        result = decodeBuddha(text);
        break;
      case 'DOGE':
        result = decodeDoge(text);
        break;
      case 'BRAILLE':
        result = decodeBraille(text);
        break;
      case 'CORE_VALUE':
        result = decodeCoreValue(text);
        break;
      case 'EMOJI_STATIC':
        result = decodeEmojiStatic(text);
        break;
      default:
        result = '未知模式';
    }
  } catch (e) {
    result = '解密错误: ' + String(e);
  }

  if (result) {
    $('#decoded-output').text(result);
  } else {
    $('#decoded-output').text('\u672A\u63D0\u53D6\u5230\u4EFB\u4F55\u9690\u85CF\u4FE1\u606F');
  }
}

function copyCypher() {
  var text = $('#cypher-output').val();
  if (!text) return;
  navigator.clipboard.writeText(text).then(function() {
    $('#copy-cypher').text('已复制');
    setTimeout(function() {
      $('#copy-cypher').text('复制');
    }, 1500);
  });
}

// 保留旧API兼容
function encrypt() {
  var msg = $("#text-decryped").val();
  if (msg) {
    setMode('BLIND');
    $('#secret-input').val(msg);
    handleEncode();
  }
}

function decrypt() {
  var msg = $("#text-decryped").val();
  if (msg) {
    setMode('BLIND');
    $('#decode-input').val(msg);
    handleDecode();
  }
}

function copyUrl2() {
  var text = $('#cypher-output').val();
  if (text) {
    navigator.clipboard.writeText(text);
  }
}
