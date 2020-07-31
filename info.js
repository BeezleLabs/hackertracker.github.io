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

              let tmpString = begin.toLocaleTimeString(navigator.language, {
                hour: "2-digit",
                minute: "2-digit",
			    timeZoneName: "short"
              });
              if (timeString != tmpString) {
                timeString = tmpString;
                let newTimeHTML = `<div class="card-body col-2"><p class="text-center" style="color: #cccccc">${timeString
                  .replace("AM", "")
                  .replace("PM", "")}</p></div>`;
                element += newTimeHTML;
              } else {
                let newTimeHTML = `<div class="card-body col-2"><p class="text-center" style="color: #cccccc">&nbsp;</p></div>`;
                element += newTimeHTML;
              }

              element += `
                        <div class="card-body col-10">
                            <button type="button" class="btn btn-secondary" data-toggle="modal" data-target="#M-${e.id}">${e.title}</button>
							<p class="text-left" style="color: #cccccc">${e.location.name}</p>
					    </div>
                    </div>
                    <div class="modal" id="M-${e.id}" tabindex="-1" role="dialog" aria-labelledby="${e.id}-modalLabel" aria-hidden="true">
                      <div class="modal-dialog modal-xl" role="document">
                        <div class="modal-content">
                          <div class="modal-header">
                            <h5 class="modal-title">${e.title}</h5>
                            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                              <span aria-hidden="true">&times;</span>
                            </button>
                          </div>
                          <div class="modal-body">
                            <p>${e.description}</p>
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
  if (searchBar.value.length != 0) {
    searchBar.value = "";
    loadEvents(false);
  }
});

setInterval(() => {
  loadEvents(false);
}, 60000);
