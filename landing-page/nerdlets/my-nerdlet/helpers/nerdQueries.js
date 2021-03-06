import { NerdGraphQuery, EntityByGuidQuery, EntitySearchQuery } from 'nr1';
import { findNested } from './utils';
import { DATA_TYPE } from './constants';

const getScopes = (duration) => {
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
            const rfcScopePromises = _buildGraphQuery(accounts.map(acct => acct.id), DATA_TYPE.SCOPES, duration)
            Promise.all(rfcScopePromises).then(values => {
                const rfcScopeValues = []
                console.log(values)
                values.forEach(value => {
                    if (value.data) {
                        Object.keys(value.data.actor).map(account => {
                            if(account.startsWith('account')){   // Appolo returns things like __typname, we have to ignore them
                                const scopes = value.data.actor[account].nrql.results.map(result => result.member)
                                const parsedData = {accountId: value.data.actor[account].id, scopes: scopes}
                                if (scopes.length) {
                                    rfcScopeValues.push(parsedData)
                                }
                            } 
                        })
                    }
                    //const results = findNested(value, 'results') //Get all "member" values which contains the rfcScope attribute in a nested objects
                    //const filteredRes = results.map(res => ({accountId:res.Id, scopes: res.members})).filter(row => row.scopes.length)
                    //rfcScopeValues.push.apply(rfcScopeValues,filteredRes)
                })
                resolve(rfcScopeValues)
            })
        })
        .catch((error) => {
            reject(error)
        })    
    }) 
}

// Used to Fetch logs or metrics. dataType="Metrics" or "Logs" depending on what to fetch
const getData = (scopesByAcct, dataType, duration) => {
    return new Promise(function(resolve, reject) {
        const dataPromises = _buildGraphQuery(scopesByAcct, dataType, duration)
        Promise.all(dataPromises).then(values => {
            const data = []
            console.log(values)
            values.forEach(value => {
                if(dataType === DATA_TYPE.METRICS) {
                    if(value.data){
                        Object.keys(value.data.actor).map(account => {
                            if(account.startsWith('account')){   // Appolo returns things like __typname, we have to ignore them
                                const metrics = value.data.actor[account].nrql.results.map(result => result.member)
                                const parsedData = {accountId: value.data.actor[account].id, members: metrics}
                                if (metrics.length) {
                                    data.push(parsedData)
                                }
                            } 
                        })
                    }
                } else {
                    let dataResults = findNested(value, 'results') //Get all "results" values which contains the data
                    data.push.apply(data, dataResults) 
                }    
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

const getEntitiesByScope = (scope) => {
    const filters = [
        {
            type: 'entityType',
            value: {domain: 'APM', type: 'APPLICATION'}
        },
        {
            type: EntitySearchQuery.FILTER_TYPE.TAG,
            value: {key: 'rfc190Scope', value: scope}
        }
    ]
    return new Promise(function(resolve, reject) {
        EntitySearchQuery.query({filters:filters}).then(data => {
            resolve(findNested(data, 'entities'))
        })
        .catch((error) => {
            reject(error)
        })   
    })
}

const _buildGraphQuery = (data, dataType, duration) => {

    let graphQueryList = ""
    const since = ` SINCE ${duration/1000/60} MINUTES AGO `

    if (dataType === DATA_TYPE.LOGS) {
        graphQueryList = _buildLogsQuery(data, since)
    } else if (dataType === DATA_TYPE.METRICS) {
        graphQueryList = _buildMetricsQuery(data, since)
    } else if (dataType === DATA_TYPE.SCOPES) {
        graphQueryList = _buildScopesQuery(data, since)
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

    const promises = []
    requests.forEach(request => {
        promises.push(NerdGraphQuery.query({ query: request, fetchPolicyType:NerdGraphQuery.FETCH_POLICY_TYPE.NO_CACHE }))
    })
    return promises
}

const _buildLogsQuery = (data, since) => {
    return data.map((row,index) => {
        //Careful, reduce return the same value if array.length=1
        const listScopes = row.scopes.map(scope => `'${scope}'`).reduce((acc,current) => `${current},${acc}`)
        const nrqlQuery = `FROM Log  SELECT timestamp, hostname, service_name, severity, message, messageId as message_id, nr.entity.guid as guid where service_name in (${listScopes}) ${since} LIMIT 100`
        return `account${index}:account(id: ${row.accountId}) {
            nrql(query: "${nrqlQuery}") {
            results
            }
        }`
    })
}

const _buildMetricsQuery = (data, since) => {
    return data.map((row,index) => {
        //Careful, reduce return the same value if array.length=1
        const listScopes = row.scopes.map(scope => `'${scope}'`).reduce((acc,current) => `${current},${acc}`)
        const nrqlQuery = `FROM Metric SELECT uniques(metricName) where rfc190Scope in (${listScopes}) ${since}`
        return `account${index}:account(id: ${row.accountId}) {
            nrql(query: "${nrqlQuery}") {
            results
            }
            id
        }`
    })
}

const _buildScopesQuery = (data, since) => {
    return data.map((account,index) => 
    `account${index}:account(id: ${account}) {
        nrql(query: "FROM Metric SELECT uniques(rfc190Scope) ${since}") {
        results
        }
        id
    }`)
}

export { getScopes, getData, getLogById, getEntitiesByScope }