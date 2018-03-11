/* globals showdown, XMLHttpRequest */
var converter = new showdown.Converter();
var markdownToHtml = converter.makeHtml.bind(converter);

apiRequest(window.location.pathname, renderContent);

function xhr (url, authToken, callback) {
  var httpRequest = new XMLHttpRequest();
  httpRequest.open('GET', url, true);
  httpRequest.setRequestHeader('Authorization', 'Bearer ' + authToken);

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

function apiRequest (pathname, callback) {
  var space = 'qb5whqojhy98';
  var key = '9ef6c24841ef62982292eb35568541eb0fa9a423267edb0226444fa3acc81624';

  var base = 'https://cdn.contentful.com';
  var endpoint = '';
  var query = '';

  switch (pathname) {
    case '/about.html':
      endpoint = '/entries/2JxwNt394sAwY6I4GqIquQ';
      break;
    case '/current.html':
      endpoint = '/entries';
      query = '?content_type=currentWork';
      break;
    case '/choreography.html':
      endpoint = '/entries';
      query = '?content_type=choreography';
      break;
    case '/writing.html':
      endpoint = '/entries';
      query = '?content_type=publication';
  }

  xhr(
    base + '/spaces/' + space + endpoint + query,
    key,
    function (response) { onReady(function () { callback(response); }); }
  );
}

// about.js
function renderAbout (data) {
  var div = createElement('div');

  div.appendChild(
    createElement('div', null, markdownToHtml(data.fields.body))
  );

  return div;
}

// choreography.js
// function vimeo (url) {
//   if (!/vimeo/.test(url)) {
//     return url;
//   }
//   var idNum = url.match(/\d+/g)[0];
//   return '<iframe src="https://player.vimeo.com/video/' + idNum + '" ' +
//     'frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>';
// }

function renderChoreography (data) {
  var items = data.items;
  items.sort(function (a, b) { return a.fields.sortDate < b.fields.sortDate; });

  return items.map(function (item) {
    var fields = item.fields;
    var div = createElement('div');
    div.appendChild(
      createElement('h4', null, fields.title)
    );
    div.appendChild(
      createElement('div', {'class': 'embed-container'}, fields.videoEmbeds)
    );

    return div;
  });
}

// content.js
function renderCurrent (data) {
  var div = createElement('div');
  div.appendChild(
    createElement('h4', null, data.title.rendered)
  );
  div.appendChild(
    createElement('p', null, data.content.rendered)
  );

  return div;
}

function findAsset (assets, id) {
  var found = null;
  for (var i = 0; i < assets.length; i++) {
    var asset = assets[i];
    if (id === asset.sys.id) {
      found = asset;
      break;
    }
  }
  return found;
}

// writing.js
function renderPublications (data) {
  var items = data.items;
  items.sort(function (a, b) { return a.fields.sortDate < b.fields.sortDate; });

  return items.map(function (item) {
    var fields = item.fields;
    // <div>
    //   <h3>{title}</h3>
    //   <span>{publication} – {publicationIssue}</span>
    //   <p>{notes}</p>
    //   <a href='{link || asset.fields.file.url}'>Read</a>
    // </div>
    var div = createElement('div', {'class': 'publication'});
    div.appendChild(
      createElement('h3', null, fields.title)
    );
    // sortDate
    // attachment?
    div.appendChild(
      createElement('p', {'class': 'cite'}, fields.publication + (fields.publicationIssue ? ' — ' + fields.publicationIssue : ''))
    );
    if (fields.notes) {
      div.appendChild(
        createElement('p', null, fields.notes)
      );
    }

    if (fields.link) {
      div.appendChild(
        createElement('a', {href: fields.link, target: '_blank', rel: 'nofollow'}, 'Read')
      );
    }

    if (fields.attachment) {
      var asset = findAsset(data.includes.Asset, fields.attachment.sys.id);

      div.appendChild(
        createElement('a', {href: asset.fields.file.url, target: '_blank', rel: 'nofollow'}, 'Read')
      );
    }

    return div;
  });
}

function renderContent (res) {
  var main = document.getElementsByTagName('main')[0];
  var loading = document.getElementById('loading');
  loading.parentElement.removeChild(loading);

  var content;
  switch (window.location.pathname) {
    case '/about.html':
      content = renderAbout(res);
      break;
    case '/choreography.html':
      content = renderChoreography(res);
      break;
    case '/current.html':
      content = renderCurrent(res);
      break;
    case '/writing.html':
      content = renderPublications(res);
      break;
  }

  if (Array.isArray(content)) content.forEach(main.appendChild.bind(main));
  else main.appendChild(content);
}
