var app = angular.module('chatRoom', ['ui.router']);
//router
app.config(function($stateProvider, $urlRouterProvider){
  $urlRouterProvider.when("", "/Index");
  $stateProvider
  .state("Index", {
    url: "/index",
    templateUrl: "/pages/main.html"
  })
  .state("Index.Home", {
    url: "/room",
    templateUrl: "/pages/home.html",
    controller: 'HomeCtrl'
  })
  .state("Index.Index", {
    url: "/login",
    templateUrl: "/pages/index.html",
    controller: 'IndexCtrl'
  })
});
//启动模块
app.run(function($window, $rootScope, $http, $state){
  $http({
    url: '/api/validate',
    method: 'GET'
  }).success(function(user) {
    $rootScope.me = user;
    $state.go('Index.Home');
    }).error(function(data) {
      $state.go('Index.Index');
  });
    $rootScope.logout = function(){
      $http({
        url: '/api/logout',
        method: 'GET'
      }).success(function(){
        $rootScope.me = null;
        $location.path('/login');
      })
    };
    $rootScope.$on('login', function(evt, me){
      $rootScope.me = me;
    })
  })
    //service
    app.factory('socket', function($rootScope){
      var socket = io.connect('/');
      return {
        on: function(eventName, callback){
          socket.on(eventName, function(){
            var args = arguments;
            $rootScope.$apply(function(){
              callback.apply(socket, args);
            });
          });
        },
        emit: function(eventName, data, callback){
          socket.emit(eventName, data, function(){
            var args = arguments;
            $rootScope.$apply(function(){
              if (callback) {
                callback.apply(socket, args);
              }
            })
          })
        }
      }
    });
//controller
app.controller('IndexCtrl', function($scope, $state, socket, $http, $rootScope){
  $('#login-btn').click(function(){
    $('#login-modal').modal();
  });
  $('#register-btn').click(function(){
    $('#register-modal').modal();
  });
  $scope.LoginProcess = function(){
    var account = $('#login-username').val(), password = $('#login-password').val();
    $http({
      url: '/api/login',
      method: 'POST',
      data: {
        account: account,
        password: password
      }
    }).success(function(data){
      if (data.code == 1) {
        $('#login-modal').modal('hide');
              //alert('登录成功，一秒后进入主页');
              $rootScope.me = data.user;
              setTimeout(function(){
                $state.go('Index.Home');
              }, 300);
            } else {
              alert(data.mes);
            }

          }).error(function(data) {
            alert('服务器错误')
          })
          return false;
        }
        $scope.RegisterProcess = function(){
          var email = $('#signup-email').val(),
          username = $('#signup-username').val(),
          password = $('#signup-password').val(),
          repassword = $('#signup-repassword').val();
      //前端校验
      if (!/^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$/.test(email)) {
        alert('请输入正确的邮箱');
        return;
      }
      if (username.length < 8) {
        alert('用户名必须大于等于8位');
        return;
      }
      if (!/[a-z0-9A-Z]{8,}/.test(username)) {
        alert('请输入正确的用户名，只能包括大写小写字符和数字');
        return;
      }
      if (password.length < 8) {
        alert('密码长度必须大于等于8位');
        return;
      }
      if (password !== repassword) {
        alert('两次输入密码不同');
        return;
      }

      $http({
        url: '/api/register',
        method: 'POST',
        data: {
          email: email,
          username: username,
          password: password
        }
      }).success(function(user){
        alert('注册成功,请登录')
      }).error(function(data) {
        if (data.mes.code == 11000) {
          alert('用户名已经被注册');
        }
      })
    };
    $scope.logout = function(){
      $http({
        url: '/api/logout',
        method: 'GET'
      }).success(function(user){
        $state.go('Index.Index');
      }).error(function(data){
        alert('登出失败')
      })
    }
  });
