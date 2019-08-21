import React from 'react';
import PropTypes from 'prop-types';
import SearchHeader from './SearchHeader';

export default class MyNerdlet extends React.Component {
	static propTypes = {
		width: PropTypes.number,
		height: PropTypes.number,
    };
    

    render() {
        const data = {env: [{environment:"lolriot"},{environment:"lolriotdev"},{environment:"lolriotQa"},{environment:"dev"}],
        dataCenter: [{dcenter:"pdx2"}, {dcenter:"mia1"}, {dcenter:"euc1"}],
        logicalCluster: [{lcluster:"prod"},{lcluster:"na1"},{lcluster:"br1"},{lcluster:"la2"}],
        group: [{group:"platform"}, {group:"cap"}, {group:"missions"}],
        name: [{name:"wallets"}, {name:"platform-war"}, {name:"connect2id"}]}
        return <SearchHeader data={data}/>
    }
}
