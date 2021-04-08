const puppeteer = require('puppeteer');
const axios = require('axios');
const geolib = require('geolib')
const excludeTags = ["cash-buyer", "active-listing"];

const realeFlowLoginURL = "https://awesome.realeflow.com/Account/Account/LogOn";
const userName = "rdlib@yahoo.com";
const password = "bgt6&YHN"
let places = [];
let coordinates = [];
let locationLatLng;
let authCookies;
// authCookies = 'ASP.NET_SessionId=ijqiokzy2cgq5teua2fgvvvm; rf-api-auth=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1bmlxdWVfbmFtZSI6IjI0Mjc4OSIsImVtYWlsIjoicmRsaWJAeWFob28uY29tIiwic2l0ZSI6IjIwMDYxMiIsImRvbWFpbiI6IjEiLCJyb2xlIjpbIlVzZXJBZG1pbmlzdHJhdG9ycyIsIkZ1bGxBY2Nlc3MiLCJUYXNrcyIsIkxlYWRwaXBlcyIsIk1hcmtldGluZyBMaWJyYXJ5IiwiUHJlbWl1bVdlYnNpdGVzIiwiV2Vic2l0ZXMiLCJMZWFkcGlwZXMgQUkiLCJEb2N1bWVudHMiLCJTbW9vdGhGYXgiLCJEZWFsIEFuYWx5emVyIiwiQ29tcHMiLCJEaXJlY3QgTWFpbCIsIkNhblNldHVwU21vb3RoRmF4IiwiSGFtbWVycG9pbnQiLCJNb2J5IiwiQWR2YW5jZWQgQ1JNIiwiV2lkZ2V0cyIsIkJhc2ljIENSTSIsIiIsIlByZW1pdW1MZWFkcGlwZXMiLCJGaW5hbmNpbmciXSwibmJmIjoxNjA0OTA1NTMwLCJleHAiOjE3NjI2NzE5MzAsImlhdCI6MTYwNDkwNTUzMCwiaXNzIjoicmVhbGVmbG93IiwiYXVkIjoicmVhbGVmbG93LWFwaSJ9.--NuWTDSDoiHQacYynaJXlkrZA6EOn2oWsFcVG82EE4; .ASPXAUTH=411AA34888BF535176E902C85A5A8EE2A800FB5ED4C1A9E122F528B2B7038A0822CCDD993FF5D2A15F19AB8615A30F816FFD15B94D7EA246AFFD20AD7F1CF5A7DB38F909B116543ACC1A3236B74D98E3492B40EE36528F8994F11D901A48E75B4D7754C4; .AspNet.ApplicationCookie=W_TGUTz4c2fHPqpTilkfCzhNby5U_w_pZTJ-n4OD_C0FT_9JT9BWxZ5mqixhJm3vkIpz0d1O1nMMR2t8FFjhLjKCT6o81VPGcoDX3mRNBqKEyg2TxKzV2JtACgMsSGx6nPkVlKlkNk4WbgOaQnmUWJgaWd-uH4KJNUtnPgjplYJMxVduEFoyHLKjfwyPgsoiyE-3moK82OkCmGuAdrigw1xgmm0Ku532wfO-L6moYRxpN_9IXd-WOLGA1zz2WHRGe4995A; .ASPXROLES=H1-Yv3uH9sGijclaEh9gsCmSs9EqfpjE0vwLQPoI57gQmSHGfrdAVYCnyqvWmv1Gy1W5TVIPWM9x8dqfMWvX2evAQRKAqN7AcvlnSRPKDRZW5esay_a4wNVrwurkVrUK6CtRX_YCWBAvmH-KTwg2Anz-rJvrw7z-WDBbGUTFpXbfAUGWTjELgbnC-4wpg2omwUhYKi39MwVljdaKo-4MYn5cKB2nUaAT51U1BGZGJet5vzKrDGEymwRlA3RKkBB3TqXeGAP0NoDXwPanGPBLth0-ErWIJbRMSXjA6oe6ioIKbxzED8wRQ8zzBLJ9S0SvmZvcyDMK0SjmBsDvrAkaS0DiV6arwkuAOCepCsVnlhWblvJm1-nXKepOhRVpp_asJG2s4EEDY4QtkUz66EPC4XNYuDX683o_76ZuAmntGr8NiRT3ojEBH7Dofr8Qe8Os8LmN4nKVwqE2SdTNBByk_nERWjYuAoQ602ODf_B2zl5_pVhghPNEs7GIuQ9TH76IH1pnLRUY0ukmzPi8P7CNtDFLjrRAgFwotL-PdxvoTn48VKmbJ1uPGbF8g_ldueA99XwEZUhpvvUiWxbAjTzx9WpKD5mRq5_d6VIPetV3A2eF3oHZ0oXCpYH6E2FcAWQWziiT7NLo37xnvD2dXXBrHj9XOHmH0V2Qemb-S2cNU0yDdYbw0_twccS7yfy54YMKXlpjhuavFVlhIiVS4g2KsYmI3V7H-zHAjwa8pTuVZyLE4FSXyj6o_icyAWSpwYXBdcSquUKLbiQmwoEEiIxdYezgUDj_2-YVgfmsqXdEb_2HdKxUTvfAm9NQGKMscvEUUxf17w2;';

