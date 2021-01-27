# Wedding RSVP
API to RSVP to wedding invitation.

Built with Express.js and Firebase Cloud Functions. Invitations are saved in Firebase Cloud Firestore.

## Endpoints
### GET invitations `api/v1/invitations`
Response example:
```
{
    "totalInvited": 2,
    "invitations": [
        {
            "invitationCode": "JKL235",
            "presenceConfirmationUpdatedOn": null,
            "family": [
                {
                    "name": "Name 1",
                    "presenceConfirmed": false
                },
                {
                    "name": "Name 2",
                    "presenceConfirmed": false
                }
            ],
            "presenceConfirmedOn": null,
            "presenceConfirmedMessage": null
        }
    ]
}
```
### GET invitation `api/v1/invitation/:invitationCode`
Response example:
```
{
    "presenceConfirmationUpdatedOn": null,
    "presenceConfirmedMessage": null,
    "family": [
        {
            "name": "Name 1",
            "presenceConfirmed": false
        }
    ],
    "presenceConfirmedOn": null,
    "invitationCode": "JKL235"
}
```

### POST invitation `api/v1/invitation`
Body example:
```
{
    "family" : [
        "Name 1",
        "Name 2"
    ]
}
```
Response:
```
{
    "message": "Invitation created"
}
```

## Setting up
In construction
