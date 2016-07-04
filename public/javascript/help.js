'use strict';

$(function(){

  var $form = $('#prismic-code');
  $form.on('submit', function(e) {
    var code = $form.find('textarea').val();
    e.preventDefault();
    eval(code);
  });

});
