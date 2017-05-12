'use strict';
const express = require('express');
const template = require('art-template');
const bodyParser = require('body-parser');
const router = require('./router.js');
const session = require('express-session'); //处理session
var expressJwt = require('express-jwt');
var jwt = require('jsonwebtoken');
let app = express();
//配置模板 开始
template.config('cache', false);
app.set('views', './views');
app.engine('html', template.__express);
app.set('view engine', 'html')
    //模板结束


//解析body数据
app.use(bodyParser.urlencoded({ extended: false }));
//处理静态资源文件
app.use('/public', express.static('public'));
app.use('/views', express.static('views'));
app.use('/check', expressJwt({ secret: 'shhhhhhared-secret' }));
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
}))

app.use(router);

//处理异常
app.use(function(err, req, res, next) {
    console.log('出异常了', err.stack);
    next();
});
app.listen(80, () => {
    console.log('服务器启动了');
});
