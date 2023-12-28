const AWS = require('aws-sdk');
const client = new AWS.SecretsManager({
    region: process.env.AWS_REGION,
});
const fs = require('fs');

const secretName = process.env.AWS_SECRET;
console.log(secretName)

client.getSecretValue({ SecretId: secretName }, (err, data) => {
    if (err) {
        console.log(`Error retrieving secret ${secretName}: ${err}`);
    } else {
        const secret = data.SecretString;
        console.log(`Retrieved secret ${secretName}`);

        const obj = JSON.parse(secret);
        const str = Object.entries(obj).map(([key, value]) => `${key}="${value}"`).join('\n');

        const fileName = '.env';
        const fileContent = str;

        fs.writeFile(fileName, fileContent, (err) => {
            if (err) throw err;
            console.log(`${fileName} has been created.`);
        });
    }
});

