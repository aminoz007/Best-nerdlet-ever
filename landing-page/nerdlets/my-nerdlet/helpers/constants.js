const RFC_190_SCOPE = {
    ENVIRONMENT: {HEADER: "Environment", ACCESSOR: "environment"},
    DATA_CENTER: {HEADER: "Data Center", ACCESSOR: "dcenter"},
    LOGICAL_CLUSTER: {HEADER: "Logical Cluster", ACCESSOR: "lcluster"},
    GROUP: {HEADER: "Groups", ACCESSOR: "group"},
    NAME: {HEADER: "Name", ACCESSOR: "name"}
}

const LOGS = {
    TIMESTAMP: {VISIBLE: true, WIDTH: 150},
    HOSTNAME: {VISIBLE: true},
    SERVICE_NAME: {VISIBLE: true, WIDTH: 200},
    SEVERITY: {VISIBLE: true, WIDTH: 100},
    MESSAGE: {VISIBLE: true, WIDTH: 700},
    MESSAGE_ID: {VISIBLE: true},
    GUID: {VISIBLE: false}
}

const DATA_TYPE = {
    METRICS: "Metrics",
    LOGS: "Logs",
    SCOPES: "scopes"
}

const MAX_SCOPES = 100

export { RFC_190_SCOPE, LOGS, DATA_TYPE, MAX_SCOPES }