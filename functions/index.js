const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const bodyParser = require('body-parser');
const { Parser } = require('json2csv');
require('dotenv').config();

const app = express();

const cors = require('cors');
app.use(cors({
    origin: [process.env.CORS_1, process.env.CORS_2, process.env.CORS_3, process.env.CORS_4],
    optionsSuccessStatus: 200
}));

const router = express.Router();
app.use('/api/v1', router);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

admin.initializeApp(functions.config().firebase);

const db = admin.firestore();
const invitationsCollection = 'invitations';
const invitationsRef = db.collection(invitationsCollection);
const FieldValue = admin.firestore.FieldValue;

router.get('/invitations', async (req, res) => {
    let totalInvited = 0;
    let totalConfirmed = 0;
    let snapshot = await invitationsRef.orderBy('presenceConfirmedOn', 'desc').get();
    let data = snapshot.docs.map(doc => doc.data());

    data.forEach(element => {
        totalInvited += element.family.length;
        element.family.forEach(familyElement => {
            if (familyElement.presenceConfirmed) {
                totalConfirmed++;
            }
        });
    });

    res.json({ totalInvited: totalInvited, totalConfirmed: totalConfirmed, invitations: data });
});

router.get('/invitation/:invitationCode', async (req, res) => {
    let invitationCode = req.params.invitationCode;
    if (invitationCode.length !== 6) {
        res.status(400).json({ message: 'Invitation code must be informed correctly' });
    }

    let snapshot = await queryInvitationByCode(invitationCode);
    if (snapshot.empty) {
        res.status(404).json({ message: 'Invitation not found' });
    }

    res.json(snapshot.docs[0].data());
});

router.post('/invitation', async (req, res) => {
    try {
        let params = req.body;

        let family = [];
        let familyArray = params['family'];
        familyArray.forEach(name => {
            if (name.trim() === '') {
                throw new Error();
            }

            family.push({
                "name": name.trim(),
                "presenceConfirmed": false,
            });
        });

        invitationsRef.add({
            family: family,
            invitationCode: await generateUniqueInvitationCode(),
            presenceConfirmedMessage: null,
            presenceConfirmedOn: null,
            presenceConfirmationUpdatedOn: null,
        });

        res.status(201).json({ message: 'Invitation created' });
    } catch (error) {
        res.status(400).json({ message: 'Error processing request. Check information entered' });
    }
});

router.post('/confirm-presence/:invitationCode', async (req, res) => {
    try {
        let invitationCode = req.params.invitationCode;
        if (invitationCode.length !== 6) {
            res.status(400).json({ message: 'Invitation code must be informed correctly' });
        }

        let snapshot = await queryInvitationByCode(invitationCode);
        if (snapshot.empty) {
            res.status(404).json({ message: 'Invitation not found' });
        }

        let params = req.body;
        let doc = snapshot.docs[0];
        let data = doc.data();

        let presenceConfirmedMessage = data['presenceConfirmedMessage'];
        let message = params['presenceConfirmedMessage'];
        if (message.trim() !== '') {
            presenceConfirmedMessage = message;
        }

        let timestamp = FieldValue.serverTimestamp();
        let presenceConfirmedOn = data['presenceConfirmedOn'];
        if (presenceConfirmedOn === null) {
            presenceConfirmedOn = timestamp;
        }

        let family = data['family'];
        let confirmation = params['family'];
        confirmation.forEach(item => {
            family[item.index].presenceConfirmed = item.presenceConfirmed
        });

        invitationsRef.doc(doc.id).update({
            family: family,
            presenceConfirmedMessage: presenceConfirmedMessage,
            presenceConfirmedOn: presenceConfirmedOn,
            presenceConfirmationUpdatedOn: timestamp,
        });

        res.json({ message: 'Invitation updated' });
    } catch (error) {
        res.status(400).json({ message: 'Error processing request. Check information entered' });
    }
});

router.post('/clear-presence-confirmation/:invitationCode', async (req, res) => {
    try {
        let invitationCode = req.params.invitationCode;
        if (invitationCode.length !== 6) {
            res.status(400).json({ message: 'Invitation code must be informed correctly' });
        }

        let snapshot = await queryInvitationByCode(invitationCode);
        if (snapshot.empty) {
            res.status(404).json({ message: 'Invitation not found' });
        }

        let doc = snapshot.docs[0];
        let data = doc.data();
        let family = data['family'];
        family.forEach(item => {
            item.presenceConfirmed = false
        });

        invitationsRef.doc(doc.id).update({
            family: family,
            presenceConfirmedMessage: null,
            presenceConfirmedOn: null,
            presenceConfirmationUpdatedOn: null,
        });

        res.json({ message: 'Invitation updated' });
    } catch (error) {
        res.status(400).json({ message: 'Error processing request. Check information entered' });
    }
});

router.get('/download-invitations', async (req, res) => {
    let snapshot = await invitationsRef.orderBy('presenceConfirmedOn', 'desc').get();
    let data = snapshot.docs.map(doc => doc.data());

    let invitations = [];
    data.forEach(element => {
        let names = element.family[0].name;
        element.family.slice(1).forEach(familyElement => {
            names = names.concat(", ", familyElement.name);
        });
        invitations.push({ code: element.invitationCode, names: names });
    });
    const json2csv = new Parser({ fields: ['invitation_code', 'names'] });
    const csv = json2csv.parse(invitations);
    
    res.header('Content-Type', 'text/csv').attachment('invitations.csv').send(csv);
});

async function queryInvitationByCode(invitationCode) {
    return await invitationsRef.where('invitationCode', '==', invitationCode.toUpperCase()).get();
}

function generateInvitationCode(length = 6) {
    let code = '';
    let characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ123456789';
    let charactersLength = characters.length;

    for (let i = 0; i < length; i++) {
        code += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return code;
}

async function generateUniqueInvitationCode() {
    let code = '';

    while (code === '' || !isInvitationCodeUnique(code)) {
        code = generateInvitationCode();
    }

    return code;
}

async function isInvitationCodeUnique(invitationCode) {
    let snapshot = await invitationsRef.where('invitationCode', '==', invitationCode).get();

    return snapshot.empty;
}

exports.app = functions.https.onRequest(app);