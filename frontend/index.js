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
 * Make url for Wikipedia keywords.
 *
 * @param {string} host Host of Wikipedia.
 * @param {string} href Value inside href property of anchor element.
 *
 * @return {string} Generated url.
 */
const makeUrl = (host, href) =>
  href.includes("https://") ? href : host + href;

/**
 * Search one keyword for keywords that attach to it.
 *
 * First fetch HTML of given Wikipedia URL, then extract keywords that appear inside introduction section of fetched HTML.
 *
 * @param {string} url URL (of Wikipedia).
 *
 * @return {Promise<{keyword: string; parentKeyword: string; url: string;}[]>} Promise of newly fetched keyword list.
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

  const keywordList = [...anchorList].map((a) => ({
    keyword: parseKeywordFromURL(a.href),
    parentKeyword: parseKeywordFromURL(url),
    url: makeUrl(host, a.attributes.href.value),
  }));

  return keywordList;
};

/**
 * Verify whether the given keyword belongs to no fetching keywords.
 *
 * Keywords that ends with "語" or "学" are no searching keywords.
 * They do not need to be searched for keywords inside their introduction section.
 *
 * @param {string} keyword
 *
 * @return {boolean}
 */
const isNoSearchingKeyword = (keyword) =>
  keyword[keyword.length - 1] === "語" || keyword[keyword.length - 1] === "学";

/**
 * Verify whether the given keyword has been searched.
 *
 * @param {string}   target            Target keyword to verify.
 * @param {string[]} fetchHistoryList  List consists of keyword that has been searched.
 *
 * @return {boolean}
 */
const isKeywordSearched = (target, fetchHistoryList) =>
  fetchHistoryList.includes(target);

/**
 * Nesting search keyword for up to 20 times.
 *
 * Nesting search for keywords that appear inside their parent keyword's introduction section for up to 20 times.
 *
 * @param {string} url URL (of Wikipedia).
 *
 * @return {Promise<{keyword: string; parentKeyword: string | null; url: string;}[]>} Promise of result keyword list.
 */
const nestingSearchKeywords = async (url) => {
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
    } else if (isNoSearchingKeyword(keywordList[i].keyword)) {
      keywordList[i].keyword += "$";
    } else if (isKeywordSearched(keywordList[i].keyword, fetchHistoryList)) {
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

/**
 * Transform keyword list to tree.
 *
 * This method uses object references in JavaScript to build a tree structure. It takes O(n) time.
 * @see https://typeofnan.dev/an-easy-way-to-build-a-tree-with-object-references/
 *
 * @param {{keyword: string; parentKeyword: string | null; url: string;}[]} keywordList Keyword list from Wikipedia.
 *
 * @return result keyword tree.
 *
 * Sample result for root keyword "Foobar" would be
 * {
 *   keyword: "Foobar",
 *   parentKeyword: null,
 *   url: "/wiki/Foobar"
 *   children: [
 *   {
 *     keyword: "メタ構文変数",
 *     children: [
 *       { keyword: "プログラミング言語", parentKeyword: "Foobar" ,children: [...] },
 *       { keyword: "識別子", parentKeyword: "Foobar", children: null },
 *     ],
 *     ...
 *   },
 *   ]
 * }
 */
const transformKeywordListToTree = (keywordList) => {
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

/**
 * Transform keyword tree to HTML list elements.
 *
 * This method uses recursion to generate HTML list. It takes O(n) time.
 *
 * @param {string} keywordTree Keywords from Wikipedia in form of a tree structure.
 * @param {string} container Element to which a HTML list attaches, usually a <ul> element.
 *
 * @return {void}
 */
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

/**
 * Clear search result from DOM.
 */
const clearSearchResult = () => {
  document.getElementById("result").innerHTML = "";
};

/**
 * Show searching-in-progress elements.
 */
const showSearchingInProgress = () => {
  document.getElementById("searching-in-progress").classList.remove("hidden");
};

/**
 * Hide searching-in-progress elements.
 */
const hideSearchingInProgress = () => {
  document.getElementById("searching-in-progress").classList.add("hidden");
};

const main = async () => {
  try {
    clearSearchResult();
    showSearchingInProgress();

    const keywordList = await nestingSearchKeywords(getInputUrl());
    const keywordTree = transformKeywordListToTree(keywordList);

    const rootContainer = document.getElementById("result");
    transformTreeToHtmlList(keywordTree, rootContainer);

    hideSearchingInProgress();
  } catch (err) {
    console.error(err);
  }
};
