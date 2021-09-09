const getInputUrl = () => document.getElementById("url").value;

const parseKeywordFromURL = (url) => {
  const segments = new URL(url).pathname.split("/");
  return decodeURI(segments.pop());
};

const appendKeywordToList = (wikiURL) => {
  const ulNode = document.createElement("ul")
  const keywordText = document.createTextNode(parseKeywordFromURL(wikiURL));
  const liNode = document.createElement("li");
  liNode.appendChild(keywordText);
  ulNode.appendChild(liNode);
  return ulNode
};

// TODO: replace local host with real cors proxy server.
const fetchHtml = (url) => fetch("http://localhost:8080/" + url);

const main = () => {
  const url = getInputUrl();
  const rootUlNode = document.getElementById("result");
  // appendKeywordToList(rootUlNode, url);

  const appendKeywordToList(rootUlNode, "https://ja.wikipedia.org/wiki/Foobar")


  rootUlNode.firstChild.
  appendKeywordToList(, "https://ja.wikipedia.org/wiki/%E3%83%A1%E3%82%BF%E6%A7%8B%E6%96%87%E5%A4%89%E6%95%B0")

  // fetchHtml(url)
  //   .then((response) => {
  //     return response.text();
  //   })
  //   .then((responseInHtmlString) => {
  //     showResult(responseInHtmlString);
  //   })
  //   .catch((err) => {
  //     console.error(err);
  //   });
};
