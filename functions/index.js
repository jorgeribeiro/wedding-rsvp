const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();

const cors = require('cors');
app.use(cors({ origin: true }));

const router = express.Router();
app.use('/api/v1', router);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

admin.initializeApp(functions.config().firebase);

const db = admin.firestore();
const invitationsCollection = 'invitations';

router.get('/hello-world', (req, res) => {
    res.json('Hello World!');
});

router.post('/invitation', (req, res) => {
    try {
        let params = req.body;
        let invitationCode = generateInvitationCode();

        // TODO: verify uniqueness of invitationCode generated

        let family = [];
        let familyArray = params['family'];
        familyArray.forEach(name => {
            family.push({
                "name": name,
                "presenceConfirmed": false,
            });
        });

        db.collection(invitationsCollection).add({
            family: family,
            invitationCode: invitationCode,
            presenceConfirmedMessage: null,
            presenceConfirmedOn: null,
            presenceConfirmationUpdatedOn: null,
        });
    
        res.status(201).send('Invitation created');
    } catch (error) {
        res.status(400).send('Error processing request. Check information entered');
    }
});

function generateInvitationCode(length = 6) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNPQRSTUVWXYZ123456789';
    var charactersLength = characters.length;

    for ( var i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
}

exports.app = functions.https.onRequest(app);