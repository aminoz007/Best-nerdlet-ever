// For a deep object, this function will return all properties for a giving key
const findNested = (obj, key) => {
    if (obj.hasOwnProperty(key))
        return [obj[key]];

    var res = [];
    Object.keys(obj).forEach(k => {
        let v = obj[k]
        if (typeof v == "object" && (v = findNested(v, key)).length)
            res.push.apply(res, v);
    });

    return res;
}

/*  Transform RFC 190 Scope attributes into an object that can be used by searchHeader component
    Example of acceptable format:
    {env: [{environment:"lolriot"},{environment:"lolriotdev"},{environment:"lolriotQa"},{environment:"dev"}],
        dataCenter: [{dcenter:"pdx2"}, {dcenter:"mia1"}, {dcenter:"euc1"}],
        logicalCluster: [{lcluster:"prod"},{lcluster:"na1"},{lcluster:"br1"},{lcluster:"la2"}],
        group: [{group:"platform"}, {group:"cap"}, {group:"missions"}],
        name: [{name:"wallets"}, {name:"platform-war"}, {name:"connect2id"}]}
*/
const formatRfcAtt = (attributesArray) => {
    const result = {env:[],dataCenter:[],logicalCluster:[],group:[],name:[]}
    attributesArray.map(attribute => {
        const elements = attribute.split('.')
        if (elements.length == 5) {
            // After splitting the attribute, there is a chance we have duplicates. Let's make sure not to keep them
            if (result.env.indexOf(elements[0]) == -1) {
                result.env.push(elements[0])
            } if (result.dataCenter.indexOf(elements[1]) == -1) {
                result.dataCenter.push(elements[1])
            } if (result.logicalCluster.indexOf(elements[2]) == -1) {
                result.logicalCluster.push(elements[2])
            } if (result.group.indexOf(elements[3]) == -1) {
                result.group.push(elements[3])
            } if (result.name.indexOf(elements[4]) == -1) {
                result.name.push(elements[4])
            }
        }
    })
    result.env = result.env.map(env => {return {environment:env}})
    result.dataCenter = result.dataCenter.map(dc => {return {dcenter:dc}})
    result.logicalCluster = result.logicalCluster.map(lc => {return {lcluster:lc}})
    result.group = result.group.map(gr => {return {group:gr}})
    result.name = result.name.map(na => {return {name:na}})

    return result
}

export { findNested, formatRfcAtt }