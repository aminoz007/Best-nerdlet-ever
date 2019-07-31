import React from 'react';
import PropTypes from 'prop-types';

import SearchFilter from './search-filter.js';

export default class MyNerdlet extends React.Component {
	static propTypes = {
		width: PropTypes.number,
		height: PropTypes.number,
	};

	render() {
		return (
			<SearchFilter />
		);
	}
}
