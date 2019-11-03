function reconvertUnicode(str) {
    str = str.replace(/(\\u)(\w{1,4})/gi, function($0) { 
      return (String.fromCharCode(parseInt((escape($0).replace(/(%5Cu)(\w{1,4})/g,"$2")),16))); 
    }); 
    str = str.replace(/(&#x)(\w{1,4});/gi, function($0) { 
      return String.fromCharCode(parseInt(escape($0).replace(/(%26%23x)(\w{1,4})(%3B)/g,"$2"),16)); 
    }); 
    str = str.replace(/(&#)(\d{1,6});/gi, function($0) { 
      return String.fromCharCode(parseInt(escape($0).replace(/(%26%23)(\d{1,6})(%3B)/g,"$2"))); 
    }); 
    return str; 
}

module.exports = reconvertUnicode;
