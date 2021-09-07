const getInputUrl = () => document.getElementById("url").value;

const showResult = (htmlString) => {
  document.getElementById("result").innerHTML = htmlString;
};

const main = () => {
  const url = getInputUrl();
  fetch(url)
    .then((response) => {
      const responseInHtmlString = response.text();
      showResult(responseInHtmlString);
    })
    .catch((err) => {
      console.error(err);
    });
};
