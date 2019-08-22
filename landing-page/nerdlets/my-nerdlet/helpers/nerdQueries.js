import { NerdGraphQuery } from 'nr1';
import { findNested, formatRfcAtt } from './utils'

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
            const rfcScopePromises = metricsQuery(accounts.map(acct => acct.id))
            Promise.all(rfcScopePromises).then(values => {
                const rfcScopeValues = []
                values.forEach(value => {
                    const members = findNested(value, 'member') //Get all "member" values which contains the rfcScope attribute in a nested objects
                    rfcScopeValues.push.apply(rfcScopeValues,members)
                })
                resolve(formatRfcAtt(rfcScopeValues))
            })
        })
        .catch((error) => {
            reject(error)
        })    
    }) 
}

const metricsQuery = (accounts) => {

    const nrqlMetricsQuery = accounts.map((account,index) => 
        `account${index}:account(id: ${account}) {
            nrql(query: "FROM Metric SELECT uniques(rfc190Scope) since 1 day ago") {
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



export { getMetrics }