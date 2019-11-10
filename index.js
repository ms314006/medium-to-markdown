const http = require('http');
const request = require('request');
const cheerio = require('cheerio');
const Markdown = require('./Markdown');

const port = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Content-Type', 'text/html;charset=UTF-8');
  const printRes = (content) => {
    res.end(`<xmp>${content}</xmp>`);
  };

  if (req.url.indexOf('/getMarkdownFrom') !== -1) {
    const getMediumUrl = url => url.slice(url.indexOf('/getMarkdownFrom') + 17);
    const mediumArticleUrl = getMediumUrl(req.url);
    request(mediumArticleUrl, async (error, response, body) => {
      const $ = cheerio.load(body);
      const markdown = new Markdown($);
      markdown.getArticleContent(printRes);
    });
  } else if(req.url === '/favicon.ico') {
    res.end();
  } else {
    res.end('Hi！請在網址上輸入「/getMarkdownFrom/Medium文章網址」進行解析！');
  }
});

server.listen(port, () => console.log(`Listening on ${port}`));
