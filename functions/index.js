const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();

const cors = require('cors');
const { query } = require('express');
app.use(cors({ origin: true }));

const router = express.Router();
app.use('/api/v1', router);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

admin.initializeApp(functions.config().firebase);

const db = admin.firestore();
const invitationsCollection = 'invitations';
const invitationsRef = db.collection(invitationsCollection);

router.get('/hello-world', (req, res) => {
    res.json('Hello World!');
});

router.post('/invitation', async (req, res) => {
    try {
        let params = req.body;
        let invitationCode = generateInvitationCode();

        while (!await isInvitationCodeUnique(invitationCode)) {
            invitationCode = generateInvitationCode();
        }

        let family = [];
        let familyArray = params['family'];
        familyArray.forEach(name => {
            family.push({
                "name": name,
                "presenceConfirmed": false,
            });
        });

        invitationsRef.add({
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
    let code = '';
    let characters = 'ABCDEFGHIJKLMNPQRSTUVWXYZ123456789';
    let charactersLength = characters.length;

    for ( let i = 0; i < length; i++ ) {
        code += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return code;
}

async function isInvitationCodeUnique(invitationCode) {
    let snapshot = await invitationsRef.where('invitationCode', '==', invitationCode).get();

    return snapshot.empty;
}

exports.app = functions.https.onRequest(app);