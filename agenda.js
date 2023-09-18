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

async function CalculateDaysWhenAClassIsGiven(subjectnametofind) {
    GetClassesThatTeachersTeach(subjectnametofind).then(classes => {
        let classhoursforsubject = [];
        console.log(classes)
        for (let element of classes) {
            // add name of subject with - and then the classes
            let subjectname = element.courses[0].name;
            let subjectclasses = element.participants.groups.map(group => group.name);
            // if the subject is not yet in the array, add it
            let subject = subjectname + " - " + subjectclasses.join(", ");
            console.log(element);
            classhoursforsubject.push(element);
        }
        return classhoursforsubject;
    });
}

async function GetClassesThatTeachersTeach(findingspecifichours=false, school_id=schoolid, user_id=userid, user_lt = userlt){

    // do the request 3 times in 3 different weeks and then check which classes are in all 3 weeks
    let today = new Date();
    let todaystring = today.toISOString().slice(0, 10);
    let todayin2weeks = new Date(today.setDate(today.getDate() + 14)).toISOString().slice(0, 10);
    let weekstringin2months = new Date(today.setMonth(today.getMonth() + 1)).toISOString().slice(0, 10);

    let url

    if (findingspecifichours !== false) {
        url = `https://hdc.smartschool.be/planner/api/v1/planned-elements/user/${school_id}_${user_id}_${user_lt}?from=${todaystring}&to=${weekstringin2months}&types=planned-placeholders`;
    } else {
        url = `https://hdc.smartschool.be/planner/api/v1/planned-elements/user/${school_id}_${user_id}_${user_lt}?from=${todaystring}&to=${todayin2weeks}&types=planned-placeholders`;
    }

    let headers = new Headers({
        'Cookie': Object.values(cookies).join('; '),
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)',
        'Accept-Encoding': 'gzip, deflate',
        'Accept-Language': 'en-US,en;q=0.9'
    });
    let options = {
        method: 'GET',
        headers: headers
    };

    let response = await fetch(url, options);
    let data = await response.json();
    // format in which data is returned:
    /*[{"id":"003a2652-86fb-5175-8a53-fb3c4e7f6dca","platformId":3589,"period":{"dateTimeFrom":"2023-10-10T11:20:00+02:00","dateTimeTo":"2023-10-10T12:10:00+02:00","wholeDay":false,"deadline":false},"organisers":{"users":[{"id":"3589_6736_0","pictureHash":"initials_PC","pictureUrl":"https:\/\/userpicture20.smartschool.be\/User\/Userimage\/hashimage\/hash\/initials_PC\/plain\/1\/res\/128","description":{"startingWithFirstName":"","startingWithLastName":""},"name":{"startingWithFirstName":"Pietro CAPUTO","startingWithLastName":"CAPUTO Pietro"},"sort":"caputo-pietro"}]},"participants":{"groups":[{"identifier":"3589_1320","id":"3589_1320","platformId":3589,"name":"6EMT","type":"K","icon":"briefcase","sort":"6EMT"},{"identifier":"3589_150","id":"3589_150","platformId":3589,"name":"6EWI","type":"K","icon":"briefcase","sort":"6EWI"},{"identifier":"3589_164","id":"3589_164","platformId":3589,"name":"6LWIe","type":"K","icon":"briefcase","sort":"6LWIe"},{"identifier":"3589_1756","id":"3589_1756","platformId":3589,"name":"6GWIi","type":"K","icon":"briefcase","sort":"6GWIi"},{"identifier":"3589_1758","id":"3589_1758","platformId":3589,"name":"6WEWIe1","type":"K","icon":"briefcase","sort":"6WEWIe1"},{"identifier":"3589_1760","id":"3589_1760","platformId":3589,"name":"6WEWIe2","type":"K","icon":"briefcase","sort":"6WEWIe2"},{"identifier":"3589_202","id":"3589_202","platformId":3589,"name":"6MTWE","type":"K","icon":"briefcase","sort":"6MTWE"},{"identifier":"3589_208","id":"3589_208","platformId":3589,"name":"6LWIi","type":"K","icon":"briefcase","sort":"6LWIi"},{"identifier":"3589_3268","id":"3589_3268","platformId":3589,"name":"6HW1","type":"K","icon":"briefcase","sort":"6HW1"},{"identifier":"3589_3270","id":"3589_3270","platformId":3589,"name":"6HW2","type":"K","icon":"briefcase","sort":"6HW2"},{"identifier":"3589_36","id":"3589_36","platformId":3589,"name":"6LMT","type":"K","icon":"briefcase","sort":"6LMT"},{"identifier":"3589_4224","id":"3589_4224","platformId":3589,"name":"6GWIe","type":"K","icon":"briefcase","sort":"6GWIe"},{"identifier":"3589_4226","id":"3589_4226","platformId":3589,"name":"6LWE","type":"K","icon":"briefcase","sort":"6LWE"},{"identifier":"3589_4228","id":"3589_4228","platformId":3589,"name":"6WEWIi2","type":"K","icon":"briefcase","sort":"6WEWIi2"},{"identifier":"3589_4230","id":"3589_4230","platformId":3589,"name":"6WEWIi1","type":"K","icon":"briefcase","sort":"6WEWIi1"},{"identifier":"3589_990","id":"3589_990","platformId":3589,"name":"6MTWI","type":"K","icon":"briefcase","sort":"6MTWI"}],"users":[],"groupFilters":{"filters":[],"additionalUsers":[]}},"plannedElementType":"planned-placeholders","isParticipant":true,"capabilities":{"canUserDelete":false,"canUserEdit":false,"canUserReplace":false,"canUserEditPresence":false,"canUserReschedule":false,"canUserChangeUserColor":true,"canUserChangeUserViewMetadata":true,"canUserSeeProperties":{"id":true,"platformId":true,"period":true,"organisers":true,"participants":true,"plannedElementType":true,"isParticipant":true,"capabilities":true,"courses":true,"locations":true}},"courses":[{"id":"eef50f6c-c37a-4c16-8983-77223dbc6f39","platformId":3589,"name":"SEM","scheduleCodes":["SEM"],"icon":"schoolbord","courseCluster":null,"isVisible":true}],"locations":[{"id":"89e42c46-4802-4241-9e03-3926a08483aa","platformId":3589,"platformName":"Heilige-Drievuldigheidscollege","number":"","title":"B2.5","icon":"","type":"mini-db-item","selectable":true}],"sort":"20231010112000_7_6EMT_","pinned":false,"color":"jazz-200"},{"id":"01fdfd0b-527c-5111-b7f8-1c14e4eaaa75","platformId":3589,"period":{"dateTimeFrom":"2023-09-19T08:20:00+02:00","dateTimeTo":"2023-09-19T09:10:00+02:00","wholeDay":false,"deadline":false},"organisers":{"users":[{"id":"3589_4478_0","pictureHash":"initials_MG","pictureUrl":"https:\/\/userpicture20.smartschool.be\/User\/Userimage\/hashimage\/hash\/initials_MG\/plain\/1\/res\/128","description":{"startingWithFirstName":"","startingWithLastName":""},"name":{"startingWithFirstName":"Martina GIULIANO","startingWithLastName":"GIULIANO Martina"},"sort":"giuliano-martina"}]},"participants":{"groups":[{"identifier":"3589_164","id":"3589_164","platformId":3589,"name":"6LWIe","type":"K","icon":"briefcase","sort":"6LWIe"},{"identifier":"3589_1756","id":"3589_1756","platformId":3589,"name":"6GWIi","type":"K","icon":"briefcase","sort":"6GWIi"},{"identifier":"3589_208","id":"3589_208","platformId":3589,"name":"6LWIi","type":"K","icon":"briefcase","sort":"6LWIi"},{"identifier":"3589_4224","id":"3589_4224","platformId":3589,"name":"6GWIe","type":"K","icon":"briefcase","sort":"6GWIe"},{"identifier":"3589_4226","id":"3589_4226","platformId":3589,"name":"6LWE","type":"K","icon":"briefcase","sort":"6LWE"},{"identifier":"3589_4228","id":"3589_4228","platformId":3589,"name":"6WEWIi2","type":"K","icon":"briefcase","sort":"6WEWIi2"}],"users":[],"groupFilters":{"filters":[],"additionalUsers":[]}},"plannedElementType":"planned-placeholders","isParticipant":true,"capabilities":{"canUserDelete":false,"canUserEdit":false,"canUserReplace":false,"canUserEditPresence":false,"canUserReschedule":false,"canUserChangeUserColor":true,"canUserChangeUserViewMetadata":true,"canUserSeeProperties":{"id":true,"platformId":true,"period":true,"organisers":true,"participants":true,"plannedElementType":true,"isParticipant":true,"capabilities":true,"courses":true,"locations":true}},"courses":[{"id":"ed02658f-27fb-499c-9062-940ff52b7011","platformId":3589,"name":"Engels","scheduleCodes":["ENG2","ENG3","ENG"],"icon":"schoolbord","courseCluster":{"id":25,"name":"Engels"},"isVisible":true}],"locations":[{"id":"f2bc6c3e-fd6b-40ee-81ee-f3df73fdb5d1","platformId":3589,"platformName":"Heilige-Drievuldigheidscollege","number":"","title":"B2.4","icon":"","type":"mini-db-item","selectable":true}],"sort":"20230919082000_7_6GWIe_","pinned":false,"color":"violet-500"},{"id":"02fd5294-0329-52b5-a448-1d006d08a3fe","platformId":3589,"period":{"dateTimeFrom":"2023-09-25T11:20:00+02:00","dateTimeTo":"2023-09-25T12:10:00+02:00","wholeDay":false,"deadline":false},"organisers":{"users":[{"id":"3589_3440_0","pictureHash":"initials_SO","pictureUrl":"https:\/\/userpicture20.smartschool.be\/User\/Userimage\/hashimage\/hash\/initials_SO\/plain\/1\/res\/128","description":{"startingWithFirstName":"","startingWithLastName":""},"name":{"startingWithFirstName":"Seppe OVAERE","startingWithLastName":"OVAERE Seppe"},"sort":"ovaere-seppe"}]},"participants":{"groups":[{"identifier":"3589_164","id":"3589_164","platformId":3589,"name":"6LWIe","type":"K","icon":"briefcase","sort":"6LWIe"},{"identifier":"3589_1756","id":"3589_1756","platformId":3589,"name":"6GWIi","type":"K","icon":"briefcase","sort":"6GWIi"},{"identifier":"3589_208","id":"3589_208","platformId":3589,"name":"6LWIi","type":"K","icon":"briefcase","sort":"6LWIi"},{"identifier":"3589_36","id":"3589_36","platformId":3589,"name":"6LMT","type":"K","icon":"briefcase","sort":"6LMT"},{"identifier":"3589_4224","id":"3589_4224","platformId":3589,"name":"6GWIe","type":"K","icon":"briefcase","sort":"6GWIe"},{"identifier":"3589_4226","id":"3589_4226","platformId":3589,"name":"6LWE","type":"K","icon":"briefcase","sort":"6LWE"},{"identifier":"3589_4228","id":"3589_4228","platformId":3589,"name":"6WEWIi2","type":"K","icon":"briefcase","sort":"6WEWIi2"}],"users":[],"groupFilters":{"filters":[],"additionalUsers":[]}},"plannedElementType":"planned-placeholders","isParticipant":true,"capabilities":{"canUserDelete":false,"canUserEdit":false,"canUserReplace":false,"canUserEditPresence":false,"canUserReschedule":false,"canUserChangeUserColor":true,"canUserChangeUserViewMetadata":true,"canUserSeeProperties":{"id":true,"platformId":true,"period":true,"organisers":true,"participants":true,"plannedElementType":true,"isParticipant":true,"capabilities":true,"courses":true,"locations":true}},"courses":[{"id":"752570d3-c5e9-497b-bea8-d64f780dc856","platformId":3589,"name":"Lichamelijke opvoeding2","scheduleCodes":["LO2","LO"],"icon":"schoolbord","courseCluster":{"id":44,"name":"Lichamelijke opvoeding"},"isVisible":true}],"locations":[{"id":"52bd8ea1-ff68-4ba3-be2f-ab4d90546847","platformId":3589,"platformName":"Heilige-Drievuldigheidscollege","number":"","title":"LOL4","icon":"","type":"mini-db-item","selectable":true}],"sort":"20230925112000_7_6GWIe_","pinned":false,"color":"lavender-500"},{"id":"033d49e7-e730-59d0-95c5-de36766a8fb3","platformId":3589,"period":{"dateTimeFrom":"2023-09-28T09:20:00+02:00","dateTimeTo":"2023-09-28T10:10:00+02:00","wholeDay":false,"deadline":false},"organisers":{"users":[{"id":"3589_7912_0","pictureHash":"initials_TS","pictureUrl":"https:\/\/userpicture20.smartschool.be\/User\/Userimage\/hashimage\/hash\/initials_TS\/plain\/1\/res\/128","description":{"startingWithFirstName":"","startingWithLastName":""},"name":{"startingWithFirstName":"Tine SCHELLEKENS","startingWithLastName":"SCHELLEKENS Tine"},"sort":"schellekens-tine"}]},"participants":{"groups":[{"identifier":"3589_150","id":"3589_150","platformId":3589,"name":"6EWI","type":"K","icon":"briefcase","sort":"6EWI"},{"identifier":"3589_164","id":"3589_164","platformId":3589,"name":"6LWIe","type":"K","icon":"briefcase","sort":"6LWIe"},{"identifier":"3589_1756","id":"3589_1756","platformId":3589,"name":"6GWIi","type":"K","icon":"briefcase","sort":"6GWIi"},{"identifier":"3589_208","id":"3589_208","platformId":3589,"name":"6LWIi","type":"K","icon":"briefcase","sort":"6LWIi"},{"identifier":"3589_4224","id":"3589_4224","platformId":3589,"name":"6GWIe","type":"K","icon":"briefcase","sort":"6GWIe"},{"identifier":"3589_990","id":"3589_990","platformId":3589,"name":"6MTWI","type":"K","icon":"briefcase","sort":"6MTWI"}],"users":[],"groupFilters":{"filters":[],"additionalUsers":[]}},"plannedElementType":"planned-placeholders","isParticipant":true,"capabilities":{"canUserDelete":false,"canUserEdit":false,"canUserReplace":false,"canUserEditPresence":false,"canUserReschedule":false,"canUserChangeUserColor":true,"canUserChangeUserViewMetadata":true,"canUserSeeProperties":{"id":true,"platformId":true,"period":true,"organisers":true,"participants":true,"plannedElementType":true,"isParticipant":true,"capabilities":true,"courses":true,"locations":true}},"courses":[{"id":"cfb8d337-2d8b-4b71-803a-30f2b9dc1d54","platformId":3589,"name":"Chemie","scheduleCodes":["CHE1","CHE2","CHE"],"icon":"atom","courseCluster":{"id":20,"name":"Chemie"},"isVisible":true}],"locations":[{"id":"da57165c-611d-41c3-906e-786dcab17031","platformId":3589,"platformName":"Heilige-Drievuldigheidscollege","number":"","title":"CHEL1","icon":"potion_yellow","type":"mini-db-item","selectable":true}],"sort":"20230928092000_7_6EWI_","pinned":false,"color":"aqua-500"},...*/

    let classes = [];


    for (let element of data) {
        // add name of subject with - and then the classes
        if (findingspecifichours !== false) {
            let subjectname = element.courses[0].name;
            let subjectclasses = element.participants.groups.map(group => group.name);
            // if the subject is not yet in the array, add it
            let subject = subjectname + " - " + subjectclasses.join(", ");
            if (subject === findingspecifichours){
                classes.push(element);
            }
        } else {
            let subjectname = element.courses[0].name;
            let subjectclasses = element.participants.groups.map(group => group.name);
            // if the subject is not yet in the array, add it
            let subject = subjectname + " - " + subjectclasses.join(", ");
            if (!classes.includes(subject)) {
                classes.push(subject);
            }
        }
    }
    console.log(classes)
    console.log("Returning classes")

    return classes;
}

