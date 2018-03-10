/* globals $ */
var category = window.location.pathname.substr(1, window.location.pathname.indexOf('.') - 1);

function createElement (name, attributes, children) {
  var el = document.createElement(name);
  if (attributes) for (var attr in attributes) el.setAttribute(attr, attributes[attr]);
  if (children) el.innerHTML = children;

  return el;
}

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
  var main = document.getElementsByTagName('main')[0];
  var loading = document.getElementById('loading');
  loading.parentElement.removeChild(loading);

  arr.map(function (data) {
    var div = createElement('div');
    div.appendChild(
      createElement('h4', null, data.title.rendered)
    );
    div.appendChild(
      createElement('p', null, data.content.rendered)
    );
    return div;
  }).forEach(main.appendChild.bind(main));
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
  var main = document.getElementsByTagName('main')[0];
  var loading = document.getElementById('loading');
  loading.parentElement.removeChild(loading);

  arr.map(function (data) {
    var div = createElement('div');
    div.appendChild(
      createElement('h4', null, data.title.rendered)
    );
    div.appendChild(
      createElement('div', {'class': 'embed-container'}, vimeo(data.content.rendered))
    );

    return div;
  }).forEach(main.appendChild.bind(main));
}

// content.js
function renderContent (arr) {
  var main = document.getElementsByTagName('main')[0];
  var loading = document.getElementById('loading');
  loading.parentElement.removeChild(loading);

  arr.map(function (data) {
    var div = createElement('div');
    div.appendChild(
      createElement('h4', null, data.title.rendered)
    );
    div.appendChild(
      createElement('p', null, data.content.rendered)
    );

    return div;
  }).forEach(main.appendChild.bind(main));
}

// writing.js
function makeArticle (title, content) {
  var div = createElement('div', {'class': 'article'});
  div.appendChild(
    createElement('h3', null, title)
  );
  div.appendChild(
    createElement('p', {'class': 'cite'}, content)
  );
  return div;
}
function renderWriting (arr) {
  var main = document.getElementsByTagName('main')[0];
  var loading = document.getElementById('loading');
  if (loading) loading.parentElement.removeChild(loading);

  arr.map(function (data) {
    return makeArticle(data.title.rendered, data.content.rendered);
  }).forEach(main.appendChild.bind(main));
}

getArticles(category, getRenderFn(category));

$(function () {
  if (window.innerWidth <= 966) {
    $('.images').remove().insertBefore('#copyright');
  }
});
