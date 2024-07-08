/* globals showdown, XMLHttpRequest */
var converter = new showdown.Converter();
var markdownToHtml = converter.makeHtml.bind(converter);

apiRequest(window.location.pathname, renderContent);

function xhr(url, authToken, callback) {
  var httpRequest = new XMLHttpRequest();
  httpRequest.open("GET", url, true);
  httpRequest.setRequestHeader("Authorization", "Bearer " + authToken);

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
window.addEventListener("load", loaded);
function loaded() {
  ready.forEach(function (fn) {
    fn();
  });
  ready = true;
  window.removeEventListener("load", loaded);
}

function onReady(fn) {
  if (ready === true) fn();
  else ready.push(fn);
}

function createElement(name, attributes, children) {
  var el = document.createElement(name);
  if (attributes)
    for (var attr in attributes) el.setAttribute(attr, attributes[attr]);
  if (children) el.innerHTML = children;

  return el;
}

function apiRequest(pathname, callback) {
  var space = "qb5whqojhy98";
  var key = "9ef6c24841ef62982292eb35568541eb0fa9a423267edb0226444fa3acc81624";

  var base = "https://cdn.contentful.com";
  var endpoint = "";
  var query = "";

  switch (pathname) {
    case "/choreography.html":
      endpoint = "/entries";
      query = "?content_type=choreography";
      break;
    default:
      return;
  }

  xhr(base + "/spaces/" + space + endpoint + query, key, function (response) {
    onReady(function () {
      callback(response);
    });
  });
}

function renderChoreography(data) {
  var ul = createElement("ul", { class: "current-works" });

  data.items
    .sort(function (a, b) {
      var aDate = a.fields.sortDate;
      var bDate = b.fields.sortDate;
      if (aDate > bDate) return -1;
      else if (aDate < bDate) return 1;
      else return 0;
    })
    .map(function (item) {
      var fields = item.fields;
      var li = createElement("li");
      var section = createElement("section", {
        itemscope: "",
        itemtype: "http://schema.org/CreativeWork",
      });

      section.appendChild(
        createElement("h3", { itemprop: "name" }, fields.title)
      );

      // TODO Figure out how to properly tag embedded video itemprop='video'
      section.appendChild(
        createElement("div", { class: "embed-container" }, fields.videoEmbeds)
      );

      li.appendChild(section);
      return li;
    })
    .forEach(function (item) {
      ul.appendChild(item);
    });

  return ul;
}

function findAsset(assets, id) {
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

function renderContent(res) {
  var main = document.getElementsByTagName("main")[0];
  var loading = document.getElementById("loading");
  loading.parentElement.removeChild(loading);

  var content;
  switch (window.location.pathname) {
    case "/choreography.html":
      content = renderChoreography(res);
      break;
  }

  if (Array.isArray(content)) content.forEach(main.appendChild.bind(main));
  else main.appendChild(content);
}