const checkExcludeTags = (tags) => {
    for (let i = 0; i < excludeTags.length; i++) {
        if (tags.includes(excludeTags[i])) return true;
    }
    return false;
}
const getHeaders = () => new Promise(async (resolve, reject) => {
    let resolved = false;
    const waitFor = async (timeout) => new Promise(res => setTimeout(res, timeout));
    console.info("logging in");
    const browser = await puppeteer.launch({
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--ignore-certificate-errors',
        ]
    });
    const page = await browser.newPage();
    await page.setViewport({
        width: 1440,
        height: 985
    });

    page.on('response', (response) => {
        let url = response.url();
        if (url.includes(realeFlowLoginURL) && response.status() == 302) {
            console.info("logged in");
            resolved = true;
            resolve(response.headers());
        }
    })

    await page.goto(realeFlowLoginURL, { waitUntil: "networkidle2" });
    await waitFor(5000);

    await page.type("#Email", userName);
    await page.type("#Password", password);
    await page.waitForSelector("#welcome-body > form > div:nth-child(5) > button");
    await page.click("#welcome-body > form > div:nth-child(5) > button");

    // await page.setRequestInterception(true)
    // await page.waitForNavigation();


    setTimeout(() => {
        if (!resolved) {
            browser.close();
            reject("Failed to get authCookies.");
        }
        browser.close();
    }, 30000);


});

exports.login = async function login() {
    try {
        let authTokens = "";
        let headers = await getHeaders();
        let cookies = headers["set-cookie"];
        cookies = cookies.split("\n");
        cookies.forEach(cookie => {
            authTokens = authTokens + cookie + ";"
        });
        authCookies = authTokens;
    }
    catch (error) {
        console.log(error);
    }
}

exports.createPlaces = async function createPlaces(inputParam) {

    places = [];
    coordinates = [];

    let locations = inputParam.location;

    for (let i = 0; i < locations.length; i++) {
        let locationGeoDetails = await fetchData(locations[i]);
        for (let j = 0; j < locationGeoDetails.length; j++) {
            normlizeData(locationGeoDetails[j], locationGeoDetails[j].type);
        }
    }

    if (places.length > 1) {
        locationLatLng = geolib.getCenterOfBounds(coordinates);
    }

    console.log("======> util  :: places", places);
    console.log("======> util :: locationLatLng.longitude, lat: locationLatLng.latitude", locationLatLng.longitude, locationLatLng.latitude);

    return { places: places, location: { lng: locationLatLng.longitude, lat: locationLatLng.latitude } };
}

async function fetchData(place) {
    let data = await axios({
        method: 'get',
        url: `https://addy.cdn.flipcomp.com/2020043014/search/${place}?entities=county,city,zip,address&key=fb67bd77c4a9eeef1dbcdb0c746b3f74de9f6316`
    });
    console.log("======> :: fetch data.data", data.data);
    return data.data;
}

