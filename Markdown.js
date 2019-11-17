const reconvertUnicode = require('./utils');
const Gist = require('./Gist');

class Markdown {
  constructor($) {
    this.$ = $;
  }

  getArticleTitle() {
    return this.$('meta[property="og:title"]').first().attr('content');
  }

  getArticleDate() {
    const dateString = this.$('meta[property="article:published_time"]').first().attr('content');
    return dateString.replace('T', ' ').split('.')[0];
  }

  getArticleTags() {
    const isTag = (targetDom) => {
      const href = targetDom.attr('href');
      return href && href.indexOf('tag') !== -1;
    };
    let result = '[';
    const tags = this.$('ul li a');
    const tagKeys = Object.keys(tags);
    tagKeys.forEach((key) => {
      const targetDom = tags.eq(key);
      if (isTag(targetDom)) {
        result += `${targetDom.text()},`;
      }
    });
    result += ']';
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

  parseIframe(iframeDom) {
    const getIframeKind = (src) => {
      if (src.indexOf('medium') !== -1) {
        return 'gist';
      }
      return '';
    };
    const iframeSrc = this.$(iframeDom).find('iframe').attr('src');
    switch(getIframeKind(iframeSrc)) {
      case 'gist': {
        const parseProcess = new Gist(iframeSrc);
        return parseProcess.getMarkdown();
      }
      default:
        return `<iframe src="${iframeSrc}"></iframe>`
    }
  }

  parseMedium(mediumDOM) {
    const isImage = content => content.indexOf('noscript') !== -1;
    const isIframe = content => content.indexOf('iframe') !== -1;
    const handleImage = (content) => {
      const removeWidthAndHeight = image => this.$(image).removeAttr('height').removeAttr('width');
      const image = this.$(content).find('noscript').html();
      return `${removeWidthAndHeight(image)}<br/>`;
    }
    const domContent = reconvertUnicode(this.$(mediumDOM).html());
    return new Promise((resolve) => {
      switch(mediumDOM.name) {
        case 'h1':
          resolve(`## ${domContent}`);
          break;
        case 'h2':
          resolve(`### ${domContent}`);
          break;
        case 'p':
          resolve(`${domContent}`);
          break;
        case 'pre':
          resolve(`<pre>${domContent}</pre>`);
          break;
        case 'ol':
          resolve(`<ol>\n${domContent}\n</ol>`);
          break;
        case 'ul':
          resolve(`<ul>\n${domContent}\n</ul>`);
          break;
        case 'blockquote':
          const blockquoteStyle = 'font-size: 26px; color: #696969; font-style:italic';
          resolve(`<span style="${blockquoteStyle}">${this.$(domContent).text()}</span>`);
          break;
        case 'figure': // 有圖片和 iframe 兩種
          if (isImage(domContent)) {
            resolve(handleImage(mediumDOM));
            break;
          }
          if (isIframe(domContent)) {
            resolve(
              new Promise((resolve) => {
                resolve(this.parseIframe(mediumDOM));
              })
            );
            break;
          }
        default:
          resolve('');
      }
    })
  }

  parseParagraph(that, paragraph, paragraphIndex) {
    const getParagraphContent = section => {
      return this.$('h1, h2, p, pre, ol, ul, blockquote, figure', section);
    }
    if (paragraph.name === 'section') {
      const mainContent = getParagraphContent(paragraph);
      const parseMediumPromiseArray = [];
      that.$(mainContent).map(
        function() { parseMediumPromiseArray.push(that.parseMedium(this)); }
      );
      return new Promise((resolve) => {
        resolve(Promise.all(parseMediumPromiseArray));
      });
    } else if (paragraph.name === 'hr') {
      return new Promise((resolve) => {
        resolve('---');
      });
    }
  }

  getArticleContent(writeRes) {
    const that = this;
    const articleContent = this.$('article div').first().contents();
    const parseContentPromiseArray = [];
    articleContent.map(function (partIndex) {
      const currentParagraph = this;
      parseContentPromiseArray.push(
        that.parseParagraph(that, currentParagraph, partIndex)
      );
    });
    Promise.all(parseContentPromiseArray).then((markdownContents) => {
      let result = '';
      // console.log('markdownContents', markdownContents)
      markdownContents
        .filter(markdownContent => markdownContent !== undefined)
        .forEach((markdownContent) => {
          if(Array.isArray(markdownContent)) {
            result += markdownContent.join('\n\n');
          } else {
            result += `\n\n${markdownContent}\n\n`
          }
        })
      writeRes(`${this.getArticleHeader()}\n${result}`);
    });
  }
}

module.exports = Markdown;
