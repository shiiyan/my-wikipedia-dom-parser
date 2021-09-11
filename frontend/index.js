const getInputUrl = () => document.getElementById("url").value;

// TODO: replace local host with real cors proxy server.
const fetchHtmlWithCorsProxy = (url) => fetch("http://localhost:8080/" + url);

const parseKeywordFromURL = (url) => {
  const segments = new URL(url).pathname.split("/");
  return decodeURI(segments.pop());
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const fetchKeywordsFromWikipedia = async (url) => {
  await sleep(1000);

  const host = "https://" + new URL(url).host;
  const response = await fetchHtmlWithCorsProxy(url);
  const responseHtmlString = await response.text();

  const responseDoc = new DOMParser().parseFromString(
    responseHtmlString,
    "text/html"
  );

  const p = responseDoc
    .querySelector("div.mw-parser-output")
    .querySelector("p");
  const anchorList = p.querySelectorAll('[href*="/wiki/"]');

  const fetchedKeywords = [...anchorList].map((a) => ({
    keyword: parseKeywordFromURL(a.href),
    parentKeyword: parseKeywordFromURL(url),
    url: host + a.attributes.href.value,
  }));

  return fetchedKeywords;
};

const generateKeywordList = (url) => {
  const keywordList = [];
  keywordList.push({
    keyword: parseKeywordFromURL(url),
    parentKeyword: null,
    url: url,
  });

  var i = 0;
  while (i < 20) {
    const keywords = fetchKeywordsFromWikipedia(keywordList[i].url);
    keywordList.push(...keywords);
    i += 1;
  }

  return keywordList;
};

// TODO: change below to real documental comment
// Sample result List
// const keywordList = [
// 	{ keyword: "Foobar", parentKeyword: null },
// 	{ keyword: "メタ構文変数", parentKeyword: "Foobar" },
// 	{ keyword: "プログラミング言語", parentKeyword: "メタ構文変数" },
// 	...
// ];

// Sample result Tree
// const keywordTree = {
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

const transformListToTree = (keywordList) => {
  let keywordTree;
  keywordList.forEach((one) => {
    if (!one.parentKeyword) {
      keywordTree = one;
      return;
    }

    const parentItem = keywordList.find(
      (another) => another.keyword === one.parentKeyword
    );
    parentItem.children = [...(parentItem.children || []), one];
  });

  return keywordTree;
};

const transformTreeToHtmlList = (keywordTree, container) => {
  const li = document.createElement("li");
  container.appendChild(li);
  li.innerHTML = keywordTree.keyword;

  keywordTree.children?.forEach((subTree) => {
    const ul = document.createElement("ul");
    li.appendChild(ul);
    transformTreeToHtmlList(subTree, ul);
  });
};

const main = async () => {
  try {
    const url = getInputUrl();
    const fetchedKeywords = await fetchKeywordsFromWikipedia(url);

    console.log("fetchedKeywords, ", fetchedKeywords);
    // const keywordList = generateKeywordList(url);

    // const keywordTree = transformListToTree(keywordList);

    // const rootContainer = document.getElementById("result");
    // transformTreeToHtmlList(keywordTree, rootContainer);
  } catch (err) {
    console.error(err);
  }
};
