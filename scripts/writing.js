function makeArticle(title, content) {
    var div = $('<div class="article">');
    div.append($('<h3>').html(title));
    div.append($('<p class="cite">').html(content));
    return div;
}
function render(arr){
    var main = $('main');
    for (var i = 0; i < arr.length; i++) {
        if($('#loading').length) $('#loading').remove();
        main.append(
            makeArticle(arr[i].title.rendered, arr[i].content.rendered)
        );
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
