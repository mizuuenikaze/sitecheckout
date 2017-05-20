var AmpersandModel = require('ampersand-model');


module.exports = AmpersandModel.extend({
    type: 'login',
    props: {
        username: ['string', true, 'email@domain.tld'],
        password: ['string', true, '']
    }
});