async function normlizeData(area, type) {
    delete area[type]["shape"];
    places.push({ ...area, value: area.text.toUpperCase() });
    locationLatLng = { latitude: area[type]["latitude"], longitude: area[type]["longitude"] };
    coordinates.push(locationLatLng);
}

exports.getAllLeadsRecords = async function getAllLeadsRecords(bodyData) {
    try {
        let count = 1;
        let totalCount = count;
        let leads = [];
        do {
            console.log("Fetching property data");
            let getLeads = await axios.request({
                url: "https://awesome.realeflow.com/publy/leads",
                method: "post",
                data: bodyData,
                headers: {
                    Cookie: authCookies
                }
            })

            if (!getLeads.data) break;
            totalCount = getLeads.data.pageCount;
            console.log(`${bodyData.pagination.page} of ${totalCount} (${getLeads.data.totalItemCount} records)`);
            count++;
            bodyData.pagination.page = count;
            console.log("======> :: getLeads.data.listItems", getLeads.data.listItems.length);
            if (getLeads.data.listItems) {
                for (let i = 0; i < getLeads.data.listItems.length; i++) {
                    let listItem = getLeads.data.listItems[i];
                    let tags = formatTag(listItem.tags);
                    if (checkExcludeTags(tags)) continue;
                    await waitFor(1500);
                    await addAiScoreTag(listItem);
                    let r = format(listItem);
                    if (r.tags.length === 0) continue;
                    r.tags = r.tags.join(',');
                    leads.push(r);
                }
            }

        } while (count <= totalCount)

        // return JSON.stringify(leads);
        return leads;
    } catch (error) {
        console.log(error)
    }


}

function format(item) {
    let tmp = {};
    tmp.address = item.address;
    tmp.city = item.city;
    tmp.state = item.state;
    tmp.zipCode = item.zipCode;
    tmp.ownerFirstName = (item.lastName == '' || item.lastName == null) ? '' : item.firstName;
    tmp.ownerLastName = (item.lastName == '' || item.lastName == null) ? item.firstName : item.lastName;
    tmp.mailingAddress = item.mailingAddress;
    tmp.mailingCity = item.mailingCity;
    tmp.mailingState = item.mailingState;
    tmp.mailingZipCode = item.mailingZipCode;
    tmp.addressHash = item.addressHash;
    tmp.tags = formatTag(item.tags);
    tmp.ownertype = item.ownerType;
    return tmp;
}



async function addAiScoreTag(record) {
    console.log("======> addAiScoreTag:: ", record.firstName);
    console.info(`fetching ai score for ${record.addressHash}`)
    const indexwls = await indexWls(record.addressHash);
    let tagArr = record.tags;
    if (indexwls > 750) {
        tagArr.push("ai-high");
    }
}

const waitFor = async (timeout) => new Promise(res => setTimeout(res, timeout));

const indexWls = (addressHash) => new Promise(async (resolve, reject) => {
    let resovled = false;
    setTimeout(() => {
        if (!resovled) {
            console.log("get the new cookie")
            reject("failed to get data")
        }
    }, 20000);

    // console.log(`https://awesome.realeflow.com/publy/property/${addressHash}`);
    const data = await axios.request({
        url: `https://awesome.realeflow.com/publy/property/${addressHash}`,
        method: "get",
        headers: {
            Cookie: authCookies
        }
    });
    resovled = true;
    resolve(data.data.indexWls);
})

function formatTag(tags) {

    for (let i = 0; i < tags.length; i++) {
        if (tags[i] == "Absentee Owner") {
            tags[i] = "absentee"
            continue
        }
        if (tags[i] == "Free & Clear") {
            tags[i] = "free-clear"
            continue
        } else {
            tags[i] = tags[i].toLowerCase();
            tags[i] = tags[i].replace(" ", "-");
        }
    }

    return tags;
}

