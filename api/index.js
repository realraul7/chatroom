var fs = require('fs');
module.exports = {
  registerApi: function(app) {
    var Controllers = require('../controllers');
    var bcrypt = require('bcryptjs');
    var SALT_WORK_FACTOR = 10;
    app.get('/api/findByName', function(req, res) {

      Controllers.User.findUserByName(req.query.name, function(err, data) {
        if (!err) {
          if (data) {
            res.json(data);
          } else {
            res.send('查询不到数据');
          }
        } else {
          res.json({
            meg: err
          })
        }
      })
    })
    app.get('/api/validate', function(req, res) {
      var _userId = req.session.userId;

      if (_userId) {
        Controllers.User.findUserById(_userId, function(err, user) {
          if (err) {
            res.json(401, {
              msg: err
            })
          } else {
            res.json(user);
          }
        })
      } else {
        res.json(401, null);
      }
    });
    app.post('/api/login', function(req, res) {

      Controllers.User.CheckLogin(req.body.account, function(err, data) {
        if (err) {
          res.json(500, {
            mes: err
          });
        } else {
          if (data) {

            bcrypt.compare(req.body.password,data.password,function(err,isMatch){
              if(isMatch){
                req.session.userId = data._id;
                res.json({
                  code:1,
                  user:data
                });
              }
              else {
                                //密码错误
                                res.json({
                                  code:0,
                                  mes:'密码错误'
                                });
                              }
                            })


          }
                    else{//用户不存在
                      res.json({
                        code:0,
                        mes:'用户不存在'
                      });
                    }
                    
                  }
                })
    });
    app.get('/api/logout', function(req, res) {
      req.session.userId = null;
      res.json(401);
    });
    app.post('/api/register', function(req, res) {
      var final_pwd = null;
      bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
        if (err) {
          res.json(500, {
            mes: err
          });
        } else {
          bcrypt.hash(req.body.password, salt, function(err, hash) {
            if (err) {
              res.json(500, {
                mes: err
              });
            } else {
              final_pwd = hash;
              Controllers.User.CreateUser(req.body.email, req.body.username, final_pwd, function(err, data) {
                if (err) {
                  res.json(500, {
                    mes: err
                  });
                } else {
                  res.json(data);
                }
              })
            }
          })
        }
      });

    })


    app.post('/api/createRoom', function(req, res) {
      Controllers.Room.CreateRoom(req.body.name, function(err, data) {
        if (err) {
          res.json(500, {
            mes: err
          });
        } else {
          res.json(data);
        }
      })
    });
    app.post('/api/findRoomByName', function(req, res) {
      Controllers.Room.findRoomByName(req.body.name, function(err, data) {
        if (err) {
          res.json(500, {
            mes: err
          });
        } else {
          res.json(data);
        }
      })
    });
    app.post('/api/getOnlineUser', function(req, res) {
      Controllers.User.getOnlineUser(req.body.roomId, function(err, data) {
        if (err) {
          res.json(500, {
            mes: err
          });
        } else {
          res.json(data);
        }
      })
    });
    app.post('/api/getMessagesByRoomId', function(req, res) {
      Controllers.Message.findMessagesByRoomId(req.body.roomId, function(err, data) {
        if (err) {
          res.json(500, {
            mes: err
          });
        } else {
          res.json(data);
        }       
      })
    });
     app.post('/UploadImage', function(req, res){
        console.log(req); 
     });
  }
}
