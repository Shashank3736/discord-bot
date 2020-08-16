const rescursive = require('recursive-readdir');
const CaptchaClient = require('./src/base/client');

const client = new CaptchaClient()

rescursive('./src/commands', ['messages.js'], function(err, files) {
    console.log(files)
})