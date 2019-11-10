const http = require('http');
const request = require('request');
const cheerio = require('cheerio');
const Markdown = require('./Markdown');

const port = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello World!\n');
  const printRes = (content) => {
    res.end(content);
  };
  const mediumArticleUrl = 'https://medium.com/enjoy-life-enjoy-coding/react-redux-%E5%B0%8F%E5%AD%A9%E5%AD%90%E6%89%8D%E5%81%9A%E9%81%B8%E6%93%87-hooks-%E5%92%8C-redux-%E6%88%91%E5%85%A8%E9%83%BD%E8%A6%81-1fdd226f5d99';

  request(mediumArticleUrl, async (error, response, body) => {
    const $ = cheerio.load(body);
    const markdown = new Markdown($);
    let result = markdown.getArticleHeader();
    markdown.getArticleContent(printRes);
  });
});

server.listen(port, () => console.log(`Listening on ${PORT}`));
