const categorysSelector = document.querySelector("#category-selector");
const searchButton = document.querySelector("#search-btn");
const searchBar = document.querySelector("#search-bar");
const searchCancelButton = document.querySelector("#search-cancel-btn");

const firebaseConfig = {
  apiKey: "AIzaSyAsAP88rl0Qk0v4g_vYFpybKohS_hiyq-w",
  authDomain: "hackertest-5a202.firebaseapp.com",
  databaseURL: "https://hackertest-5a202.firebaseio.com",
  projectId: "hackertest-5a202",
  storageBucket: "hackertest-5a202.appspot.com",
  messagingSenderId: "611899979455",
  appId: "1:611899979455:web:e52aa3314edcf7a2",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

function loadEvents(inital) {
  let eventList = document.querySelector("#eventlist");
  eventList.innerHTML = "";
  let currentTime = Date.now();
  let first = true;
  let dayString = "";
  let timeString = "";

  firebase
    .firestore()
    .collection("conferences")
    .doc("DEFCON28")
    .collection("events")
    .orderBy("begin_timestamp", "asc")
    .get()
    .then((querySnapshot) => {
      let typeIds = new Map();
      const docData = querySnapshot.docs.map((doc) => doc.data());

      docData
        .map((data) => {
          return {
            name: data.type.name,
            id: data.type.id,
          };
        })
        .forEach((type) => typeIds.set(type.name, type.id));

      const categories = Array.from(
        new Set(docData.map((data) => data.type.name))
      ).sort();

      if (inital) {
        let allOption = document.createElement("option");
        allOption.text = "All Categories";
        allOption.value = "all";
        allOption.attributes = "selected";
        categorysSelector.appendChild(allOption);

        categories.forEach((category) => {
          let option = document.createElement("option");
          option.text = category;
          option.value = `${typeIds.get(category)}`;
          categorysSelector.appendChild(option);
        });
      }

      querySnapshot.forEach((event) => {
        let e = event.data();
        const selectedCategory =
          categorysSelector.options[categorysSelector.selectedIndex].value;

        const searchText = searchBar.value;
        if (selectedCategory == "all" || e.type.id == selectedCategory) {
          if (
            searchText.length == 0 ||
            e.title.toLowerCase().includes(searchText.toLowerCase())
          ) {
            if (e.end_timestamp.toMillis() > currentTime) {
              let begin = e.begin_timestamp.toDate();
              let end = e.end_timestamp.toDate();
              if (dayString != begin.toDateString()) {
                dayString = begin.toDateString();
                let newDayHTML = `<h4 class="text-center">${dayString}</h4>`;
                eventList.insertAdjacentHTML("beforeend", newDayHTML);
              }

              //console.log(`${e.id} => ${e.title} => ${e.begin_timestamp.toMillis()}`);

              let element = `<div class="card text-white"  style="border: 0px; background-color: #222222;">
                    <div  style="background-color: ${e.type.color}; width: 8px; height: 90%; display: inline-block; position: absolute;"> </div>
                    <div class="row">`;

              //eventList.insertAdjacentHTML('beforeend',e1);

              let pdtString = begin.toLocaleTimeString(navigator.language, {
                hour: "2-digit",
                minute: "2-digit",
                timeZoneName: "short",
                timeZone: "America/Los_Angeles",
                hour12: false,
              });
              let gmtString = begin.toLocaleTimeString(navigator.language, {
                hour: "2-digit",
                minute: "2-digit",
                timeZoneName: "short",
                timeZone: "GMT",
                hour12: false,
              });

              if (timeString != pdtString) {
                timeString = pdtString;
                let newTimeHTML = `<div class="card-body col-3"><p class="text-center" style="color: #cccccc">${timeString} / ${gmtString}</p></div>`;
                element += newTimeHTML;
              } else {
                let newTimeHTML = `<div class="card-body col-3"><p class="text-center" style="color: #cccccc">&nbsp;</p></div>`;
                element += newTimeHTML;
              }

              let endPdtString = end.toLocaleTimeString(navigator.language, {
                hour: "2-digit",
                minute: "2-digit",
                timeZoneName: "short",
                timeZone: "America/Los_Angeles",
                hour12: false,
              });
              let endGmtString = end.toLocaleTimeString(navigator.language, {
                hour: "2-digit",
                minute: "2-digit",
                timeZoneName: "short",
                timeZone: "GMT",
                hour12: false,
              });

              let beginLocalString = begin.toLocaleTimeString(
                navigator.language,
                {
                  hour: "2-digit",
                  minute: "2-digit",
                  timeZoneName: "short",
                  hour12: false,
                }
              );

              let endLocalString = end.toLocaleTimeString(navigator.language, {
                hour: "2-digit",
                minute: "2-digit",
                timeZoneName: "short",
                hour12: false,
              });

              let eventTimes = [
                `${beginLocalString} - ${endLocalString}`,
                `${pdtString} - ${endPdtString}`,
                `${gmtString} - ${endGmtString}`,
              ];

              element += `
                        <div class="card-body col-9">
                            <button type="button" style="-webkit-box-shadow: 0 7px 5px -5px ${
                              e.type.color
                            }; -moz-box-shadow: 0 7px 5px -5px ${
                e.type.color
              }; box-shadow: 0 7px 5px -5px ${
                e.type.color
              };"class="btn btn-secondary" data-toggle="modal" data-target="#M-${
                e.id
              }">${e.title}</button>
							<p class="text-left" style="color: #cccccc">${e.location.name}</p>
					    </div>
                    </div>
                    <div class="modal" id="M-${
                      e.id
                    }" tabindex="-1" role="dialog" aria-labelledby="${
                e.id
              }-modalLabel" aria-hidden="true">
                      <div class="modal-dialog modal-xl modal-dialog-centered" role="document">
                        <div class="modal-content">
                          <div class="modal-header">
                            <h5 class="modal-title">${e.title}</h5>
                            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                              <span aria-hidden="true">&times;</span>
                            </button>
                          </div>
                          <div class="modal-body">
                          <h6>${eventTimes.join(
                            " &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp; "
                          )}</h6>
                            <p>${e.description}</p>`;

              const speakers = e.speakers.map((speaker) => speaker.name);

              if (speakers.length == 1) {
                element += `<p>Speaker: ${speakers[0]}</p>`;
              } else if (speakers.length > 1) {
                element += `<p>Speakers: ${speakers.join(", ")}</p>`;
              }

              let eventLinks = [];

              const forumUrl = e.type.subforum_url;

              if (forumUrl) {
                eventLinks.push(
                  `<a target="_blank" href="${forumUrl}">${e.type.name} Forum</a>`
                );
              }

              const discordUrl = e.type.discord_url;

              if (discordUrl) {
                eventLinks.push(
                  `<a target="_blank" href="${discordUrl}">${e.type.name} Discord</a>`
                );
              }

              let extractedLinks = extractLinks(e.description);
              if (extractedLinks.length > 0) {
                extractedLinks.forEach((link) => {
                  if (link.title == "Forum" && forumUrl) {
                    return;
                  }

                  if (link.title == "Discord" && discordUrl) {
                    return;
                  }

                  let htmlLink = `<a target="_blank" href="${link.url}">${link.title}</a>`;
                  eventLinks.push(htmlLink);
                });
              }

              element += `<p>${eventLinks.join(" | ")}</p>}
                          </div>
                        </div>
                      </div>
                    </div>`;
              //console.log(element)
              eventList.insertAdjacentHTML("beforeend", element);
            } else {
              console.log(
                `nope ${e.begin_timestamp.toMillis()} is <= ${currentTime}`
              );
            }
          }
        }
      });
    });
}

function extractLinks(description) {
  let linkTitle = [];
  let urlRegex = new RegExp(
    "((https?|ftp|gopher|telnet|file):((//)|(\\\\))+[\\w\\d:#@%/;$()~_?\\+-=\\\\\\.&]*)",
    "ig"
  );

  let matches = description.match(urlRegex); //?

  if (matches == null) {
    return [];
  }

  matches.forEach((link) => {
    let linkLower = link.toLowerCase().trim().replace(",", "");
    if (linkLower.includes("forum.defcon.org")) {
      linkTitle.push({
        title: "Forum",
        url: linkLower,
      });
    } else if (linkLower.includes("discord")) {
      linkTitle.push({
        title: "Discord",
        url: linkLower,
      });
    } else if (linkLower.includes("youtube.com")) {
      linkTitle.push({
        title: "YouTube",
        url: linkLower,
      });
    } else if (linkLower.includes("twitch.tv")) {
      let twitchHandle = linkLower.split(".tv/")[1].split("/")[0];
      linkTitle.push({
        title: `${twitchHandle} on Twitch`,
        url: linkLower,
      });
    } else if (linkLower.includes("twitter.com")) {
      let twitterHandle = linkLower.split(".com/")[1].split("/")[0];
      linkTitle.push({
        title: `@${twitterHandle}`,
        url: linkLower,
      });
    } else {
      linkTitle.push({
        title: linkLower,
        url: linkLower,
      });
    }
  });

  return linkTitle;
}

loadEvents(true);

categorysSelector.addEventListener("change", () => {
  loadEvents(false);
});

searchBar.addEventListener("keyup", (event) => {
  if (event.keyCode === 13) {
    loadEvents(false);
  }
});
searchButton.addEventListener("click", () => {
  if (searchBar.value.length != 0) {
    loadEvents(false);
  }
});

searchCancelButton.addEventListener("click", () => {
  if (searchBar.value.length != 0 || categorysSelector.selectedIndex != 0) {
    searchBar.value = "";
    categorysSelector.selectedIndex = 0;
    loadEvents(false);
  }
});

setInterval(() => {
  loadEvents(false);
}, 600000);