/**
 *  Home Controller
 *  
 */
 app.controller('HomeCtrl', function($scope, $sce, $state, socket, $http){
    $scope.room_process_hide = true;//操作room的bar是否可见
    $scope.user_list_show = false;
    $scope.user_list_btn_text = "查看在线用户";
    $scope.room_list = [];//显示的房间列表  
    $scope.room ={};//当前的房间
    $scope.messageList = [];
    $scope.is_face_box_show = false;
    $scope.showUserList = function() {
      $scope.user_list_show = true;
      $scope.OnlineUserList = null;
      if($scope.user_list_btn_text === "查看在线用户") {
        $scope.user_list_btn_text = "关闭用户列表"
        $('.user-list-loading').show();
        setTimeout(function(){
          //更新在线用户列表
          $http({
            url: '/api/getOnlineUser',
            method: 'POST',
            data: {
              roomId: $scope.room.id
            }
          }).success(function(data){ 
            $scope.OnlineUserList = data;
            $('.user-list-loading').hide();
          }).error(function(data){
            console.log(data);
            $('.user-list-loading').hide();
          });
        }, 1000);
      }
      else {
        $scope.user_list_btn_text = "查看在线用户";
        $scope.user_list_show = false;
      }
    }
    $scope.toggleFaceBox = function(){
      $scope.is_face_box_show = !$scope.is_face_box_show;
    }
    $('.faceBoxWrap a').click(function(){
      insertText($('.chat-input')[0], '['+ $(this).attr('title') +']');
      $scope.is_face_box_show = false;
    });
    function ChatPanelInit(){
      $scope.user_list_show = false;
      $scope.user_list_btn_text = "查看在线用户";
      $('.right-wrap')[0].style.cssText = "-webkit-transition: all .2s ease;-webkit-transform: scale(0);opacity:0; ";
      setTimeout(function(){
        $('.right-wrap')[0].style.cssText = "-webkit-transition: all .2s ease;-webkit-transform: scale(1);opacity:1; ";
      },200);
      $scope.messageList = [];
         $http({
           url: '/api/getMessagesByRoomId',
           method: 'POST',
           data: {
             roomId: $scope.room.id
           }
         }).success(function(data){ 
           $scope.messageList = data;
           setTimeout(function(){
             $('.chat-content-panel ul>li:last-child')[0]&&$('.chat-content-panel ul>li:last-child')[0].scrollIntoView();
           }, 500);
         }).error(function(data){
           console.log(data);
         });
         // 光标默认为选中
         $('.chat-input')[0].focus();
       };
       $scope.changeRoomProcessMode = function(arg){
        //
        $('.new-search-input').val('')
        if (arg === 0) {
          if($scope.room_process ==="新建"&&$scope.room_process_hide ==false){
            $scope.room_process_hide = true;          
            return;
          }
          $scope.room_process = "新建";
          $scope.btn_style = "btn-success";
          $scope.room_process_hide = false;
        } else if (arg === 1) {
          if($scope.room_process ==="搜索"&&$scope.room_process_hide == false){
            $scope.room_process_hide = true;
            return;
          }
          $scope.btn_style = "btn-primary";
          $scope.room_process = "搜索";
          $scope.room_process_hide = false;
        }
        
      };
      $scope.roomprocess = function(){
        var roomName = $('.new-search-input').val();
        if ($scope.room_process === "新建") {
          if (roomName.length < 1) {
            alert('请输入房间名');
            return;
          }
          $http({
            url: '/api/createRoom',
            method: 'POST',
            data: {
              name: roomName
            }
          }).success(function(user){
            $http({
              url: '/api/findRoomByName',
              method: 'POST',
              data: {
                name: ''
              }
            }).success(function(data){
              $scope.room_list = data;
            }).error(function(data){
              alert('更新房间列表失败');
            })
          }).error(function(data){
            alert('创建房间失败');
          })
        } else if ($scope.room_process = "搜索") {
          searchRoom($http, $scope, roomName);
        }
      }

      
      $scope.logout = function(){
        $http({
          url: '/api/logout',
          method: 'GET'
        }).success(function(user){
          $state.go('Index.Index');
        }).error(function(data) {
          alert('登出失败')
        })
      };
    /**
     * 进入房间
     */
     $scope.openRoom = function(roomId,roomName){
       if(roomId === $scope.room.id) return;
       socket.emit('joinRoom',{fromId:$scope.room.id,toId:roomId,userId:$scope.me._id,userName:$scope.me.username});
       $scope.room.id = roomId;
       $scope.room.name = roomName;
       ChatPanelInit();
     }
     /**
     * 离开房间
     */
     $scope.closeRoom = function(){
       $scope.room.id = null;
       $('.right-wrap').hide();
       socket.emit('leaveRoom');
     }
    /**
     * 消息处理
     * 
     */
     
     socket.emit('getAllMessages');
     socket.on('allMessages', function(messages){
       $scope.messageList = messages;
     });
     socket.on('messageAdded', function(message){
       $scope.messageList.push(message);
     });
     $('.chat-input').val('');
     $scope.createMessage = function(){

       if ($('.chat-input').val() == '') {
         return;
       }
       var newMessage = {};
       newMessage.creator=$scope.me;
       newMessage.content=$('.chat-input').val();
       newMessage.roomId = $scope.room.id;
       socket.emit('createMessage', newMessage);
       $('.chat-input').val('');
     }
    $scope.TrustDangerousSnippet = function(message) {
      return $sce.trustAsHtml(processChatContent(message.content));
    }; 
    /**
     * 监听并处理其他用户进入当前房间
     */
     socket.on('userIn',function(message){
        //更新在线用户列表
        $http({
          url: '/api/getOnlineUser',
          method: 'POST',
          data: {
            roomId: $scope.room.id
          }
        }).success(function(data){ 
          $scope.OnlineUserList = data;
        }).error(function(data){
          console.log(data);
        });
          //系统发布用户进入消息
          $scope.messageList.push({
            creator: { username: '系统中心' },
            content: '用户"'+message.username+'"进入房间'
          })
        });
    /**
     * 监听并处理用户退出逻辑
     */
     socket.on('userLeave', function(message){
         //更新在线用户列表
         $http({
           url: '/api/getOnlineUser',
           method: 'POST',
           data: {
             roomId: $scope.room.id
           }
         }).success(function(data){ 
           $scope.OnlineUserList = data;
         }).error(function(data){
           console.log(data);
         });
        //系统发布用户离开消息
        $scope.messageList.push({
          creator: { username: '系统中心' },
          content: '用户"'+message.username+'"离开房间'
        })
      });
     // 进入页面后加载默认房间
    searchRoom($http, $scope, '');
   });





