/* globals $ */
var category = window.location.pathname.substr(1, window.location.pathname.indexOf('.') - 1);

function getArticles (cat, callback) {
  var endpoint = cat === 'about' ? 'pages' : 'posts';
  var query = '';
  if (endpoint !== 'pages') query = '?filter[category_name]=' + cat;

  $.get({
    url: 'http://lesliesatin.com/wp/wp-json/wp/v2/' + endpoint + query,
    success: function (response) {
      $(function () { callback(response); });
    }
  });
}

function getRenderFn (category) {
  switch (category) {
    case 'about':
      return renderAbout;
    case 'choreography':
      return renderChoreography;
    case 'content':
      return renderContent;
    case 'writing':
      return renderWriting;
  }
}

// about.js
function renderAbout (arr) {
  console.log(arr);
  var main = $('main');
  for (var i = 0; i < arr.length; i++) {
    var div = $('<div>');
    div.append($('<h4>').html(arr[i].title.rendered));
    div.append($('<p>').html(arr[i].content.rendered));
    $('#loading').remove();
    main.append(div);
  }
}

// choreography.js
var vimeo = function (url) {
  if (!/vimeo/.test(url)) {
    return url;
  }
  var idNum = url.match(/\d+/g)[0];
  return '<iframe src="https://player.vimeo.com/video/' + idNum + '" ' +
    'frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>';
};
function renderChoreography (arr) {
  var main = $('main');
  for (var i = 0; i < arr.length; i++) {
    var div = $('<div>');
    div.append($('<h4>').html(arr[i].title.rendered));
    div.append($('<div class="embed-container">').html(vimeo(arr[i].content.rendered)));
    $('#loading').remove();
    main.append(div);
  }
}

// content.js
function renderContent (arr) {
  console.log(arr);
  var main = $('main');
  for (var i = 0; i < arr.length; i++) {
    var div = $('<div>');
    div.append($('<h4>').html(arr[i].title.rendered));
    div.append($('<p>').html(arr[i].content.rendered));
    $('#loading').remove();
    main.append(div);
  }
}

// writing.js
function makeArticle (title, content) {
  var div = $('<div class="article">');
  div.append($('<h3>').html(title));
  div.append($('<p class="cite">').html(content));
  return div;
}
function renderWriting (arr) {
  var main = $('main');
  for (var i = 0; i < arr.length; i++) {
    if ($('#loading').length) $('#loading').remove();
    main.append(
      makeArticle(arr[i].title.rendered, arr[i].content.rendered)
    );
  }
}

getArticles(category, getRenderFn(category));

$(function () {
  if (window.innerWidth <= 966) {
    $('.images').remove().insertBefore('#copyright');
  }
});