let popupvisible = false;

// Insert "HT Inplannen" button
let button = document.createElement("button");
button.innerHTML = "HT Inplannen";
button.classList = "btn js-btn";

button.addEventListener("click", function (qualifiedName, value) {
    if (popupvisible === false) {
        console.log("Button clicked");

        /*
        Popup HTML:
           <div bubble="" class="bubble js-bubble selectview selectviewlist__container" tabindex="-1" x-placement="bottom" style="position: absolute; top: 104px; left: 1507px; will-change: top, left;"><div class="selectviewlist js-selectviewlist"><div class="selectview__container"><div class="radiobutton-group"><label class="radiobutton js-radiobutton selectview__hotkey-W"><input type="radio" name="radiobuttons" class="" value="undefined"><span class="">Weekweergave</span></label><label class="radiobutton js-radiobutton selectview__hotkey-M"><input type="radio" name="radiobuttons" class="" value="undefined"><span class="">Maandweergave</span></label><label class="radiobutton js-radiobutton selectview__hotkey-T"><input type="radio" name="radiobuttons" class="" value="undefined"><div class="selectview__forwardview"><div class="">Vandaag en volgende</div><button class="btn btn--select-dropdown js-btn selectview__dropdown">4</button><div class="">dagen</div></div></label><label class="radiobutton js-radiobutton selectview__hotkey-L"><input type="radio" name="radiobuttons" class="" value="undefined"><span class="">Lijstweergave</span></label></div></div><hr class="separator"><div class="selectview__checkboxes-container"><label class="checkbox js-checkbox selectview__checkbox"><input type="checkbox" class="" value="undefined"><span class="">To-dolijst</span></label><div class="selectview__beforeandafter js-selectview-beforeandafter"><label class="checkbox js-checkbox selectview__checkbox"><input type="checkbox" class="" value="undefined"><span class=""></span></label><span class="">Uren verbergen voor</span><button class="btn btn--select-dropdown js-btn selectview__timefrom">07:00</button><span class="">en na</span><button class="btn btn--select-dropdown js-btn selectview__timeto">19:00</button></div><label class="checkbox js-checkbox selectview__checkbox"><input type="checkbox" class="" value="undefined"><span class="">Weekend tonen</span></label></div></div><div class="bubble__arrow" style="left: 276px;"><svg width="20" height="10" viewBox="0 0 20 10">
            <polyline points="0 11 10 1 20 11"></polyline>
          </svg></div></div>*/

        // create instead of the above in the same style:
        // 1. Class Selector (give option to choose from classes to who you give class)
        // 2. Date Selector (give option to date and class hour)
        // 3. Name Selector (give option to enter name of HT)
        // 4. Submit button and cancel button

        // create popup
        let popup = document.createElement("div");
        popup.classList = "bubble js-bubble selectview selectviewlist__container";
        popup.setAttribute("bubble", "");
        popup.setAttribute("tabindex", "-1");
        popup.setAttribute("x-placement", "bottom");
        popup.setAttribute("style", "position: absolute; top: 104px; left: 1507px; will-change: top, left;");
        document.body.appendChild(popup);

        // dropdown allowing to select class (like: <button class="btn btn--select-dropdown js-btn selectview__dropdown">4</button><div class="">dagen)

        let classdropdown = document.createElement("button");
        classdropdown.classList = "btn btn--select-dropdown js-btn selectview__dropdown";
        classdropdown.innerHTML = "Selecteer klas";
        popup.appendChild(classdropdown);

        GetClassesThatTeachersTeach().then(classes => {
            classdropdown.addEventListener("click", function() {
                // create a dropdown with all the classes, make the dropdown small and make it scrollable, when
                // a class is clicked, add it to the button and still keep the dropdown open

                let classdropdownmenu = document.createElement("div");
                // scrollable and I want the displayed height to be 200px but that you can scroll through all the classes

                classdropdownmenu.setAttribute("style", "height: 200px; width: 250px; position: absolute; top: 150px; left: 1507px; size: absolute; overflow-y: scroll; overflow-x: hidden;")
                classdropdownmenu.classList = "bubble js-bubble hour-select__bubble";
                classdropdownmenu.setAttribute("bubble", "");
                classdropdownmenu.setAttribute("tabindex", "-1");
                classdropdownmenu.setAttribute("x-placement", "bottom");
                document.body.appendChild(classdropdownmenu);

                for (let classname of classes) {
                    let classbutton = document.createElement("button");
                    classbutton.classList = "bubble__menu-btn js-menu-btn bubble__menu-btn--no-icon";
                    classbutton.setAttribute("style", "margin-top: 10px; margin-bottom: 10px; width: 100%; font-size: 13px; text-align: left; min-height: 37px;");
                    let shortenedClassname = classname.substring(0, 50) + "...";
                    classbutton.innerHTML = shortenedClassname;
                    classbutton.addEventListener("click", function() {
                        classdropdownmenu.remove();
                        classdropdown.innerHTML = classname;
                    });
                    classdropdownmenu.appendChild(classbutton);

                }

            });
        });


        // date selector
        // class needs to be selected first before the date can be selected
        let datedropdown = document.createElement("button");
        datedropdown.classList = "btn btn--select-dropdown js-btn selectview__dropdown";
        datedropdown.innerHTML = "Selecteer datum";
        popup.appendChild(datedropdown);

        datedropdown.addEventListener("click", function() {
            // check if class is selected
            if (classdropdown.innerHTML === "Selecteer klas") {
                alert("Selecteer eerst een klas");
            }
            else {
                CalculateDaysWhenAClassIsGiven(classdropdown.innerHTML).then(classhours => {
                   console.log(classhours);
                   console.log("HI")
                   // create a dropdown with all the classes, make the dropdown small and make it scrollable, when button is clicked do same as with the class selector

                    let datedropdownmenu = document.createElement("div");

                    datedropdownmenu.setAttribute("style", "height: 200px; width: 250px; position: absolute; top: 150px; left: 1507px; size: absolute; overflow-y: scroll; overflow-x: hidden;")
                    datedropdownmenu.classList = "bubble js-bubble hour-select__bubble";
                    datedropdownmenu.setAttribute("bubble", "");
                    datedropdownmenu.setAttribute("tabindex", "-1");
                    datedropdownmenu.setAttribute("x-placement", "bottom");
                    document.body.appendChild(datedropdownmenu);

                    // [{"id":"003a2652-86fb-5175-8a53-fb3c4e7f6dca","platformId":3589,"period":{"dateTimeFrom":"2023-10-10T11:20:00+02:00","dateTimeTo":"2023-10-10T12:10:00+02:00","wholeDay":false,"deadline":false},"organisers":{"users":[{"id":"3589_6736_0","pictureHash":"initials_PC","pictureUrl":"https:\/\/userpicture20.smartschool.be\/User\/Userimage\/hashimage\/hash\/initials_PC\/plain\/1\/res\/128","description":{"startingWithFirstName":"","startingWithLastName":""},"name":{"startingWithFirstName":"Pietro CAPUTO","startingWithLastName":"CAPUTO Pietro"},"sort":"caputo-pietro"}]},"participants":{"groups":[{"identifier":"3589_1320","id":"3589_1320","platformId":3589,"name":"6EMT","type":"K","icon":"briefcase","sort":"6EMT"},{"identifier":"3589_150","id":"3589_150","platformId":3589,"name":"6EWI","type":"K","icon":"briefcase","sort":"6EWI"},{"identifier":"3589_164","id":"3589_164","platformId":3589,"name":"6LWIe","type":"K","ico

                    console.log(classhours)
                    // loop trough json and add all the dates to the dropdown



                    /*if (classhours !== undefined) {
                        console.log("classhours is not undefined")
                        for (let i = 0; i < classhours.length; i++) {
                            let classhou = classhours[i];
                            let classbutton = document.createElement("button");
                            classbutton.classList = "bubble__menu-btn js-menu-btn bubble__menu-btn--no-icon";
                            classbutton.setAttribute("style", "margin-top: 10px; margin-bottom: 10px; width: 100%; font-size: 13px; text-align: left; min-height: 37px;");
                            let shortenedClasshour = classhour.period.dateTimeFrom.substring(0, 10) + " " + classhou.period.dateTimeFrom.substring(11, 16) + " - " + classhou.period.dateTimeTo.substring(11, 16);
                            classbutton.innerHTML = shortenedClasshour;
                            classbutton.addEventListener("click", function() {
                                datedropdownmenu.remove();
                                datedropdown.innerHTML = classhour;
                            });
                            datedropdownmenu.appendChild(classbutton);
                        }
                    }*/

                });
            }
        });

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
        console.log(data);
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

// hi