app.controller('RoomCtrl', function($scope, socket){
  $scope.messages = [];
  socket.emit('getAllMessages');
  socket.on('allMessages', function(messages){
    $scope.messages = messages;
  })
  socket.on('messageAdded', function(message){
    $scope.messages.push(message);
  })
});
app.controller('MessageCreatorCtrl', function($scope, socket){
  $scope.mewMessage = '';
  $scope.createMessage = function(){

    if ($scope.newMessage == '') {
      return;
    }
    socket.emit('createMessage', $scope.newMessage);
    $scope.newMessage = '';
  }
});
app.controller('LoginCtrl', function($scope, $http, $state){
  $scope.login = function(){
    $http({
      url: '/api/login',
      method: 'POST',
      data: {
        email: $scope.email
      }
    }).success(function(user){
      $scope.$emit('login', user);
      $state.go('Index.Room');
    }).error(function(data){
      $state.go('Index.Login');
    })
  }
})

//directive
app.directive('autoScrollToBottom', function(){
  return {
    link: function(scope, element, attrs){
      scope.$watch(function(){
        return element.children().length;
      }, function(){
        if (!$('.chat-content-panel ul>li').length) {
          return;
        }
        $('.chat-content-panel ul>li:last-child')[0]&&$('.chat-content-panel ul>li:last-child')[0].scrollIntoView();
      })
    }
  }
});
app.directive('ctrlEnterBreakLine', function(){
  return function(scope, element, attrs){
    var ctrlDown = false;
    element.bind("keydown", function(evt){
      if (evt.which === 17) {
        ctrlDown = true;
        setTimeout(function(){
          ctrlDown = false
        }, 1000);
      };
      if (evt.which === 13) {
        if (ctrlDown) {
          element.val(element.val() + '\n');
        } else {
          scope.$apply(function(){
            scope.$eval(attrs.ctrlEnterBreakLine);
          })
          evt.preventDefault();
        }
      }
    })
  }
});
app.directive('loading', function() {
  var html = ['<div class="spinner">',
    '  <div class="spinner-container container1">',
    '    <div class="circle1"></div>',
    '    <div class="circle2"></div>',
    '    <div class="circle3"></div>',
    '    <div class="circle4"></div>',
    '  </div>',
    '  <div class="spinner-container container2">',
    '    <div class="circle1"></div>',
    '    <div class="circle2"></div>',
    '    <div class="circle3"></div>',
    '    <div class="circle4"></div>',
    '  </div>',
    '  <div class="spinner-container container3">',
    '    <div class="circle1"></div>',
    '    <div class="circle2"></div>',
    '    <div class="circle3"></div>',
    '    <div class="circle4"></div>',
    '  </div>',
    '</div>'].join("");
    return {
        restrict: 'E',
        template: html,
        replace: true
    };
});
function searchRoom(_http, _scope, name) {
  $('.room-list-loading').show();
  setTimeout(function(){
    _http({
      url: '/api/findRoomByName',
      method: 'POST',
      data: {
        name: name
      }
    }).success(function(data){
      _scope.room_list = data;
      $('.room-list-loading').hide();
    }).error(function(data){
      alert('搜索房间失败');
      $('.room-list-loading').hide();
    });
  }, 1000);
}
function insertText(obj,str) {
    if (document.selection) {
        var sel = document.selection.createRange();
        sel.text = str;
    } else if (typeof obj.selectionStart === 'number' && typeof obj.selectionEnd === 'number') {
        var startPos = obj.selectionStart,
            endPos = obj.selectionEnd,
            cursorPos = startPos,
            tmpStr = obj.value;
        obj.value = tmpStr.substring(0, startPos) + str + tmpStr.substring(endPos, tmpStr.length);
        cursorPos += str.length;
        obj.selectionStart = obj.selectionEnd = cursorPos;
    } else {
        obj.value += str;
    }
    obj.focus();
}
function processChatContent(str) {
temp = ['微笑','撇嘴','色','发呆','得意','流泪','害羞','闭嘴','睡','大哭','尴尬','发怒','调皮','呲牙','惊讶','难过',
    '酷','冷汗','抓狂','吐','偷笑','愉快','白眼','傲慢','饥饿','困','惊恐','流汗','憨笑','悠闲','奋斗','咒骂','疑问',
    '嘘','晕','疯了','衰','骷髅','敲打','再见','擦汗','抠鼻','鼓掌','糗大了','坏笑','左哼哼','右哼哼','哈欠','鄙视',
    '委屈','快哭了','阴险','亲亲','吓','可怜','菜刀','西瓜','啤酒','篮球','乒乓','咖啡','饭','猪头','玫瑰','凋谢','嘴唇',
    '爱心','心碎','蛋糕','闪电','炸弹','刀','足球','瓢虫','便便','月亮','太阳','礼物','拥抱','强','弱','握手','胜利',
    '抱拳','勾引','拳头','差劲','爱你','NO','OK','爱情','飞吻','跳跳','发抖','怄火','转圈','磕头','回头','跳绳','投降',
    '激动','乱舞','献吻','左太极','右太极'];
    for (var i = 0; i < temp.length; i++) {
      str = str.replace('['+temp[i]+']', '<span class="icons icons-smiley_'+i+'"></span>');
    }
    return str;
}



