module.exports = {
	presets: [
		['@babel/env', {
			targets: {
				esmodules: true
			}
		}],
		'@babel/typescript'
	],
	plugins: [
		'@babel/proposal-class-properties',
		'@babel/proposal-object-rest-spread'
	],

	ignore: [
		'**/__tests__'
	]
};
