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

async function getPlannedElements(startDate, endDate) {

    let url = `https://hdc.smartschool.be/planner/api/v1/planned-elements/user/${schoolid}_${userid}_${userlt}?from=${startDate}&to=${endDate}&types=planned-assignments,planned-to-dos,planned-lessons`;
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
    let data = await response.json();
    return data;
}


// infinite loop to keep script running

let i = 0;
while (i < 1) {
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
}