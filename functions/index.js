const functions = require('firebase-functions');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();

const cors = require('cors')({origin: true});
app.use(cors);

const router = express.Router();
app.use('/api/v1', router);

router.get('/hello-world', (req, res) => {
    res.json('Hello World!');
});

exports.app = functions.https.onRequest(app);
  