const Apify = require('apify');
const FormData = require('form-data');
const axios = require('axios');
const geolib = require('geolib');
const utils = require('./utils');
const syncToDgfc = require('./sync');

const { utils: { log } } = Apify;
log.setLevel(log.LEVELS.DEBUG);

const PAGESIZE = 400;
const VERSION1LEADTYPES = [
    "absentee owners",
    "bored investor",
    "foreclosures",
    "potentially inherited",
    "pre-foreclosure",
    "vacancy",
    "zombie property",
]


const bodyData = {
    "filterProperties": {
        "includeAllLeadTypes": true,
        "places": [],
        "leadTypes": [],
        "ownerTypes": ["NONE", "TRUST"],
        "propertyTypes": [],
        "clusterPrecision": 5,
        "clusterSize": 150,
        "polygons": [],
        "location": {},
        "bounds": {
            "topLeft": {
                "lat": 48.890722,
                "lng": -122.883250
            },
            "bottomRight": {
                "lat": 25.421247,
                "lng": -80.548936
            }
        }
    },
    "order": {
        "field": "distance",
        "direction": "asc"
    },
    "pagination": {
        "page": 1,
        "pageSize": PAGESIZE
    },
    "selection": {
        "includeAll": false,
        "include": [],
        "exclude": [],
        "count": 0
    },
    "export": {
        "type": null,
        "format": null,
        "includePreForeclosureFields": false
    }
}


Apify.main(async () => {
    const input = await Apify.getInput();

    await utils.login();
    const { places, location } = await utils.createPlaces(input);
    await createBody(input);

    bodyData.filterProperties.places = places;
    bodyData.filterProperties.location = location;
    let records = await utils.getAllLeadsRecords(bodyData);
    console.log("======> :: MAIN data  records getAllLeadsRecords", records);
    await Apify.pushData(records);
    if (input.apiKey && input.tag) {
        console.log("syncing to D.GFC")
        const key = input.apiKey;
        const tag = input.tag;
        await syncToDgfc(records, key, tag);
        console.log("Sync Done.");
    }
});

async function createBody(input) {
    console.log("======> ::main  input", input);
    if (input.version == "version1") {
        bodyData.filterProperties.leadTypes = VERSION1LEADTYPES;
        bodyData.filterProperties.includeAllLeadTypes = false;
    } else if (input.version == "version2") {
        bodyData.filterProperties.leadTypes = []
    }

    if (input.bathroomMin) {
        bodyData.filterProperties.bathrooms = { minimum: input.bathroomMin };
    }

    if (input.lastSaleDateMin || input.lastSaleDateMax) {
        bodyData.filterProperties.lastSaleDate = {}
        if (input.lastSaleDateMin) {
            bodyData.filterProperties
                .lastSaleDate.minimum = input.lastSaleDateMin
        }
        if (input.lastSaleDateMax) {
            bodyData.filterProperties.lastSaleDate.maximum = input.lastSaleDateMax
        }
        bodyData.filterProperties.lastSaleDateCustom = bodyData.filterProperties.lastSaleDate;
    }

    if (input.propertyValueMin || input.propertyValueMax) {
        bodyData.filterProperties.value = {}
        if (input.propertyValueMin) {
            bodyData.filterProperties.value.minimum = input.propertyValueMin;
        }

        if (input.propertyValueMax) {
            bodyData.filterProperties.value.maximum = input.propertyValueMax;
        }
    }
    if (input.squareFeetMin || input.squareFeetMax) {
        bodyData.filterProperties.livingArea = {}
        if (input.squareFeetMin) {
            bodyData.filterProperties.livingArea.minimum = input.squareFeetMin;
        }
        if (input.squareFeetMax) {
            bodyData.filterProperties.livingArea.maximum = input.squareFeetMax;
        }
    }

    if (input.loanToValueMax) {
        bodyData.filterProperties.loanToValue = { maximum: input.loanToValueMax };
    }

    if (input.ownerTypes) {
        bodyData.filterProperties.ownerTypes = input.ownerTypes;
    }
    if (input.propertyTypes) {
        bodyData.filterProperties.propertyTypes = input.propertyTypes;
    }
    if (input.blankSalesDates) {
        bodyData.filterProperties.blankSalesDates = {}
        if (blankSalesDates === false) {
            bodyData.filterProperties.blankSalesDates = ""
        }
        else {
            bodyData.filterProperties.blankSalesDates = input.blankSalesDates;
        }
    }

    console.log("======> :: createBody bodyData main ", bodyData);
}
