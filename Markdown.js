const reconvertUnicode = require('./utils');

class Markdown {
  constructor($) {
    this.$ = $;
  }

  getArticleTitle() {
    return this.$('meta[property="og:title"]').first().attr('content');
  }

  getArticleDate() {
    let result = '';
    const month = { 'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04', 'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08', 'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'};
    const isThisYear = (dateArray) => dateArray.length === 2;
    const date = this.$('div .ew a[rel="noopener"]').eq(2).text();
    const dateArray = date.split(' ');
    if (isThisYear(dateArray)) {
      const now = new Date();
      result = `${now.getFullYear()}-${month[dateArray[0]]}-${dateArray[1]}`;
    } else {
      result = `${dateArray[0]}-${month[dateArray[1]]}-${dateArray[2]}`;
    }
    return `${result} 00:00:00`;
  }

  getArticleTags() {
    const isTag = (targetDom) => {
      const href = targetDom.attr('href');
      return href && href.indexOf('tag') !== -1;
    };
    let result = '';
    const tags = this.$('ul li a');
    const tagKeys = Object.keys(tags);
    tagKeys.forEach((key) => {
      const targetDom = tags.eq(key);
      if (isTag(targetDom)) {
        result += `\n- ${targetDom.text()}`;
      }
    });
    return result;
  }

  getArticleHeader() {
    let result = '---\n';
    result += `title: ${this.getArticleTitle()}\n`;
    result += `date: ${this.getArticleDate()}\n`;
    result += `tags: ${this.getArticleTags()}\n`;
    result += '---\n\n';
    return result;
  }

  parseMedium(mediumDOM) {
    const domContent = reconvertUnicode(this.$(mediumDOM).html());
    switch(mediumDOM.name) {
      case 'h1':
        return `## ${domContent}\n\n`;
      case 'h2':
        return `### ${domContent}\n\n`;
      case 'p':
        return `${domContent}\n\n`;
      case 'pre':
        return `<pre>${domContent}</pre>\n\n`;
      case 'noscript':
        if (domContent.indexOf('img')) {
          return `<div>${domContent.replace('width', '').replace('height', '')}</div>\n\n`;
        }
        return '';
      default:
        return '';
    }
  }

  getArticleContent() {
    const isNotArticleContent = partIndex => partIndex === 1;
    let result = '';
    const that = this;
    const articleContent = this.$('article div').first().contents();
    articleContent.map(function (partIndex) {
      if (this.name === 'section') {
        // 如果是第一個 section，就清除第一個 div 裡的所有內容
        if (isNotArticleContent(partIndex)) {
          that.$('div', this).first().text('');
        }
        that.$('div', this).contents().map(function () {
          result += that.parseMedium(this);
        });
      } else if (this.name === 'hr') {
        result += '\n---\n';
      }
    });
    return result;
  }
}

module.exports = Markdown;
