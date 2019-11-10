const request = require('request');
const cheerio = require('cheerio');
const controlCodeLanguage = require('./controlCodeLanguage');

class Gist {
  constructor(src) {
    this.src = src;
  }

  getGistSrc() {
    return new Promise((resolve) => {
      request(this.src, (error, response, body) => {
        const $ = cheerio.load(body);
        const gistSrc = $('script').attr('src');
        resolve(gistSrc);
      });
    });
  }

  getMarkdown() {
    const parseGistDom = (gistSrc) => {
      return new Promise((resolve) => {
        request(gistSrc, (error, response, body) => {
          resolve(body);
        });
      });
    }
    return new Promise((resolve) => {
      this.getGistSrc().then((gistSrc) => {
        parseGistDom(gistSrc).then((body) => {
          resolve(this.parseGistDom(body));
        })
      });
    })
  }

  parseGistDom(body) {
    const getCodeContent = (content) => {
      const removeEscapedChar = href => href.slice(2, -2);
      const startIndex = content.lastIndexOf('document.write') + 16;
      const $ = cheerio.load(content.slice(startIndex, -2));
      const codeHref = removeEscapedChar($('a').first().attr('href'));
      const codeType = codeHref.slice(codeHref.lastIndexOf('.') + 1);
      return new Promise((resolve) => {
        request(codeHref, (error, response, body) => {
          resolve(`${'```'}${controlCodeLanguage[codeType]}\n${body}\n${'```'}`);
        });
      });
    };

    return getCodeContent(body);
  }
}

module.exports = Gist;