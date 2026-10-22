require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();

app.set('view engine', 'pug');
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// use token from .env file
const PRIVATE_APP_ACCESS = process.env.PRIVATE_APP_ACCESS;

// ROUTE 1 - retrieve list of contacts and their new properties
app.get('/contacts', async (req, res) => {
    const contacts = 'https://api.hubspot.com/crm/v3/objects/contacts?properties=email&properties=firstname&properties=lastname&properties=rewards_member_tier&properties=rewards_membership&properties=total_property_count&properties=total_property_amount';
    const headers = {
        Authorization: `Bearer ${PRIVATE_APP_ACCESS}`,
        'Content-Type': 'application/json'
    }
    try {
        const resp = await axios.get(contacts, { headers });
        const data = resp.data.results;
        // editable table view
        res.render('contacts', { title: 'Contacts | HubSpot APIs', data });
    } catch (error) {
        console.error('Error retrieving contact data:', error)
    }

});

// ROUTE 2 - support user updates of contact properties
app.post('/update', async (req, res) => {
    const email = req.body.email;
    if (!email) {
        return res.status(400).json({ error: 'Contact email is required' }); // Return a 400 Bad Request response if email is missing but then user cant do anything anyway, defensive coding is good practice however.
    }

    const update = {
        properties: { 
                    "rewards_member_tier": req.body.rewards_member_tier,
                    "rewards_membership": req.body.rewards_membership, 
                    "total_property_count": req.body.total_property_count, 
                    "total_property_amount": req.body.total_property_amount }
    };
    const updateContact = `https://api.hubapi.com/crm/v3/objects/contacts/${email}?idProperty=email`;
    const headers = {
        Authorization: `Bearer ${PRIVATE_APP_ACCESS}`,
        'Content-Type': 'application/json'
    };
    
    try {
        await axios.patch(updateContact, update, { headers });        
        res.redirect('/contacts');
    } catch (err) {
        console.error('Error updating contact data:', err)        
    }
});

// * Localhost
app.listen(3000, () => console.log('Listening on http://localhost:3000'));