import { RFC_190_SCOPE } from "./constants";

// For a deep object, this function will return all properties for a giving key
const findNested = (obj, key) => {
    if (obj.hasOwnProperty(key))
        return obj[key];

    var res = [];
    Object.keys(obj).forEach(k => {
        let v = obj[k]
        if (typeof v == "object" && (v = findNested(v, key)).length)
            res.push.apply(res, v);
    });

    return res;
}

/** Transform RFC 190 Scope attributes into an object that can be used by searchHeader component.
 *  Example of acceptable format:
 *  {environment: [{environment:"lolriot"},{environment:"lolriotdev"},{environment:"lolriotQa"},{environment:"dev"}],
 *      dcenter: [{dcenter:"pdx2"}, {dcenter:"mia1"}, {dcenter:"euc1"}],
 *      lcluster: [{lcluster:"prod"},{lcluster:"na1"},{lcluster:"br1"},{lcluster:"la2"}],
 *      group: [{group:"platform"}, {group:"cap"}, {group:"missions"}],
 *      name: [{name:"wallets"}, {name:"platform-war"}, {name:"connect2id"}]}
*/
const formatRfcAtt = (attributesArray) => {

    const result = {}
    result[RFC_190_SCOPE.ENVIRONMENT.ACCESSOR] = []
    result[RFC_190_SCOPE.DATA_CENTER.ACCESSOR] = []
    result[RFC_190_SCOPE.LOGICAL_CLUSTER.ACCESSOR] = []
    result[RFC_190_SCOPE.GROUP.ACCESSOR] = []
    result[RFC_190_SCOPE.NAME.ACCESSOR] = []

    const scopes = getScopesFromObject(attributesArray)
    scopes.map(attribute => {
        const elements = attribute.split('.')
        if (elements.length == 5) {
            // After splitting the attribute, there is a chance we have duplicates. Let's make sure not to keep them
            if (result[RFC_190_SCOPE.ENVIRONMENT.ACCESSOR].indexOf(elements[0]) == -1) {
                result[RFC_190_SCOPE.ENVIRONMENT.ACCESSOR].push(elements[0])
            } if (result[RFC_190_SCOPE.DATA_CENTER.ACCESSOR].indexOf(elements[1]) == -1) {
                result[RFC_190_SCOPE.DATA_CENTER.ACCESSOR].push(elements[1])
            } if (result[RFC_190_SCOPE.LOGICAL_CLUSTER.ACCESSOR].indexOf(elements[2]) == -1) {
                result[RFC_190_SCOPE.LOGICAL_CLUSTER.ACCESSOR].push(elements[2])
            } if (result[RFC_190_SCOPE.GROUP.ACCESSOR].indexOf(elements[3]) == -1) {
                result[RFC_190_SCOPE.GROUP.ACCESSOR].push(elements[3])
            } if (result[RFC_190_SCOPE.NAME.ACCESSOR].indexOf(elements[4]) == -1) {
                result[RFC_190_SCOPE.NAME.ACCESSOR].push(elements[4])
            }
        }
    })
    result[RFC_190_SCOPE.ENVIRONMENT.ACCESSOR] = result[RFC_190_SCOPE.ENVIRONMENT.ACCESSOR].map(env => {
        const obj= {} 
        obj[RFC_190_SCOPE.ENVIRONMENT.ACCESSOR] = env
        return obj
    })
    result[RFC_190_SCOPE.DATA_CENTER.ACCESSOR] = result[RFC_190_SCOPE.DATA_CENTER.ACCESSOR].map(dc => {
        const obj= {} 
        obj[RFC_190_SCOPE.DATA_CENTER.ACCESSOR] = dc
        return obj
    })
    result[RFC_190_SCOPE.LOGICAL_CLUSTER.ACCESSOR] = result[RFC_190_SCOPE.LOGICAL_CLUSTER.ACCESSOR].map(lc => {
        const obj= {} 
        obj[RFC_190_SCOPE.LOGICAL_CLUSTER.ACCESSOR] = lc
        return obj
    })
    result[RFC_190_SCOPE.GROUP.ACCESSOR] = result[RFC_190_SCOPE.GROUP.ACCESSOR].map(gr => {
        const obj= {} 
        obj[RFC_190_SCOPE.GROUP.ACCESSOR] = gr
        return obj
    })
    result[RFC_190_SCOPE.NAME.ACCESSOR] = result[RFC_190_SCOPE.NAME.ACCESSOR].map(na => {
        const obj= {} 
        obj[RFC_190_SCOPE.NAME.ACCESSOR] = na
        return obj
    })

    return result
}

// REQ: Upon selecting/deselecting parts of the scopes, the other lists would dynamically update 
// to show what remaining options existed for them to select
// Make sure not to filter the current table where the selection is made 
const filterAttrs = (rawData, selectedRows, formattedData) => {
    const filters = selectedRows.selected
    const filteredRawData = []
    rawData.forEach(attr => {
        const obj = {}
        obj["accountId"] = attr.accountId
        obj["scopes"] = []
        attr.scopes.forEach(scope => {
            const elements = scope.split('.')
            if (!filters[RFC_190_SCOPE.ENVIRONMENT.ACCESSOR].length || filters[RFC_190_SCOPE.ENVIRONMENT.ACCESSOR].includes(elements[0])) {
                if (!filters[RFC_190_SCOPE.DATA_CENTER.ACCESSOR].length || filters[RFC_190_SCOPE.DATA_CENTER.ACCESSOR].includes(elements[1])) {
                    if (!filters[RFC_190_SCOPE.LOGICAL_CLUSTER.ACCESSOR].length || filters[RFC_190_SCOPE.LOGICAL_CLUSTER.ACCESSOR].includes(elements[2])) {
                        if (!filters[RFC_190_SCOPE.GROUP.ACCESSOR].length || filters[RFC_190_SCOPE.GROUP.ACCESSOR].includes(elements[3])) {
                            if (!filters[RFC_190_SCOPE.NAME.ACCESSOR].length || filters[RFC_190_SCOPE.NAME.ACCESSOR].includes(elements[4])) {
                                obj.scopes.push(scope)
                            }
                        }
                    }
                }
            } 
        })
        if (obj["scopes"].length) {
            filteredRawData.push(obj)
        }
    })
    console.log(filteredRawData)
    const filteredDataFormatted = formatRfcAtt(filteredRawData)
    // Do not filter current list and get bigger list in case of deselection
    if (formattedData[selectedRows.lastSelectedTab]>filteredDataFormatted[selectedRows.lastSelectedTab]) {
        filteredDataFormatted[selectedRows.lastSelectedTab] = formattedData[selectedRows.lastSelectedTab]
    }

    return { filteredDataFormatted, filteredRawData }
}

const getScopesFromObject = (data) => {
    return data.map(ele => ele.scopes).flat()
}

const dateFormattingInLogs = (logs) => {
    return logs.map(log => {
        log["timestamp"] = new Date(log["timestamp"]).toString().substr(4,20)
        return log
    }) 
}


export { findNested, formatRfcAtt, filterAttrs, dateFormattingInLogs, getScopesFromObject }