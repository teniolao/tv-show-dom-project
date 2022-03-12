let bodyTag = document.getElementsByTagName("body");
let selectShowTag = document.querySelector(".selectShow");
let selectEpisodeTag = document.getElementById("selectEpisode");
const searchBox = document.getElementById("input-searchBox");
const searchCount = document.getElementById("search-count");
let allEpisodesDiv = document.getElementById("all-episodesDiv");
const selectAllShows = document.createElement("option");
const showList = document.getElementById("show-list");

function setup() {
  let showsList = getAllShows();
  selectOptionForShows(showsList);
  makePageForShows(showsList);

  searchBox.addEventListener("keyup", onSearchKeyUp);
  selectEpisodeTag.addEventListener("change", getSelectedEpisodeValue);
  selectShowTag.addEventListener("change", getSelectedShowValue);
}

function selectOptionForShows(shows) {
  // sorting list in order
  shows.sort((a, b) => {
    if (a.name.toLowerCase() > b.name.toLowerCase()) {
      return 1;
    } else if (a.name.toLowerCase() < b.name.toLowerCase()) {
      return -1;
    } else {
      return 0;
    }
  });

  selectAllShows.innerText = "View All Shows";
  selectAllShows.value = "All-Shows";
  selectShowTag.appendChild(selectAllShows);

  shows.forEach((show) => {
    let showOptionTag = document.createElement("option");
    let eachShowList = show.name;
    showOptionTag.innerText = eachShowList;
    showOptionTag.value = show.id;
    selectShowTag.append(showOptionTag);
  });
}

function selectOptionForEpisodes(episodeList) {
  selectEpisodeTag.innerHTML = "";
  const selectAllEpisodes = document.createElement("option");
  selectAllEpisodes.innerText = "View All Episodes";
  selectAllEpisodes.value = "All-Episode";
  selectEpisodeTag.appendChild(selectAllEpisodes);

  episodeList.forEach((e) => {
    let optionTag = document.createElement("option");

    let dropdownList = `${formatSeriesAndEpisode(e.season, e.number)} - ${
      e.name
    }`;
    optionTag.innerText = dropdownList;
    optionTag.value = e.id;
    selectEpisodeTag.append(optionTag);
  });
}

function formatSeriesAndEpisode(season, number) {
  return number > 9 ? `S0${season}E${number}` : `S0${season}E0${number}`;
}

function makePageForEpisodes(episodeList) {
  allEpisodesDiv.innerHTML = "";

  episodeList.forEach((e) => {
    let eachEpisodeDiv = document.createElement("div");
    eachEpisodeDiv.setAttribute("class", "episode-div");
    let headerTag = document.createElement("h3");
    let imageTag = document.createElement("img");
    let summaryText = document.createElement("p");

    //header - zero-padded to two digits
    headerTag.innerText = `${e.name} - ${formatSeriesAndEpisode(
      e.season,
      e.number
    )}`;

    //condition to view contents with images
    if (e.image !== null) {
      imageTag.src = e.image.medium;
    }

    //removing all p tags in text content
    let text = e["summary"];
    text = text.replaceAll("<p>", "");
    text = text.replaceAll("</p>", "");
    summaryText.innerText = text;

    eachEpisodeDiv.append(headerTag, imageTag, summaryText);
    allEpisodesDiv.append(eachEpisodeDiv);
  });
}

function makePageForShows(shows) {
  // allEpisodesDiv.innerHTML = "";

  shows.forEach((show) => {
    let eachShowList = document.createElement("div");
    let eachShowHeader = document.createElement("h1");
    const wrapDiv = document.createElement("div");
    const summary = document.createElement("span");
    const showImage = document.createElement("img");
    const asideDiv = document.createElement("div");

    eachShowHeader.innerText = show.name;
    summary.innerHTML = show.summary;

    // condition to view content with images
    if (show.image !== null) {
      showImage.src = `${show.image.medium}`;
    }

    //aside content
    asideDiv.innerText = `Rated${
      show.rating.average
    } \n Genres: ${show.genres.join(" | ")} \n Status: ${
      show.status
    } \n Runtime: ${show.runtime}`;

    //class attributes
    eachShowList.className = "eachShow-container"; // i have not used it!
    wrapDiv.className = "content-wrapper";
    asideDiv.className = "asideDiv";
    summary.className = "span-text";

    wrapDiv.append(showImage, summary, asideDiv);
    eachShowList.append(eachShowHeader, wrapDiv);
    showList.append(eachShowList);

    //when a show list is clicked it views all episodes
    eachShowList.addEventListener("click", (event) => {
      const selectedShowId = show.id;
      sendRequest(selectedShowId).then((data) => {
        currentEpisodes = data;
        showList.style.display = "none";
        selectOptionForEpisodes(currentEpisodes);
        makePageForEpisodes(currentEpisodes);
      });
    });
  });
  return shows;
}

function onSearchKeyUp(event) {
  const searchTerm = event.target.value.toLowerCase();
  const filteredEpisodes = currentEpisodes.filter((e) => {
    const episodeName = e.name.toLowerCase();
    const episodeSummary = e.summary.toLowerCase();
    return (
      episodeName.includes(searchTerm) || episodeSummary.includes(searchTerm)
    );
  });
  const filteredCount = filteredEpisodes.length;
  const allCount = currentEpisodes.length;
  const countString = `Displaying ${filteredCount} / ${allCount}`;
  searchCount.innerText = countString;
  makePageForEpisodes(filteredEpisodes);
}
function getSelectedEpisodeValue(event) {
  const selectedEpisodeId = event.target.value;
  if (selectedEpisodeId === "All-Episode") {
    makePageForEpisodes(currentEpisodes);
  } else {
    let filteredEpisodes = currentEpisodes.filter((e) => {
      return e.id === parseInt(selectedEpisodeId);
    });
    makePageForEpisodes(filteredEpisodes);
  }
}

function getSelectedShowValue(event) {
  let selectedShowId = event.target.value;
  sendRequest(selectedShowId).then((data) => {
    currentEpisodes = data;
    console.log(data);
    selectOptionForEpisodes(currentEpisodes);
    makePageForEpisodes(currentEpisodes);
  });
}
function sendRequest(showId) {
  const urlForTheRequest = `https://api.tvmaze.com/shows/${showId}/episodes`;

  return fetch(urlForTheRequest)
    .then((res) => res.json())
    .then((data) => {
      return data;
    })
    .catch((e) => console.log(e));
}
window.onload = setup;
