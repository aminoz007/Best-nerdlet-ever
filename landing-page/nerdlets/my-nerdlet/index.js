import React from 'react';
import PropTypes from 'prop-types';
import SearchHeader from './SearchHeader';

import SearchFilter from './search-filter.js';

export default class MyNerdlet extends React.Component {
	static propTypes = {
		width: PropTypes.number,
		height: PropTypes.number,
	};

<<<<<<< HEAD
    render() {
    return <SearchHeader/> 
    }
=======
	render() {
		return (
			<SearchFilter />
		);
	}
>>>>>>> 32352c1d03e84cf4d8a1db7672e20e2e8901d79b
}
