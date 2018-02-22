//160094802

var vimeo = function(url) {
    if (!/vimeo/.test(url) ) {
        return url;
    }
    var idNum = url.match(/\d+/g)[0];
    return '<iframe src="https://player.vimeo.com/video/' + idNum + '" ' +
    'frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>';
};
function render(arr){
    var main = $('main');
    for (var i = 0; i < arr.length; i++) {
        var div = $('<div>');
        div.append($('<h4>').html(arr[i].title.rendered));
        div.append($('<div class="embed-container">').html( vimeo(arr[i].content.rendered) ));
        $('#loading').remove();
        main.append(div);
    }
}
function getArticles(cat, callback){
    $.get({
        url: "http://lesliesatin.com/wp/wp-json/wp/v2/posts?filter[category_name]=" + cat,
        success: function(response){
            $(function(){callback(response);});
        }
    });
}
var category = window.location.pathname.substr(1, window.location.pathname.indexOf('.')-1);

getArticles(category, render);
$(function(){
    if(window.innerWidth <= 966) {
        $('.images').remove().insertBefore('#copyright');
    }
});
