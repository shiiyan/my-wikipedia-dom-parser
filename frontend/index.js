const getInputUrl = () => document.getElementById("url").value;

const parseKeywordFromURL = (url) => {
  const segments = new URL(url).pathname.split("/");
  return decodeURI(segments.pop());
};

const appendKeywordToList = (wikiURL) => {
  const ulNode = document.createElement("ul");
  const keywordText = document.createTextNode(parseKeywordFromURL(wikiURL));
  const liNode = document.createElement("li");
  liNode.appendChild(keywordText);
  ulNode.appendChild(liNode);
  return ulNode;
};

// TODO: replace local host with real cors proxy server.
const fetchHtmlWithCorsProxy = (url) => fetch("http://localhost:8080/" + url);

// Sample result List
// const resultList = [
// 	{ keyword: "Foobar", parentKeyword: null },
// 	{ keyword: "メタ構文変数", parentKeyword: "Foobar" },
// 	{ keyword: "プログラミング言語", parentKeyword: "メタ構文変数" },
// 	...
// ];


// Sample result Tree
// const resultTree = {
//   keyword: "Foobar",
//   children: [
//     {
//       keyword: "メタ構文変数",
//       children: [
//         { keyword: "プログラミング言語", children: [] },
//         { keyword: "識別子", children: [] },
//       ],
//     },
//   ],
// };

const transformResultTreeToHtmlList = (resultTree, container) => {
  const li = document.createElement("li");
  container.appendChild(li);
  li.innerHTML = resultTree.keyword;

  for (subTree of resultTree.children) {
    const ul = document.createElement("ul");
    li.appendChild(ul);
    transformResultTreeToHtmlList(subTree, ul);
  }
};

const main = () => {
  const url = getInputUrl();
  const resultList = fetchKeywords(url);

  const resultTree = transformResultListToTree(resultList);

  const rootContainer = document.getElementById("result");
  transformResultTreeToHtmlList(resultTree, rootContainer);

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
