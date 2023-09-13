console.log('agenda.js loaded');

// first get the correct key from session storage (the value has user data, such as userid which is required for the api)
function GetCorrectKey() {
    let lengthofstorage = sessionStorage.length;

    // the correct key is the key that doesn't include Messages or queue
    for (let i = 0; i < lengthofstorage; i++) {
        let key = sessionStorage.key(i);
        if (!key.includes('Messages') && !key.includes('queue')) {
            return key;
        }
    }
}

let key = GetCorrectKey();
let userdata = JSON.parse(sessionStorage.getItem(key))[0];

let schoolid = userdata.ssid;
let userid = userdata.userid;
let userlt = userdata.userlt;

//console.log(schoolid, userid);
console.log("Successfully got user data");

function getCookies(msg) {
    return function() {
        console.log(msg);
        chrome.cookies.getAll({}, cookies => console.log(JSON.stringify(cookies)));
    }
}

let cookies = getCookies("getting cookies");


//printCookies('agenda.js loaded')();

async function getPlannedElements(startDate, endDate, school_id=schoolid, user_id=userid, user_lt=userlt) {

    let url = `https://hdc.smartschool.be/planner/api/v1/planned-elements/user/${school_id}_${user_id}_${user_lt}?from=${startDate}&to=${endDate}&types=planned-assignments,planned-to-dos,planned-lessons`;
    let headers = new Headers({
        'Cookie': Object.values(cookies).join('; '),
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.5735.199 Safari/537.36',
        'Accept-Encoding': 'gzip, deflate',
        'Accept-Language': 'en-US,en;q=0.9'
    });
    let options = {
        method: 'GET',
        headers: headers
    };
    let response = await fetch(url, options);
    return await response.json();
}

let popupvisible = false;

// Insert "HT Inplannen" button
let button = document.createElement("button");
button.innerHTML = "HT Inplannen";
button.classList = "btn js-btn";

