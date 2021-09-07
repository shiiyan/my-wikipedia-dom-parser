const getInputUrl = () => document.getElementById("url").value;

const showResult = (result) => {
  document.getElementById("result").innerHTML = result;
};

const main = () => {
  const url = getInputUrl();
  showResult(url);
};
