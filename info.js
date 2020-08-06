const timeZoneSelector = document.querySelector("#timezone-selector");
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
        const speakers = e.speakers.map((speaker) => speaker.name);

        if (selectedCategory == "all" || e.type.id == selectedCategory) {
          if (
            searchText.length == 0 ||
            e.title.toLowerCase().includes(searchText.toLowerCase()) ||
            e.description.toLowerCase().includes(searchText.toLowerCase()) ||
            speakers.join().toLowerCase().includes(searchText.toLowerCase())
          ) {
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

            let [beginOptions, endOptions] = getTimeOptions();

            let beginString = begin.toLocaleTimeString(
              navigator.language,
              beginOptions
            );
            let endString = end.toLocaleTimeString(
              navigator.language,
              endOptions
            );
            if (e.end_timestamp.toMillis() < currentTime) {
              let newTimeHTML = `<div class="card-body col-3"><p class="text-center" style="color: #cccccc">${beginString} - ${endString}</p></div>`;
              element += newTimeHTML;
            } else {
              let newTimeHTML = `<div class="card-body col-3 future-event"><p class="text-center" style="color: #cccccc">${beginString} - ${endString}</p></div>`;
              element += newTimeHTML;
            }

            element += `
                        <div class="card-body col-9">
                            <button type="button" style="-webkit-box-shadow: 0 7px 5px -5px ${e.type.color}; -moz-box-shadow: 0 7px 5px -5px ${e.type.color}; box-shadow: 0 7px 5px -5px ${e.type.color};"class="btn btn-secondary" data-toggle="modal" data-target="#M-${e.id}">${e.title}</button>
							<p class="text-left" style="color: #cccccc">${e.location.name}</p>
					    </div>
                    </div>
                    <div class="modal" id="M-${e.id}" tabindex="-1" role="dialog" aria-labelledby="${e.id}-modalLabel" aria-hidden="true">
                      <div class="modal-dialog modal-xl modal-dialog-centered" role="document">
                        <div class="modal-content">
                          <div class="modal-header">
                            <h5 class="modal-title">${e.title}</h5>
                            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                              <span aria-hidden="true">&times;</span>
                            </button>
                          </div>
                          <div class="modal-body">
                          <h6>${beginString} - ${endString}</h6>`;

            if (speakers.length == 1) {
              element += `<br><p>Speaker: ${speakers[0]}</p>`;
            } else if (speakers.length > 1) {
              element += `<br><p>Speakers: ${speakers.join(", ")}</p>`;
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

            let [extractedLinks, transformedDescription] = extractLinks(
              e.description
            );
            if (extractedLinks.length > 0) {
              extractedLinks.forEach((link) => {
                if (link.title == "Forum" && forumUrl) {
                  return;
                }

                if (link.title == "Discord" && discordUrl) {
                  return;
                }

                eventLinks.push(link.html);
              });
            }

            const newLines = /\n/gi;
            let newDescription = transformedDescription.replaceAll(
              newLines,
              "<br>"
            );

            element += `
              <br>
              <p>${newDescription}</p>
              <p>${eventLinks.join(" | ")}</p>}
                          </div>
                        </div>
                      </div>
                    </div>`;
            //console.log(element)
            eventList.insertAdjacentHTML("beforeend", element);
          } else {
            // console.log(
            //   `nope ${e.begin_timestamp.toMillis()} is <= ${currentTime}`
            // );
          }
        }
      });
      const futureEvent = document.querySelector(".future-event");
      console.log(futureEvent);
      futureEvent.scrollIntoView({
        behavior: "smooth",
      });
    });
}

function getTimeOptions() {
  let selectedTimezone =
    timeZoneSelector.options[timeZoneSelector.selectedIndex].value;
  if (selectedTimezone != "") {
    return [
      {
        hour: "2-digit",
        minute: "2-digit",
        timeZoneName: "short",
        timeZone: selectedTimezone,
        hour12: false,
        weekday: "short",
      },
      {
        hour: "2-digit",
        minute: "2-digit",
        timeZoneName: "short",
        timeZone: selectedTimezone,
        hour12: false,
      },
    ];
  } else {
    return [
      {
        hour: "2-digit",
        minute: "2-digit",
        timeZoneName: "short",
        hour12: false,
        weekday: "short",
      },
      {
        hour: "2-digit",
        minute: "2-digit",
        timeZoneName: "short",
        hour12: false,
      },
    ];
  }
}

function extractLinks(description) {
  let linkTitle = [];
  let urlRegex = new RegExp(
    "((https?|ftp|gopher|telnet|file):((//)|(\\\\))+[\\w\\d:#@%/;$()~_?\\+-=\\\\\\.&]*)",
    "ig"
  );

  let matches = description.match(urlRegex);

  if (matches == null) {
    return [[], description];
  }

  matches.forEach((link) => {
    let linkLower = link.toLowerCase().trim().replace(",", "");
    if (linkLower.includes("forum.defcon.org")) {
      linkTitle.push({
        title: "Forum",
        url: link,
      });
    } else if (linkLower.includes("discord")) {
      linkTitle.push({
        title: "Discord",
        url: link,
      });
    } else if (linkLower.includes("youtube.com")) {
      linkTitle.push({
        title: "YouTube",
        url: link,
      });
    } else if (linkLower.includes("twitch.tv")) {
      let twitchHandle = linkLower.split(".tv/")[1].split("/")[0];
      linkTitle.push({
        title: `${twitchHandle} on Twitch`,
        url: link,
      });
    } else if (linkLower.includes("twitter.com")) {
      let twitterHandle = linkLower.split(".com/")[1].split("/")[0];
      linkTitle.push({
        title: `@${twitterHandle}`,
        url: link,
      });
    } else {
      linkTitle.push({
        title: link,
        url: link,
      });
    }
  });

  let linkObjects = linkTitle.map((link) => ({
    title: link.title,
    url: link.url,
    html: `<a target="_blank" href="${link.url}">${link.title}</a>`,
  }));

  var transformedDescription = description;

  linkObjects.forEach((link) => {
    transformedDescription = transformedDescription.replace(
      link.url,
      `<a target="_blank" href="${link.url}">${link.url}</a>`
    );
  });

  return [linkObjects, transformedDescription];
}

loadEvents(true);

categorysSelector.addEventListener("change", () => {
  loadEvents(false);
});

timeZoneSelector.addEventListener("change", () => {
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
  searchBar.value = "";
  categorysSelector.selectedIndex = 0;
  loadEvents(false);
});

setInterval(() => {
  loadEvents(false);
}, 600000);
