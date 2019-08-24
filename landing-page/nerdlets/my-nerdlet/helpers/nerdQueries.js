import { NerdGraphQuery } from 'nr1';
import { findNested } from './utils'

const getMetrics = () => {
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
            const nrqlQuery = "FROM Metric SELECT uniques(rfc190Scope) since 1 day ago"
            const rfcScopePromises = _buildGraphQuery(accounts.map(acct => acct.id), nrqlQuery)
            Promise.all(rfcScopePromises).then(values => {
                const rfcScopeValues = []
                values.forEach(value => {
                    const members = findNested(value, 'member') //Get all "member" values which contains the rfcScope attribute in a nested objects
                    rfcScopeValues.push.apply(rfcScopeValues,members)
                })
                resolve(rfcScopeValues)
            })
        })
        .catch((error) => {
            reject(error)
        })    
    }) 
}

const getLogs = (scopes) => {
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
            const nrqlQuery = _buildLogsNrqlQuery(scopes)
            const logsPromises = _buildGraphQuery(accounts.map(acct => acct.id), nrqlQuery)
            Promise.all(logsPromises).then(values => {
                const logs = []
                values.forEach(value => {
                    let logResults = findNested(value, 'results') //Get all "results" values which contains the logs attributes
                    if (Array.isArray(logResults)) {
                        logResults = logResults.filter(e => e.length) //Do not add empty arrays 
                    } 
                    logs.push.apply(logs, ...logResults)     
                })
                resolve(logs)
            })
        })
        .catch((error) => {
            reject(error)
        })    
    }) 
}

const _buildGraphQuery = (accounts, nrqlQuery) => {

    const nrqlMetricsQuery = accounts.map((account,index) => 
        `account${index}:account(id: ${account}) {
            nrql(query: "${nrqlQuery}") {
            results
            }
        }`
    )
    // GraphQL Queries has a complexity limit. To avoid reaching this limit we will split
    // requests to a max size of 25 per batch
    const requests = []
    while(nrqlMetricsQuery.length) {
        let graphQ = nrqlMetricsQuery.splice(0,25).reduce((acc,query) => acc.concat(query),'')
        graphQ = `{
            actor {
              ${graphQ}
            }}`
        requests.push(graphQ)
    }
    const promises = []
    requests.forEach(request => {
        promises.push(NerdGraphQuery.query({ query: request }))
    })
    return promises
}

const _buildLogsNrqlQuery = (scopes) => {
    //Careful, reduce return the same value if array.length=1
    const listScopes = scopes.map(scope => `'${scope}'`).reduce((acc,current) => `${current},${acc}`)
    const nrqlQuery = `FROM Log  SELECT timestamp, hostname, service_name, severity, message, messageId as message_id, nr.entity.guid as guid where service_name in (${listScopes}) since 1 day ago`
    return nrqlQuery
}

export { getMetrics, getLogs }