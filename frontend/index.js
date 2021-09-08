const getInputUrl = () => document.getElementById("url").value;

const showResult = (htmlString) => {
  document.getElementById("result").innerHTML = htmlString;
};

const fetchHtml = (url) => fetch("http://localhost:8080/" + url);

const main = () => {
  const url = getInputUrl();
  fetchHtml(url)
    .then((response) => {
      return response.text();
    })
    .then((responseInHtmlString) => {
      showResult(responseInHtmlString);
    })
    .catch((err) => {
      console.error(err);
    });
};
