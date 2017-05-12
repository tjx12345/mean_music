'use strict';
const config = require('../config');
const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://' + config.db_host + ':' + config.db_port + '/' + config.db_database;
const captchapng = require('captchapng');
var jwt = require('jsonwebtoken');

exports.findUser = (obj, callback) => {
        MongoClient.connect(url, function(err, db) {
            console.log('数据库连接成功');
            //获取集合对象
            let userCollection = db.collection('users');
            console.log('find users:', obj)
            userCollection.find(obj).toArray(function(err, users) {
                db.close(); //关闭连接
                callback(err, users); //我不去处理异常了，由;外部来处理
            });

        });
    }
    // let obj = {
    //     showRegister
    // }

// module.exports = obj


exports.getToken = function(req, res, next) {
    let user = {};

}




//module.exports默认是导出一个空对象，如果你赋值，也是拿到的module.exports这个对象
exports.showRegister = function(req, res, next) {
    //接受数据
    let name = req.query.name; // /register?name=jack
    //操作数据
    //使用name作为条件查询数据
    exports.findUser({ name }, function(err, users) {
        if (err) next(err);
        res.render('register')
    });
};
exports.checkUserName = (req, res, next) => {
    let username = req.body.username;

    exports.findUser({ username }, function(err, users) {
        if (err) return next(err);
        if (users.length != 0) {
            res.json({ code: '001', msg: '用户名已经存在!' });
        } else {
            res.json({ code: '002', msg: '恭喜可以注册!' });
        }
    });

};

/**
 * 处理注册
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
exports.doRegister = (req, res, next) => {
    //获取请求数据post
    let username = req.body.username;
    let email = req.body.email;
    let password = req.body.password;
    let vcode = req.body.vcode;

    //获取vcode
    let sessionVcode = req.session.vcode;
    if (vcode != sessionVcode) {
        return res.json({ code: '003', msg: '验证码错误！' });
    }

    //判断vcode ，技术有限，先缓缓

    //判断用户名是否存在
    MongoClient.connect(url, function(err, db) {
        if (err) return next(err);
        let userCollection = db.collection('users');
        userCollection.find({ username }).toArray(function(err, users) {
            if (err) return next(err);
            if (users.length != 0) {
                db.close();
                return res.json({ code: '002', msg: '用户名已经存在' });
            }
            //没有该用户，保存该用户数据
            userCollection.insertMany([{
                username,
                email,
                password
            }], function(err, result) {
                if (err) next(err);
                if (result.insertedCount === 1) {
                    res.json({ code: '001', msg: '恭喜注册成功！' })
                }
                db.close(); //关闭连接
            });


        });

    });
};
/**
 * 处理显示登录页面
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
exports.showLogin = (req, res, next) => {
        let username = '';
        let checked = '';
        //原生操作cookie
        // if (typeof req.headers['cookie'] != 'undefined') {
        //     let qs = require('querystring');
        //     //connect.sid=s%3AKoY-YOMdmZvAxqX9gTxBe0SmgyxU2viS.2BWtra%2FNNvcZtBhLjTxDfoLymfVqGOAgBV3lZjtNsGo; username=guangzhou5qi
        //     username = qs.parse(req.headers['cookie']).username;
        // }
        // 使用cookie-parser
        // if (typeof req.cookies.username != "undefined") {
        //     console.log('进来了吗')
        //     username = req.cookies.username;
        //     checked = 'checked';
        // }
        // res.render('login', { username, checked });


        //暂时先不获取cookie
        res.render('login');
    }
    /**
     * 处理登录
     * @param  {[type]}   req  [description]
     * @param  {[type]}   res  [description]
     * @param  {Function} next [description]
     * @return {[type]}        [description]
     */
exports.doLogin = (req, res, next) => {
    //1：接受参数post
    let username = req.body.username;
    let password = req.body.password;
    let rememberme = req.body.rememberme; //这个值有可能是undefined



    //2: 通过username查询数据库，判断该用户是否存在
    exports.findUser({ username }, function(err, users) {
        if (err) next(err);
        if (users.length === 0) { //用户名不存在
            return res.json({ code: '002', msg: '用户名或密码不正确' });
        }
        let user = users[0]; //注册的口被我们阻塞了，不可能出现同一个用户名多个用户的情况,所以此时直接取第一个元素就ok

        //3: 如果用户名存在 比较密码
        if (password != user.password) {
            return res.json({ code: '002', msg: '用户名或密码不正确' });
        }


        var token = jwt.sign(user, 'shhhhhhared-secret');
        res.json({ code: '001', token: token });

    });


};
/**
 * 显示首页
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
exports.showIndex = (req, res, next) => {

        //测试
        if (!req.user) return res.render('index_n');

        let user = req.user;
        //查询数据， 根据当前登录人的id查询相关的音乐歌曲
        let uid = user._id;
        console.log('index:user', user);
        //根据这个ID去查询相关uid=这个id的所有歌曲
        MongoClient.connect(url, function(err, db) {
            //获取集合对象
            let musicsCollection = db.collection('musics');
            musicsCollection.find({ uid }).toArray(function(err, musics) {
                if (err) return next(err);
                //该操作结束
                db.close(); //关闭连接
                res.json({ musics: musics });

            });
        });
    }
    /**
     * 退出
     * @param  {[type]}   req  [description]
     * @param  {[type]}   res  [description]
     * @param  {Function} next [description]
     * @return {[type]}        [description]
     */
exports.logout = (req, res, next) => {
        req.session.user = null; //清除session中的状态
        res.redirect('/login');
    }
    /**
     * 响应验证码并将答案挂载到session上
     * @param  {[type]}   req  [description]
     * @param  {[type]}   res  [description]
     * @param  {Function} next [description]
     * @return {[type]}        [description]
     */
exports.getCaptchaPng = (req, res, next) => {
    var num = parseInt(Math.random() * 9000 + 1000);
    var p = new captchapng(80, 30, num); // width,height,numeric captcha 
    p.color(0, 0, 0, 0); // First color: background (red, green, blue, alpha) 
    p.color(80, 80, 80, 255); // Second color: paint (red, green, blue, alpha) 

    var img = p.getBase64();
    var imgbase64 = new Buffer(img, 'base64');
    res.writeHead(200, {
        'Content-Type': 'image/png'
    });
    console.log(req.user);
    //挂载答案到session上
    req.session.vcode = num;

    // console.log(imgbase64);
    res.end(imgbase64);
}
