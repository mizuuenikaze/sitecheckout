var AmpersandModel = require('./localStorageModel');


module.exports = AmpersandModel.extend({
	type: 'payment',
	props: {
		paymentMethod:{
			type: 'string',
			required: false,
			default: 'N/A' ,
			values: ['N/A', 'paypal-express', 'stripe'],
			allowNull: false,
			setOnce: false
		},
		currentStep: ['string', true, 'start'],
		service: ['string', true, ''],
		price: ['number', true, 0],
		paymentId: ['string', false, ''],
		payerId: ['string', false, '']
	}
});
