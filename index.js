const express = require('express');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const request = require('request');
const fs = require('fs');
const iconv = require('iconv-lite');
const app = express();

app.use(bodyParser.urlencoded({extended: false}));

app.engine('html', ejs.__express);
app.set('view engine', 'html');
app.set('views', './views');

app.get('/', function (req, res) {
    res.render('index', { title: 'Node 爬虫系统',url: '', message: '等待抓取链接'});
});

app.post('/',function (req, res) {
    let url = req.body.url || '';
    let message = '没有URL链接信息';
    if(url){
        let url_info = url.toString().split('/ac');
        let comment_url = `http://www.acfun.cn/comment_list_json.aspx?isNeedAllCount=true&contentId=${url_info[1]}&currentPage=1`;
        let options = {
            url: comment_url,
            headers: { 'User-Agent': 'request' }
        };

        request(options, function callback(error, response, body) {
            if (!error && response.statusCode == 200) {
                let info = JSON.parse(body);
                let comment_content = info.data.commentContentArr;
                let comment_list = info.data.commentList;
                let content = [];
                for(let x in comment_list){
                    // 过滤信息
                    let str = iconv.encode(comment_content['c'+comment_list[x]].content.replace(/\[(.*?)\]/gm,'').replace(/<(.*?)>/gm,'').replace(/\r\n/gm,' ').replace(/\r/gm,' ').replace(/\n/gm,' '), 'utf8');
                    content.push(str);
                }
                // // 评论写入
                fs.writeFileSync(`./comment/${url_info[1]}.txt`, content.join("\r\n").toString());

                message = `写入文件 ./comment/${url_info[1]}.txt 成功，抓取有效评论 ${content.length} 条`;
            } else {
                message = '获取内容失败';
            }
            res.render('index', { title: '爬虫结果 - Node 爬虫系统', url, message});
        });
    } else {
        res.render('index', { title: '爬虫结果 - Node 爬虫系统', url, message});
    }
});

app.listen(3000, function () {
    console.log('Server listening at http://localhost:%s', this.address().port);
});