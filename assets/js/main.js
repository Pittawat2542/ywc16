// API_KEY

const NASA_API_KEY = "";
const GOOGLE_API_KEY = "";

// Constant
const DEFAULT_CARD = 10;
const DEFAULT_LOAD_MORE_CARD = 5;

// Global variables
let nasa = [];
let nasa_text = [];
let nasa_text_translated = {};
let countCard = 0;

// Functions
const fetchNASAData = async (
  date = new Date(),
  callback = d => console.log(d),
  callback2
) => {
  await fetch(
    `https://api.nasa.gov/planetary/apod?api_key=${NASA_API_KEY}&date=${date
      .toISOString()
      .substring(0, 10)}`
  )
    .then(res => res.json())
    .then(data => {
      callback(data, nasa);
      callback2(data.explanation, nasa_text);
    })
    .catch(e => console.error(e));
};

const translateToThai = async (text, index, callback) => {
  await fetch(
    `https://translation.googleapis.com/language/translate/v2?key=${GOOGLE_API_KEY}&source=en&target=th&q=${text}`
  )
    .then(res => res.json())
    .then(data =>
      callback(
        data.data.translations[0].translatedText,
        nasa_text_translated,
        index
      )
    )
    .catch(e => console.error(e));
};

const createCard = data => {
  const node = document.createElement("div");
  node.setAttribute("class", "card");
  node.setAttribute("id", `card-${countCard++}`);

  switch (data.media_type) {
    case "image":
      const imgNode = document.createElement("img");
      imgNode.setAttribute("class", "card-img-top");
      imgNode.setAttribute("src", data.url);
      imgNode.setAttribute("alt", data.title);

      node.appendChild(imgNode);
      break;
    case "video":
      const embedNode = document.createElement("div");
      embedNode.setAttribute(
        "class",
        "embed-responsive embed-responsive-16by9"
      );

      const iframeNode = document.createElement("iframe");
      iframeNode.setAttribute("class", "embed-responsive-item");
      iframeNode.setAttribute("src", data.url);
      iframeNode.setAttribute("allowfullscreen", true);
      embedNode.appendChild(iframeNode);

      node.appendChild(embedNode);
      break;
  }

  const cardBodyNode = document.createElement("div");
  cardBodyNode.setAttribute("class", "card-body");

  const titleNode = document.createElement("h5");
  titleNode.setAttribute("class", "card-title");
  titleNode.innerText = data.title;

  const contentNode = document.createElement("p");
  contentNode.setAttribute("class", "card-text");
  contentNode.innerText = data.explanation;

  const dateWrapperNode = document.createElement("p");
  dateWrapperNode.setAttribute("class", "card-text");

  const dateNode = document.createElement("small");
  dateNode.setAttribute("class", "text-muted");
  dateNode.innerText = data.date;

  dateWrapperNode.appendChild(dateNode);

  const translateButton = document.createElement("a");
  translateButton.setAttribute("id", "translate-button");
  translateButton.setAttribute("class", "btn btn-info");
  translateButton.innerText = "Translate";

  cardBodyNode.appendChild(titleNode);
  cardBodyNode.appendChild(contentNode);
  cardBodyNode.appendChild(dateWrapperNode);
  cardBodyNode.appendChild(translateButton);

  node.appendChild(cardBodyNode);

  return node;
};

const loadCard = async n => {
  let currentCountCard = countCard;
  for (let i = currentCountCard; i < currentCountCard + n; i++) {
    await fetchNASAData(
      new Date(new Date() - dayToDate(i) + hourOffset(-12)),
      addDataToArray,
      addDataToArray
    );
    appendToCardColumns(createCard(nasa[i]));
  }
};

const onClickListener = async node => {
  if (node.id == "translate-button") {
    const cardNode = node.parentNode.parentNode;
    const index = cardNode.id.substring(5);

    if (node.innerText == "Translate") {
      if (nasa_text_translated[index] == undefined) {
        await translateToThai(nasa_text[index], index, changeDataAtIndex);
      }

      cardNode.childNodes[1].childNodes[1].innerText =
        nasa_text_translated[index];
      node.setAttribute("class", "btn btn-warning");
      node.innerText = "Reverse";
    } else if (node.innerText == "Reverse") {
      cardNode.childNodes[1].childNodes[1].innerText = nasa_text[index];
      node.setAttribute("class", "btn btn-info");
      node.innerText = "Translate";
    }
  }
};

// Helper functions
const appendToCardColumns = node => {
  const cardColumnsNode = document.querySelector(".card-columns");
  cardColumnsNode.appendChild(node);
};

const addDataToArray = (data, array) => {
  array.push(data);
};

const changeDataAtIndex = (data, object, index) => {
  object[index] = data;
};

const dayToDate = n => 24 * 60 * 60 * 1000 * n;

const hourOffset = n => 60 * 60 * 1000 * n;

// Run
document.addEventListener("DOMContentLoaded", async () => {
  document
    .querySelector("#load-more-button")
    .addEventListener("click", async () => loadCard(DEFAULT_LOAD_MORE_CARD));
  document
    .querySelector(".card-columns")
    .addEventListener("click", async ev => onClickListener(ev.target));

  await loadCard(DEFAULT_CARD);
});
