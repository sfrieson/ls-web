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
      query = '?content_type=work';
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

// about.html
function renderAbout (data) {
  var div = createElement('div');

  div.appendChild(
    createElement('div', null, markdownToHtml(data.fields.body))
  );

  return div;
}

// choreography.html
// function vimeo (url) {
//   if (!/vimeo/.test(url)) {
//     return url;
//   }
//   var idNum = url.match(/\d+/g)[0];
//   return '<iframe src="https://player.vimeo.com/video/' + idNum + '" ' +
//     'frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>';
// }

function renderChoreography (data) {
  var ul = createElement('ul', {class: 'current-works'});

  data.items.sort(function (a, b) {
    var aDate = a.fields.sortDate;
    var bDate = b.fields.sortDate;
    if (aDate > bDate) return -1;
    else if (aDate < bDate) return 1;
    else return 0;
  }).map(function (item) {
    var fields = item.fields;
    var li = createElement('li');
    var section = createElement('section', {itemscope: '', itemtype: 'http://schema.org/CreativeWork'});

    section.appendChild(
      createElement('h2', {itemprop: 'name'}, fields.title)
    );

    // TODO Figure out how to properly tag embedded video itemprop='video'
    section.appendChild(
      createElement('div', {'class': 'embed-container'}, fields.videoEmbeds)
    );

    li.appendChild(section);
    return li;
  }).forEach(function (item) { ul.appendChild(item); });

  return ul;
}

// content.html
function renderCurrent (data) {
  var ul = createElement('ul', {class: 'current-works'});

  data.items.sort(function (a, b) {
    var aDate = a.fields.ate;
    var bDate = b.fields.ate;
    if (aDate > bDate) return -1;
    else if (aDate < bDate) return 1;
    else return 0;
  }).map(function (item) {
    var fields = item.fields;

    var section = createElement('section', {itemscope: '', itemtype: 'http://schema.org/CreativeWork', class: 'current-works__item'});

    if (fields.image) {
      var img = findAsset(data.includes.Asset, fields.image.sys.id);

      var imgContainer = createElement('div', {class: 'list-item__image-container'});
      imgContainer.appendChild(
        createElement('img', {class: 'list-item__image', src: img.fields.file.url, itemprop: 'image', alt: img.fields.title})
      );
      section.appendChild(imgContainer);
    }

    var listItemInfo = createElement('div', {class: 'list-item__info'});

    // TODO Restore when a current work has a title again
    // listItemInfo.appendChild(
    //   createElement('h3', {class: 'list-item__title', itemprop: 'name'}, fields.title)
    // );

    listItemInfo.appendChild(
      createElement('p', {itemprop: 'about'}, fields.description)
    );
    if (fields.location) {
      listItemInfo.appendChild(
        createElement('p', {itemprop: 'locationCreated'}, fields.location)
      );
    }
    if (fields.date) {
      listItemInfo.appendChild(
        createElement('time', {datetime: fields.date, itemprop: 'datePublished'}, dateToText(fields.date))
      );
    }

    section.appendChild(listItemInfo);

    var li = createElement('li');
    li.append(section);

    return li;
  }).forEach(function (li) {
    ul.appendChild(li);
  });

  return ul;
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

// writing.html
function renderPublications (data) {
  var ul = createElement('ul');

  data.items.sort(function (a, b) {
    var aDate = a.fields.sortDate;
    var bDate = b.fields.sortDate;
    if (aDate > bDate) return -1;
    else if (aDate < bDate) return 1;
    else return 0;
  })
    .map(function (item) {
      var fields = item.fields;
      var section = createElement('section', {'class': 'publication', itemscope: '', itemtype: 'http://schema.org/CreativeWork'});
      section.appendChild(
        createElement('h2', {itemprop: 'name'}, fields.title)
      );
      // sortDate
      // attachment?
      var dateLine = createElement('p', {'class': 'cite'});

      dateLine.appendChild(
        createElement('span', {itemprop: 'isPartOf'}, fields.publication)
      );

      if (fields.publicationIssue) {
        dateLine.append(' — ');
        dateLine.appendChild(
          createElement('span', {itemprop: 'datePublished'}, fields.publicationIssue)
        );
      }

      section.appendChild(dateLine);
      if (fields.notes) {
        section.appendChild(
          createElement('p', null, fields.notes)
        );
      }

      if (fields.link) {
        section.appendChild(
          createElement('a', {href: fields.link, itemprop: 'url', target: '_blank', rel: 'nofollow'}, 'Read')
        );
      }

      if (fields.attachment) {
        var asset = findAsset(data.includes.Asset, fields.attachment.sys.id);

        section.appendChild(
          createElement('a', {href: asset.fields.file.url, target: '_blank', rel: 'nofollow'}, 'Read')
        );
      }

      var li = createElement('li');
      li.appendChild(section);
      return li;
    }).forEach(function (li) { ul.appendChild(li); });

  return ul;
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

var dateRE = new RegExp('(\\d{4})-(\\d{2})-(\\d{2})');
var months = {
  '01': 'January',
  '02': 'February',
  '03': 'March',
  '04': 'April',
  '05': 'May',
  '06': 'June',
  '07': 'July',
  '08': 'August',
  '09': 'September',
  '10': 'October',
  '11': 'November',
  '12': 'December'
};

function dateToText (date) {
  var matches = date.match(dateRE);

  return months[matches[2]] + ' ' + (+matches[3]) + ', ' + matches[1];
}
