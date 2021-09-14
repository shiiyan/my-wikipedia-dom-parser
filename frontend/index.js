/**
 * Get value from URL input field.
 *
 * @return {string} Inputted URL.
 */
const getInputUrl = () => document.getElementById("url").value;

/**
 * Fetch HTML with CORS proxy server.
 *
 * CORS proxy server is necessary because Wikipedia does not allow cross origin request by default.
 *
 * @todo Replace local host with real CORS proxy server.
 *
 * @param {string} url URL to fetch.
 *
 * @return {Promise<Response>} Promise of Response.
 */
const fetchHtmlWithCorsProxy = (url) => fetch("http://localhost:8080/" + url);

/**
 * Extract keyword from Wikipedia URL.
 *
 * Given URL "/wiki/Foobar" as input, "Foobar" will be extracted as keyword.
 *
 * @param {string} url URL of Wikipedia.
 *
 * @return {string} Extracted keyword.
 */
const parseKeywordFromURL = (url) => {
  const segments = new URL(url).pathname.split("/");
  return decodeURI(segments.pop());
};

/**
 * Stop process for a given period of time.
 *
 * @param {number} ms Time to sleep in milliseconds.
 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Search one keyword for keywords that attach to it.
 *
 * First fetch HTML of given Wikipedia URL, then extract keywords that appear inside introduction section of fetched HTML.
 *
 * @param {string} url URL (of Wikipedia).
 *
 * @return {Promise<{keyword: string; parentKeyword: string; url: string;}[]>} Promise of fetched Keywords.
 */
const searchOneKeyword = async (url) => {
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

/**
 * Verify whether the given keyword belongs to no fetching keywords.
 *
 * Keywords that ends with "語" or "学" are no fetching keywords.
 * They do not need to be fetched for keywords inside their introduction section.
 *
 * @param {string} keyword
 *
 * @return {boolean}
 */
const isNoFetchingKeyword = (keyword) =>
  keyword[keyword.length - 1] === "語" || keyword[keyword.length - 1] === "学";

/**
 * Verify whether the given keyword has been fetched.
 *
 * @param {string}   target            Target keyword to verify.
 * @param {string[]} fetchHistoryList  List consists of keyword that has been fetched.
 *
 * @return {boolean}
 */
const isKeywordFetched = (target, fetchHistoryList) =>
  fetchHistoryList.includes(target);

/**
 * Search nested keywords for 20 times.
 *
 * Nested search for keywords that appear inside their parent keyword's introduction section for up to 20 times.
 *
 * @param {string} url URL (of Wikipedia).
 *
 * @return {Promise<{keyword: string; parentKeyword: string | null; url: string;}[]>} Promise of fetched Keywords.
 */
const searchNestedKeywords = async (url) => {
  const keywordList = [];
  keywordList.push({
    keyword: parseKeywordFromURL(url),
    parentKeyword: null,
    url: url,
  });
  const fetchHistoryList = [];

  let i = 0;
  while (fetchHistoryList.length < 20) {
    if (!keywordList[i]) {
      break;
    } else if (isNoFetchingKeyword(keywordList[i].keyword)) {
      keywordList[i].keyword += "$";
    } else if (isKeywordFetched(keywordList[i].keyword, fetchHistoryList)) {
      keywordList[i].keyword += "@";
    } else {
      const keywords = await searchOneKeyword(keywordList[i].url);
      fetchHistoryList.push(parseKeywordFromURL(keywordList[i].url));
      keywordList.push(...keywords);
    }
    i += 1;
  }

  for (i; i < keywordList.length; i++) {
    keywordList[i].keyword += "$";
  }

  return keywordList;
};

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

const clearSearchResult = () => {
  document.getElementById("result").innerHTML = "";
};

const showSearchingInProgress = () => {
  document.getElementById("searching-in-progress").classList.remove("hidden");
};

const hideSearchingInProgress = () => {
  document.getElementById("searching-in-progress").classList.add("hidden");
};

const main = async () => {
  try {
    clearSearchResult();
    showSearchingInProgress();

    const keywordList = await searchNestedKeywords(getInputUrl());
    const keywordTree = transformListToTree(keywordList);

    const rootContainer = document.getElementById("result");
    transformTreeToHtmlList(keywordTree, rootContainer);

    hideSearchingInProgress();
  } catch (err) {
    console.error(err);
  }
};
