console.log('agenda.js loaded');


function getCookies(msg) {
    return function() {
        console.log(msg);
        chrome.cookies.getAll({}, cookies => console.log(JSON.stringify(cookies)));
    }
}

//printCookies('agenda.js loaded')();

async function getPlannedElements(startDate, endDate) {
    let url = `https://hdc.smartschool.be/planner/api/v1/planned-elements/user/3589_5362_0?from=${startDate}&to=${endDate}&types=planned-assignments,planned-to-dos,planned-lessons`;
    let cookies = await getCookies("getting cookies");
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


getPlannedElements('2023-09-01', '2024-10-10')
    .then(data => {
        console.log(data);
        for (let element of data) {
            console.log(element.name);
        }
    })
    .catch(error => console.error(error));