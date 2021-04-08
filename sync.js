const fetch = require('node-fetch');

const formatForDgfc = (r) => ({
    "First Name": r.ownerFirstName,
    "Last Name": r.ownerLastName,
    "Property Address": r.address,
    "Property City": r.city,
    "Property State": r.state,
    "Property Zip": r.zipCode,
    "Mailing Address": r.mailingAddress,
    "Mailing City": r.mailingCity,
    "Mailing State": r.mailingState,
    "Mailing Zip": r.mailingZipCode,
    "Tag": r.tags,
});

async function send(propertyRecords, apiKey, tag) {
    const records = propertyRecords.map(formatForDgfc);
    const resp = await fetch('https://dm.goforclose.com/api/LoadData', {
        method: 'post',
        headers: {
            "Authentication": apiKey,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "duplicatePolicy": "UpdateWhereBlank",
            "tagPolicy": "AddTagToAllRecord",
            "tags": [tag],
            "data": records,
        }),
    });
    console.log("======> :: resp");

    if (resp.status !== 200) {
        const text = await resp.text();
        throw new Error(text);
    }

    // console.log(`Total ${insertCount} records inserted (grouped by tags)`);
}

module.exports = send;