//全局引入jquery
;(function($){

  "use strict";

  /*说明:获取浏览器前缀*/
  /*实现：判断某个元素的css样式中是否存在transition属性*/
  /*参数：dom元素*/
  /*返回值：boolean，有则返回浏览器样式前缀，否则返回false*/
  var _prefix = (function(temp){
    var aPrefix = ["webkit", "Moz", "o", "ms"],
      props = "";
    for(var i in aPrefix){
      props = aPrefix[i] + "Transition";
      if(temp.style[ props ] !== undefined){
        return "-"+aPrefix[i].toLowerCase()+"-";
      }
    }
    return false;
  })(document.createElement(PageSwitch));

// return了PageSwitch  document.createElement(PageSwitch) 才是一个元素
  
  //pageSwitch对象是每个全屏滚动的页面。element是父元素，options是参数设置
var PageSwitch =(function(){
      function PageSwitch(element, options){
        //this.settings = $.extend(true, $.fn.PageSwitch.default, options||{});
        this.settings = $.extend({},$.fn.PageSwitch.default,options);
        console.log(this.settings);
        console.log("options "+options);
        this.element = element;
        this.init();
      }

      PageSwitch.prototype = {
       
        init : function(){
          var me = this;
          me.selectors = me.settings.selectors;
          
          me.sections =me.element.find(me.selectors.sections);
          me.section = me.sections.find(me.selectors.section);

          me.direction = me.settings.direction == "vertical" ? true : false;

          me.pageCount = me.pageCount();

          me.canscroll = true;

          me.index = (me.settings.index >=0 && me.settings.index < me.pageCount ) ? me.settings.index : 0;
              
            if (!me.direction) {
              me._initLayout()
            }

            if (me.settings.pagination) {
              me._initPaging()
            }

            me._initEvent();

        },
        // 获取滑动页面数量。pageCount能访问init中设置的变量，因为prototype的constructor指向PageSwitch，init函数在构造函数中执行了。 
        pageCount:function(){
          return this.section.length;

        },
        //获取滑动的宽度或高度
        switchLength: function(){
            return me.direction == 1 ? this.element.height() : this.element.width();
        },
        // 针对横屏进行布局
        _initLayout : function(){
          var me = this;

          if(!me.direction){
            var width = (me.pageCount * 100) + "%",
              cellWidth = (100 / me.pageCount).toFixed(2) + "%";
            me.sections.width(width);
            me.section.width(cellWidth).css("float", "left");
          }
          if(me.index){
            me._scrollPage(true);
          }


        },


        //向前滑动，上一页
        preSwitch : function(){
          var me = this ;
           if (me.index > 0) {
            me.index --
           }else if (me.settings.loop){
            me.index = me.pageCount -1
           }
           me._scrollPage();
        },
        //向后滑动，下一页
        nextSwitch : function(){   
           var me = this;  
           if (me.index < me.pageCount -1) {
              me.index ++
           }else if (me.settings.loop) {
             me.index = 0
           }
           me._scrollPage();

        },


        //实现分页的dom结构及css样式
        _initPaging : function(){

          var me = this,
              pagesClass = me.selectors.page.substring(1);
          me.activeClass = me.selectors.active.substring(1);
          var pagesHTML = '<ul class='+ pagesClass +'>';
          for (var i = 0; i < me.pageCount; i++) {
             pagesHTML += '<li></li>'   

          };
          pagesHTML += '</ul>';
          //console.log(pagesHTML);//这里的pagesHTML不是jquery对象？
          me.element.append(pagesHTML);
          //找到相关的DOM节点
          var pages = me.element.find(me.selectors.page);
          me.pageItem = pages.find('li');
          
          //为当前页添加active类名
          me.pageItem.eq(me.index).addClass(me.activeClass);
    
          if (me.direction) {
            pages.addClass('vertical')
          }else{
            pages.addClass('horizontal')
          }   


        },
        //初始化插件事件
        _initEvent : function(){
          var me = this;
            //滚轮事件  
          //绑定多个事件有空格分隔
        me.element.on("mousewheel DOMMouseScroll", function(e){
          e.preventDefault();
          var delta = e.originalEvent.wheelDelta || -e.originalEvent.detail;
          if(me.canscroll){
            if(delta > 0 && (me.index && !me.settings.loop || me.settings.loop)){
              me.preSwitch();
            }else if(delta < 0 && (me.index < (me.pagesCount-1) && !me.settings.loop || me.settings.loop)){
              me.nextSwitch();
            }
          }
        })

        // me.element.on('mousewheel DOMMouseScroll',function(event){
        //      event.preventDefault();
        //      var wheelDelta = event.originalEvent.wheelDelta || -event.originalEvent.detail; //firefox鼠标事件不一致
        //      //鼠标往前滚，向前翻页
        //     if (me.canscroll) {
        //        if (wheelDelta > 0 && (me.index && !me.settings.loop || me.settings.loop)) {
        //          me.preSwitch();
        //        }else if (wheelDelta < 0 && (me.index < (me.pageCount-1) && !me.settings.loop || me.settings.loop)) {}{
        //         me.nextSwitch();
        //        }
        //     }
        // })

          //keydown键盘事件 window下的事件  $(selector).keydown(function) keyCode大写
          if (me.settings.keyboard) {
            $(window).keydown(function(event){
              //press leftarrow or uparrow
              if (event.keyCode == 37 || event.keyCode == 38) {
                me.preSwitch();
              //press rightarrow or downarrow
              }else if (event.keyCode == 39 || event.keyCode == 40) {
                me.nextSwitch();
              }
            })
          }
          //resize事件

           //pages点击切换事件  动态生成的DOM元素要用on绑定事件,第二个参数是，实际触发事件的子元素（.pages li），效果同delegate()
           me.element.on('click',me.selectors.page+' li',function(){
            //重新设定index
            me.index = $(this).index();
            console.log(me.index);
            me._scrollPage();
           })
          /*支持CSS3动画的浏览器，绑定transitionend事件(即在动画结束后调用起回调函数)*/
          // if(_prefix){
          //   me.sections.on("transitionend webkitTransitionEnd oTransitionEnd otransitionend", function(){
          //     me.canscroll = true;
          //     if(me.settings.callback && $.type(me.settings.callback) === "function"){
          //       me.settings.callback();
          //     }
          //   })
          // }

        },       
      _scrollPage : function(init){
        var me = this;
        var dest = me.section.eq(me.index).position();

        if(!dest) return;

        me.canscroll = false;
        //支持css属性
        if(_prefix){
          var translate = me.direction ? "translateY(-"+dest.top+"px)" : "translateX(-"+dest.left+"px)";
          me.sections.css(_prefix+"transition", "all " + me.settings.duration + "ms " + me.settings.easing);
          me.sections.css(_prefix+"transform" , translate);
          me.canscroll = true;
        //不支持css属性
        }else{
          var animateCss = me.direction ? {top : -dest.top} : {left : -dest.left};
          me.sections.animate(animateCss, me.settings.duration, function(){
            me.canscroll = true;
            if(me.settings.callback){
              me.settings.callback();
            }
          });
        }
        if(me.settings.pagination && !init){
          me.pageItem.eq(me.index).addClass(me.activeClass).siblings("li").removeClass(me.activeClass);
        }
      }       

      }
      return PageSwitch;
  })();
   

   //PageSwiitch插件
    //在插件内部，this指向的是当前通过选择器获取的jquery对象 $(this)才是
   $.fn.PageSwitch =  function (options){
       return this.each(function(){
          new PageSwitch($(this),options)
       })
   }
   
   // 这样写没法用extend传递参数
   // $.fn.extend ({
   //     PageSwitch : function(){
   //         return this.each(function(options){
   //              new PageSwitch($(this),options)
   //           })      
   //     }
   // })
      
  
  // $.fn.extend ({
  //   PageSwitch : function(){
  //     return this.each(function(options){
  //       var me = $(this),
  //         instance = me.data("PageSwitch");

  //       if(!instance){
  //         me.data("PageSwitch", (instance = new PageSwitch(me, options)));
  //       }

  //       if($.type(options) === "string") return instance[options]();
  //     });
  //   }
  // });



   $.fn.PageSwitch.default = {
	   	selectors : {
	   		sections : ".sections",
	   		section : ".section",
	   		page : ".pages",
	   		active : ".active",
	   	},
	   	index : 0,
	   	easing : "ease",
	   	duration : 500,
	   	loop : true,
	   	pagination : true,
	   	keyboard : true,
	   	direction : "vertical", //horizontal
	   	callback : ""
   }

   
   
})(jQuery);