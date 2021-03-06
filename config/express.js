const express = require('express');
const bodyParser = require('body-parser');
const rawBodyParser = require('../app/middleware/rawbodyparser');
const multer = require('multer');
const allowCrossOriginRequests = function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, X-Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE');
    next();
};

const jsonParser = bodyParser.json();
const rawParser = rawBodyParser.rawParser;
const upload = multer({ limits: { fileSize: 20e6 } });
const multipartParser = upload.single('image');  // 20 MB


function dynamicBodyParser(req, res, next) {
    const contentType = req.header('Content-Type') || '';
    if (contentType === 'image/jpeg' || contentType === 'image/png' || contentType === 'text/plain') {
        rawParser(req, res, next);
    } else if (contentType.startsWith('multipart/form-data')) {
        multipartParser(req, res, next);
    } else {
        jsonParser(req, res, next);
    }
}
module.exports = function () {
    // INITIALISE EXPRESS //
    const app = express();
    app.use(dynamicBodyParser);
    app.use(allowCrossOriginRequests);
    app.use((req, res, next) => {
        console.log(`##### ${req.method} ${req.path} #####`);
        next();
    });
    app.rootUrl = '/api/v1';

    //ROUTES//
    require('../app/routes/users.routes')(app);
    require('../app/routes/post.routes')(app);
    require('../app/routes/comment.routes')(app);
    require('../app/routes/message.routes')(app);
    require('../app/routes/photos.routes')(app);
    return app;
};