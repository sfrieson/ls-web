/* globals XMLHttpRequest */
var category = window.location.pathname.substr(1, window.location.pathname.indexOf('.') - 1);

function request (url, callback) {
  var httpRequest = new XMLHttpRequest();
  httpRequest.open('GET', url, true);
  httpRequest.send();
  httpRequest.onreadystatechange = function () {
    if (httpRequest.readyState === XMLHttpRequest.DONE) {
      if (httpRequest.status === 200) {
        callback(JSON.parse(httpRequest.responseText));
      }
    }
  };
}

var ready = [];

window.addEventListener('load', loaded);
function loaded () {
  ready.forEach(function (fn) { fn(); });
  ready = true;
  window.removeEventListener('load', loaded);
}

function onReady (fn) {
  if (ready === true) fn();
  else ready.push(fn);
}

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

  request('http://lesliesatin.com/wp/wp-json/wp/v2/' + endpoint + query, function (response) {
    onReady(function () { callback(response); });
  });
}

function getRenderFn (category) {

}

function render (dataArr, fn) {
  var main = document.getElementsByTagName('main')[0];
  var loading = document.getElementById('loading');
  loading.parentElement.removeChild(loading);

  dataArr.map(fn).forEach(main.appendChild.bind(main));
}

// about.js
function renderAbout (data) {
  var div = createElement('div');
  div.appendChild(
    createElement('h4', null, data.title.rendered)
  );
  div.appendChild(
    createElement('p', null, data.content.rendered)
  );
  return div;
}

// choreography.js
function vimeo (url) {
  if (!/vimeo/.test(url)) {
    return url;
  }
  var idNum = url.match(/\d+/g)[0];
  return '<iframe src="https://player.vimeo.com/video/' + idNum + '" ' +
    'frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>';
}

function renderChoreography (data) {
  var div = createElement('div');
  div.appendChild(
    createElement('h4', null, data.title.rendered)
  );
  div.appendChild(
    createElement('div', {'class': 'embed-container'}, vimeo(data.content.rendered))
  );

  return div;
}

// content.js
function renderContent (data) {
  var div = createElement('div');
  div.appendChild(
    createElement('h4', null, data.title.rendered)
  );
  div.appendChild(
    createElement('p', null, data.content.rendered)
  );

  return div;
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

function renderWriting (data) {
  return makeArticle(data.title.rendered, data.content.rendered);
}

getArticles(category, function (arr) {
  var renderFn;

  switch (category) {
    case 'about':
      renderFn = renderAbout;
      break;
    case 'choreography':
      renderFn = renderChoreography;
      break;
    case 'content':
      renderFn = renderContent;
      break;
    case 'writing':
      renderFn = renderWriting;
      break;
  }

  render(arr, renderFn);
});
