import { NerdGraphQuery, EntityByGuidQuery } from 'nr1';
import { findNested, getScopesFromObject } from './utils';
import { DATA_TYPE } from './constants';

const getScopes = () => {
    return new Promise(function(resolve, reject) {
        const q = NerdGraphQuery.query({ query: `{
            actor {
              accounts {
                id
              }
            }
          }` });
        q.then((results) => {
            const accounts = (((results || {}).data || {}).actor || {}).accounts || []
            const rfcScopePromises = _buildGraphQuery(accounts.map(acct => acct.id), DATA_TYPE.SCOPES)
            Promise.all(rfcScopePromises).then(values => {
                const rfcScopeValues = []
                values.forEach(value => {
                    const results = findNested(value, 'results') //Get all "member" values which contains the rfcScope attribute in a nested objects
                    const filteredRes = results.map(res => ({accountId:res.accountId, scopes: res.members})).filter(row => row.scopes.length)
                    rfcScopeValues.push.apply(rfcScopeValues,filteredRes)
                })
                console.log(rfcScopeValues)
                resolve(rfcScopeValues)
            })
        })
        .catch((error) => {
            reject(error)
        })    
    }) 
}

// Used to Fetch logs or metrics. dataType="Metrics" or "Logs" depending on what to fetch
const getData = (scopesByAcct, dataType) => {
    return new Promise(function(resolve, reject) {
        const dataPromises = _buildGraphQuery(scopesByAcct, dataType)
        Promise.all(dataPromises).then(values => {
            const data = []
            values.forEach(value => {
                let dataResults = findNested(value, 'results') //Get all "results" values which contains the data
                data.push.apply(data, dataResults)     
            })
            resolve(data)
        })
        .catch((error) => reject(error))
    }) 
}

const getLogById = (guid, messageId) => {
    return new Promise(function(resolve, reject) {
        EntityByGuidQuery.query({entityGuid:guid}).then(entity => {
            const result = findNested(entity, 'entities')
            const acctId = result[0].accountId
            if(acctId){
                NerdGraphQuery.query({ query:`{
                    actor {
                        account(id: ${acctId}) {
                            nrql(query: "FROM Log  SELECT * WHERE messageId='${messageId}'") {
                            results
                            }
                        }
                    }
                }`
                })
                .then (details => resolve({info:findNested(details,'results'), accountId: acctId}))
            }
        })
        .catch((error) => {
            reject(error)
        })   
    })
}

const _buildGraphQuery = (data, dataType) => {

    let graphQueryList = ""

    if (dataType === DATA_TYPE.LOGS) {
        graphQueryList = _buildLogsQuery(data)
    } else if (dataType === DATA_TYPE.METRICS) {
        graphQueryList = _buildMetricsQuery(data)
    } else if (dataType === DATA_TYPE.SCOPES) {
        graphQueryList = _buildScopesQuery(data)
    }

    // GraphQL Queries has a complexity limit. To avoid reaching this limit we will split
    // requests to a max size of 25 per batch
    const requests = []
    while(graphQueryList.length) {
        let graphQ = graphQueryList.splice(0,25).reduce((acc,query) => acc.concat(query),'')
        graphQ = `{
            actor {
              ${graphQ}
            }}`
        requests.push(graphQ)
    }
    console.log(requests)
    const promises = []
    requests.forEach(request => {
        promises.push(NerdGraphQuery.query({ query: request }))
    })
    return promises
}

const _buildLogsQuery = (data) => {
    return data.map((row,index) => {
        //Careful, reduce return the same value if array.length=1
        const listScopes = row.scopes.map(scope => `'${scope}'`).reduce((acc,current) => `${current},${acc}`)
        const nrqlQuery = `FROM Log  SELECT timestamp, hostname, service_name, severity, message, messageId as message_id, nr.entity.guid as guid where service_name in (${listScopes}) since 1 day ago`
        return `account${index}:account(id: ${row.accountId}) {
            nrql(query: "${nrqlQuery}") {
            results
            }
        }`
    })
}

const _buildMetricsQuery = (data) => {
    return data.map((row,index) => {
        //Careful, reduce return the same value if array.length=1
        const listScopes = row.scopes.map(scope => `'${scope}'`).reduce((acc,current) => `${current},${acc}`)
        const nrqlQuery = `FROM MetricRaw SELECT uniques(metricName) where rfc190Scope in (${listScopes}) since 1 day ago`
        return `account${index}:account(id: ${row.accountId}) {
            nrql(query: "${nrqlQuery}") {
            results
            }
        }`
    })
}

const _buildScopesQuery = (data) => {
    return data.map((account,index) => 
    `account${index}:account(id: ${account}) {
        nrql(query: "FROM MetricRaw SELECT uniques(rfc190Scope), ${account} as accountId since 1 day ago") {
        results
        }
    }`)
}

export { getScopes, getData, getLogById }