button.addEventListener("click", function() {
    if (popupvisible === false) {
        console.log("Button clicked");

        /*
        Popup HTML:
           <div bubble="" class="bubble js-bubble selectview selectviewlist__container" tabindex="-1" x-placement="bottom" style="position: absolute; top: 104px; left: 1507px; will-change: top, left;"><div class="selectviewlist js-selectviewlist"><div class="selectview__container"><div class="radiobutton-group"><label class="radiobutton js-radiobutton selectview__hotkey-W"><input type="radio" name="radiobuttons" class="" value="undefined"><span class="">Weekweergave</span></label><label class="radiobutton js-radiobutton selectview__hotkey-M"><input type="radio" name="radiobuttons" class="" value="undefined"><span class="">Maandweergave</span></label><label class="radiobutton js-radiobutton selectview__hotkey-T"><input type="radio" name="radiobuttons" class="" value="undefined"><div class="selectview__forwardview"><div class="">Vandaag en volgende</div><button class="btn btn--select-dropdown js-btn selectview__dropdown">4</button><div class="">dagen</div></div></label><label class="radiobutton js-radiobutton selectview__hotkey-L"><input type="radio" name="radiobuttons" class="" value="undefined"><span class="">Lijstweergave</span></label></div></div><hr class="separator"><div class="selectview__checkboxes-container"><label class="checkbox js-checkbox selectview__checkbox"><input type="checkbox" class="" value="undefined"><span class="">To-dolijst</span></label><div class="selectview__beforeandafter js-selectview-beforeandafter"><label class="checkbox js-checkbox selectview__checkbox"><input type="checkbox" class="" value="undefined"><span class=""></span></label><span class="">Uren verbergen voor</span><button class="btn btn--select-dropdown js-btn selectview__timefrom">07:00</button><span class="">en na</span><button class="btn btn--select-dropdown js-btn selectview__timeto">19:00</button></div><label class="checkbox js-checkbox selectview__checkbox"><input type="checkbox" class="" value="undefined"><span class="">Weekend tonen</span></label></div></div><div class="bubble__arrow" style="left: 276px;"><svg width="20" height="10" viewBox="0 0 20 10">
            <polyline points="0 11 10 1 20 11"></polyline>
          </svg></div></div>*/
        let popup = document.createElement("div");
        popup.classList = "bubble js-bubble selectview selectviewlist__container";
        popup.setAttribute("bubble", "");
        popup.setAttribute("tabindex", "-1");
        popup.setAttribute("x-placement", "bottom");
        popup.setAttribute("style", "position: absolute; top: 104px; left: 1507px; will-change: top, left;");

        document.body.appendChild(popup);

        let selectviewlist = document.createElement("div");
        selectviewlist.classList = "selectviewlist js-selectviewlist";
        popup.appendChild(selectviewlist);

        let selectviewcontainer = document.createElement("div");
        selectviewcontainer.classList = "selectview__container";
        selectviewlist.appendChild(selectviewcontainer);

        let radiobuttongroup = document.createElement("div");
        radiobuttongroup.classList = "radiobutton-group";
        selectviewcontainer.appendChild(radiobuttongroup);

        let radiobuttonweek = document.createElement("label");
        radiobuttonweek.classList = "radiobutton js-radiobutton selectview__hotkey-W";
        radiobuttongroup.appendChild(radiobuttonweek);

        let radiobuttonweekinput = document.createElement("input");
        radiobuttonweekinput.setAttribute("type", "radio");
        radiobuttonweekinput.setAttribute("name", "radiobuttons");
        radiobuttonweekinput.setAttribute("class", "");
        radiobuttonweekinput.setAttribute("value", "undefined");
        radiobuttonweek.appendChild(radiobuttonweekinput);

        let radiobuttonweekspan = document.createElement("span");
        radiobuttonweekspan.innerHTML = "Weekweergave";
        radiobuttonweek.appendChild(radiobuttonweekspan);

        let radiobuttonmonth = document.createElement("label");
        radiobuttonmonth.classList = "radiobutton js-radiobutton selectview__hotkey-M";
        radiobuttongroup.appendChild(radiobuttonmonth);

        let radiobuttonmonthinput = document.createElement("input");
        radiobuttonmonthinput.setAttribute("type", "radio");
        radiobuttonmonthinput.setAttribute("name", "radiobuttons");
        radiobuttonmonthinput.setAttribute("class", "");
        radiobuttonmonthinput.setAttribute("value", "undefined");
        radiobuttonmonth.appendChild(radiobuttonmonthinput);

        let radiobuttonmonthspan = document.createElement("span");
        radiobuttonmonthspan.innerHTML = "Maandweergave";
        radiobuttonmonth.appendChild(radiobuttonmonthspan);

        let radiobuttontoday = document.createElement("label");
        radiobuttontoday.classList = "radiobutton js-radiobutton selectview__hotkey-T";
        radiobuttongroup.appendChild(radiobuttontoday);

        let radiobuttontodayinput = document.createElement("input");
        radiobuttontodayinput.setAttribute("type", "radio");
        radiobuttontodayinput.setAttribute("name", "radiobuttons");
        radiobuttontodayinput.setAttribute("class", "");
        radiobuttontodayinput.setAttribute("value", "undefined");
        radiobuttontoday.appendChild(radiobuttontodayinput);

        let radiobuttontodayspan = document.createElement("span");
        radiobuttontodayspan.classList = "selectview__forwardview";
        radiobuttontoday.appendChild(radiobuttontodayspan);

        let radiobuttontodaydiv = document.createElement("div");
        radiobuttontodaydiv.innerHTML = "Vandaag en volgende";
        radiobuttontodayspan.appendChild(radiobuttontodaydiv);

        let radiobuttontodaybutton = document.createElement("button");
        radiobuttontodaybutton.classList = "btn btn--select-dropdown js-btn selectview__dropdown";
        radiobuttontodaybutton.innerHTML = "4";
        radiobuttontodayspan.appendChild(radiobuttontodaybutton);

        let radiobuttontodaydiv2 = document.createElement("div");
        radiobuttontodaydiv2.innerHTML = "dagen";
        radiobuttontodayspan.appendChild(radiobuttontodaydiv2);

        let radiobuttonlist = document.createElement("label");
        radiobuttonlist.classList = "radiobutton js-radiobutton selectview__hotkey-L";
        radiobuttongroup.appendChild(radiobuttonlist);

        let radiobuttonlistinput = document.createElement("input");
        radiobuttonlistinput.setAttribute("type", "radio");
        radiobuttonlistinput.setAttribute("name", "radiobuttons");
        radiobuttonlistinput.setAttribute("class", "");
        radiobuttonlistinput.setAttribute("value", "undefined");
        radiobuttonlist.appendChild(radiobuttonlistinput);

        let radiobuttonlistspan = document.createElement("span");
        radiobuttonlistspan.innerHTML = "Lijstweergave";
        radiobuttonlist.appendChild(radiobuttonlistspan);

        let separator = document.createElement("hr");
        separator.classList = "separator";
        selectviewlist.appendChild(separator);

        let selectviewcheckboxescontainer = document.createElement("div");
        selectviewcheckboxescontainer.classList = "selectview__checkboxes-container";
        selectviewlist.appendChild(selectviewcheckboxescontainer);

        let selectviewcheckboxtodolist = document.createElement("label");
        selectviewcheckboxtodolist.classList = "checkbox js-checkbox selectview__checkbox";
        selectviewcheckboxescontainer.appendChild(selectviewcheckboxtodolist);

        let selectviewcheckboxtodolistinput = document.createElement("input");
        selectviewcheckboxtodolistinput.setAttribute("type", "checkbox");
        selectviewcheckboxtodolistinput.setAttribute("class", "");
        selectviewcheckboxtodolistinput.setAttribute("value", "undefined");
        selectviewcheckboxtodolist.appendChild(selectviewcheckboxtodolistinput);

        let selectviewcheckboxtodolistspan = document.createElement("span");
        selectviewcheckboxtodolistspan.innerHTML = "To-dolijst";
        selectviewcheckboxtodolist.appendChild(selectviewcheckboxtodolistspan);

        let selectviewbeforeandafter = document.createElement("div");
        selectviewbeforeandafter.classList = "selectview__beforeandafter js-selectview-beforeandafter";
        selectviewcheckboxescontainer.appendChild(selectviewbeforeandafter);

        let selectviewcheckboxbefore = document.createElement("label");
        selectviewcheckboxbefore.classList = "checkbox js-checkbox selectview__checkbox";
        selectviewbeforeandafter.appendChild(selectviewcheckboxbefore);

        let selectviewcheckboxbeforeinput = document.createElement("input");
        selectviewcheckboxbeforeinput.setAttribute("type", "checkbox");
        selectviewcheckboxbeforeinput.setAttribute("class", "");
        selectviewcheckboxbeforeinput.setAttribute("value", "undefined");
        selectviewcheckboxbefore.appendChild(selectviewcheckboxbeforeinput);

        let selectviewcheckboxbeforespan = document.createElement("span");
        selectviewcheckboxbeforespan.innerHTML = "";
        selectviewcheckboxbefore.appendChild(selectviewcheckboxbeforespan);

        let selectviewbeforeandafterspan = document.createElement("span");
        selectviewbeforeandafterspan.innerHTML = "Uren verbergen voor";
        selectviewbeforeandafter.appendChild(selectviewbeforeandafterspan);

        let selectviewbeforeandafterbutton = document.createElement("button");
        selectviewbeforeandafterbutton.classList = "btn btn--select-dropdown js-btn selectview__timefrom";
        selectviewbeforeandafterbutton.innerHTML = "07:00";
        selectviewbeforeandafter.appendChild(selectviewbeforeandafterbutton);

        let selectviewbeforeandafterspan2 = document.createElement("span");
        selectviewbeforeandafterspan2.innerHTML = "en na";
        selectviewbeforeandafter.appendChild(selectviewbeforeandafterspan2);

        let selectviewbeforeandafterbutton2 = document.createElement("button");
        selectviewbeforeandafterbutton2.classList = "btn btn--select-dropdown js-btn selectview__timeto";
        selectviewbeforeandafterbutton2.innerHTML = "19:00";
        selectviewbeforeandafter.appendChild(selectviewbeforeandafterbutton2);

        let selectviewcheckboxweekend = document.createElement("label");
        selectviewcheckboxweekend.classList = "checkbox js-checkbox selectview__checkbox";
        selectviewcheckboxescontainer.appendChild(selectviewcheckboxweekend);

        let selectviewcheckboxweekendinput = document.createElement("input");
        selectviewcheckboxweekendinput.setAttribute("type", "checkbox");
        selectviewcheckboxweekendinput.setAttribute("class", "");
        selectviewcheckboxweekendinput.setAttribute("value", "undefined");
        selectviewcheckboxweekend.appendChild(selectviewcheckboxweekendinput);

        let selectviewcheckboxweekendspan = document.createElement("span");
        selectviewcheckboxweekendspan.innerHTML = "Weekend tonen";
        selectviewcheckboxweekend.appendChild(selectviewcheckboxweekendspan);

        let bubblearrow = document.createElement("div");
        bubblearrow.classList = "bubble__arrow";
        bubblearrow.setAttribute("style", "left: 276px;");
        popup.appendChild(bubblearrow);

        let bubblearrowsvg = document.createElement("svg");
        bubblearrowsvg.setAttribute("width", "20");
        bubblearrowsvg.setAttribute("height", "10");
        bubblearrowsvg.setAttribute("viewBox", "0 0 20 10");
        bubblearrow.appendChild(bubblearrowsvg);

        let bubblearrowpolyline = document.createElement("polyline");
        bubblearrowpolyline.setAttribute("points", "0 11 10 1 20 11");
        bubblearrowsvg.appendChild(bubblearrowpolyline);

        let submit = document.createElement("button");
        submit.innerHTML = "SUBMIT HT";
        submit.classList = "btn js-btn";
        submit.addEventListener("click", function() {
            console.log("submitting");
            let date = document.getElementsByClassName("planner-header__date")[0].innerHTML;
            let datearray = date.split(" ");
            let datestring = datearray[1] + "-" + datearray[2] + "-" + datearray[3];
            console.log(datestring);
            let name = prompt("Please enter the name of the HT", "HT");
            console.log(name);
            popupvisible = false;
            popup.remove();
        });

        // cancel button
        let cancel = document.createElement("button");
        cancel.innerHTML = "Cancel";
        cancel.classList = "btn js-btn";
        cancel.addEventListener("click", function() {
            console.log("canceling");
            popupvisible = false;
            popup.remove();
        });


        popup.appendChild(submit);
        popup.appendChild(cancel);

        popupvisible = true;

        // <div bubble="" class="bubble js-bubble hour-select__bubble" tabindex="-1" x-placement="top" style="position: absolute; top: 5px; left: 1602px; will-change: top, left;"><button class="bubble__menu-btn smsc-svg--16 js-menu-btn bubble__menu-btn--no-icon"><span>01:00</span></button><button class="bubble__menu-btn smsc-svg--16 js-menu-btn bubble__menu-btn--no-icon"><span>02:00</span></button><button class="bubble__menu-btn smsc-svg--16 js-menu-btn bubble__menu-btn--no-icon"><span>03:00</span></button><button class="bubble__menu-btn smsc-svg--16 js-menu-btn bubble__menu-btn--no-icon"><span>04:00</span></button><button class="bubble__menu-btn smsc-svg--16 js-menu-btn bubble__menu-btn--no-icon"><span>05:00</span></button><button class="bubble__menu-btn smsc-svg--16 js-menu-btn bubble__menu-btn--no-icon"><span>06:00</span></button><button class="bubble__menu-btn smsc-svg--16 js-menu-btn bubble__menu-btn--no-icon bubble__menu-btn--active"><span>07:00</span></button><button class="bubble__menu-btn smsc-svg--16 js-menu-btn bubble__menu-btn--no-icon"><span>08:00</span></button><button class="bubble__menu-btn smsc-svg--16 js-menu-btn bubble__menu-btn--no-icon"><span>09:00</span></button><button class="bubble__menu-btn smsc-svg--16 js-menu-btn bubble__menu-btn--no-icon"><span>10:00</span></button><button class="bubble__menu-btn smsc-svg--16 js-menu-btn bubble__menu-btn--no-icon"><span>11:00</span></button><button class="bubble__menu-btn smsc-svg--16 js-menu-btn bubble__menu-btn--no-icon"><span>12:00</span></button><div class="bubble__arrow" style="left: 39px;"><svg width="20" height="10" viewBox="0 0 20 10"> <polyline points="0 11 10 1 20 11"></polyline> </svg></div></div>


    }
});



