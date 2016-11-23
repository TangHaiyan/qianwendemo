
$(function(){
  $('#backTop').on('click',go());
     $(window).on('scroll',function(){
      checkPosition($(window).height())
    });


     checkPosition($(window).height());

    function move(){
      $('html,body').animate({  //滚动条出现的位置
        scrollTop:100
      },5000)
    }
    function go(){
      $('html,body').scrollTop();
    }

    function checkPosition(pos){
      if ($(window).scrollTop()>pos) {
        $('#backTop').slideDown(1000);
      }else{
        $('#backTop').slideUp(1000);
      }
    }


})
