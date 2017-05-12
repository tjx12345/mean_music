'use strict';
const formidable = require('formidable'); //引入解析文件对象
const config = require('../config');
const path = require('path'); //核心对象
const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://' + config.db_host + ':' + config.db_port + '/' + config.db_database;
const ObjectID = require('mongodb').ObjectID;
const querystring = require('querystring');
/**
 * 显示添加音乐
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
exports.showAddMusic = (req, res, next) => {
        res.render('add');
    }
    /**
     * 上传文件
     * @param  {[type]}   req  [description]
     * @param  {[type]}   res  [description]
     * @param  {Function} next [description]
     * @return {[type]}        [description]
     */
exports.doUpload = (req, res, next) => {

    var form = new formidable.IncomingForm();
    form.uploadDir = config.appRootPath + '/public/files'; //服务器磁盘的绝对存储路径
    form.parse(req, function(err, fields, files) {
        if (err) return next(err);
        /*
        - _id 系统自带
        - 编号 id 1 开始，逐渐往上增加(在页面中做处理，下标加1)
        - 歌曲标题 title fields.title
        - 歌曲时长 time fields.time
        - 歌手 singer fields.singer
        - 歌曲存储路径 singsrc path.parse(files.file.path).base获取文件名
        - 歌词存储路径 lrcsrc path.parse(files.filelrc.path).base获取文件名
        - 用户id userid req.session.user._id
         */
        //1:获取数据
        // let title = fields.title;
        // let time = fields.time;
        // let singer = fields.singer;

        //fields.data ->id=66666&title=66666&time=66666&singer=6666
        let title = fields.title;
        let time = fields.time;
        let singer = fields.singer;
        let musicSrc = '/public/files/' + path.parse(files.file.path).base; //音乐src
        let lrcSrc = '/public/files/' + path.parse(files.filelrc.path).base; //歌词src
        let uid = req.user._id;
        //2:存储数据
        MongoClient.connect(url, function(err, db) {
            //获取集合对象
            let musicCollection = db.collection('musics');
            musicCollection.insertMany([{
                title,
                time,
                singer,
                musicSrc,
                lrcSrc,
                uid
            }], (err, result) => {
                if (err) return next(err);

                //3:响应
                //3.1 同步方式响应页面
                // res.render('index'); //过去听歌
                //3.2 异步方式响应？
                //  响应一个json对象
                res.json({
                    code: '001',
                    msg: '哈哈你OK了'
                });
            });

        });
    });
};

exports.showEditMusic = (req, res, next) => {
    //1:接受数据?mid=xxxx
    let _id = ObjectID(req.params.mid);

    //2:操作数据
    MongoClient.connect(url, function(err, db) {
        //获取集合对象
        let musicCollection = db.collection('musics');
        musicCollection.find({ _id }).toArray(function(err, musics) {
            if (err) return next(err);
            if (musics.length === 0) {
                return res.render('info', { msg: '歌曲没有找到' })
            }
            let music = musics[0]; //使用objectID唯一标识查询要么有1条数据，要么没有数据
            //3：响应
            res.json(music);
        });


    })
}
exports.editUpload = (req, res, next) => {
    var form = new formidable.IncomingForm();
    form.uploadDir = config.appRootPath + '/public/files';
    form.parse(req, function(err, fields, files) {
        if (err) return next(err);
        let title = fields.title;
        let time = fields.time;
        let singer = fields.singer;
        //由于需要更新，我们需要获取到歌曲的id作为条件
        let _id = ObjectID(fields._id);
        //封装成一个对象
        let updateObj = {
            title,
            time,
            singer,
        }

        if (files.file) {
            updateObj.musicSrc = '/public/files/' + path.parse(files.file.path).base; //音乐src
        }
        if (files.filelrc) {
            updateObj.lrcSrc = '/public/files/' + path.parse(files.filelrc.path).base; //歌词src
        }

        //2:存储数据
        MongoClient.connect(url, function(err, db) {
            //获取集合对象
            let musicCollection = db.collection('musics');
            //执行更新操作
            musicCollection.updateMany({ _id }, {
                $set: updateObj //{ title:'123',time:123,singer:123 或者加上musicSrc:'123',lrcSrc:123}
            }, function(err, result) {
                if (err) return next(err);
                res.json({ code: '001' });
            });

        });
    });
}
exports.getLrc = function(req, res, next) {
    let path = req.query.path;
    console.log(path);
    require('fs').readFile('.' + path, 'utf8', (err, data) => {
        var lines = data.split('\n');
        var regex = /\[(\d{2})\:(\d{2})\.(\d{2})\](.*)/;
        var obj = {};
        lines.forEach(function(line) {
            var result = regex.exec(line);
            var m = result[1] - 0;
            var s = result[2] - 0;
            var ms = result[3];
            s = (ms[0] - 0) > 5 ? s + 1 : s;
            var content = result[4];
            obj[m * 60 + s] = content;
        });
        res.json(obj);
    })
}