console.log("Adding button")

// Check if the element is already present

if (document.getElementsByClassName("smsc-container__header planner-header js-planner-header").length === 1) {
    console.log("Appending button to planner-header");
    document.getElementsByClassName("smsc-container__header planner-header js-planner-header")[0].appendChild(button);
} else {
    // Wait for the element to be added
    console.log("Waiting for planner-header to load");

    // Create a new observer
    let observer = new MutationObserver(function(mutations) {
        mutations.forEach(function() {
            // Check if the element has been added
            console.log("Checking if planner-header has been added")
            if (document.getElementsByClassName("smsc-container__header planner-header js-planner-header").length === 1) {
                console.log("Appending button to planner-header");
                document.getElementsByClassName("smsc-container__header planner-header js-planner-header")[0].appendChild(button);
                observer.disconnect();
            }
        });
    });

    // Start observing the DOM
    observer.observe(document.body, { childList: true, subtree: true });
}

getPlannedElements('2023-09-01', '2024-10-10')
    .then(data => {
        //console.log(data);
        for (let element of data) {
            // check element.assignmentType is not nil
            // if not nil check if the assignmentType.name is Herhalingstoets

            if (element.assignmentType && element.assignmentType.name === "Herhalingstoets") {
                console.warn("Found a herhalingstoets");
                console.log(element.name);
            } else {
                if (element.name.includes("HT")) {
                    if (element.plannedElementType === "planned-assignments") {
                        console.warn("Found a herhalingstoets THATS NOT PROPERTY MARKED AS A HERHALINGSTOETS!!!");
                        console.log(element.name);
                    } else {
                        // check date of 'real tests' (marked as tests) and compare to date of this element
                        let falsepositive = false;
                        for (let testelement of data) {
                            if (testelement.plannedElementType === "planned-assignments") {
                                if (testelement.period.dateTimeFrom === element.period.dateTimeFrom) {
                                    //console.warn("False positive wrongly-marked herhalingstoets (meaning it was properly inserted into the system)");
                                    //console.log(element.name);
                                    falsepositive = true;
                                }
                            }
                        }
                        if (!falsepositive) {
                            console.warn("Found a herhalingstoets THATS NOT PROPERTY MARKED AS A HERHALINGSTOETS!!!");
                            console.log(element.name);
                        }
                    }
                }
            }
        }
    })
    .catch(error => console.error(error));