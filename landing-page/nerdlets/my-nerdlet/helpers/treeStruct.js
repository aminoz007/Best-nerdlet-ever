/** 
 *  CREATE TREE STRUCTURE/OBJECT FROM METRIC NAMES
 *  REQ: For example, the metrics builtin.general.enabled_instance_count and builtin.general.disabled_instance_count can appear as :
 *          * builtin
 *              - general
 *                  > enabled_instance_count
 *                  > disabled_instance_count
 *  Returned Object should look like the treeData array here: https://www.npmjs.com/package/react-simple-tree-menu
*/


const arrangeIntoTree = (data) => {

    const metrics = data.map(element => element["metricName"].split('.'))   
    const tree = []

    for (let i = 0; i < metrics.length; i++) {
        const metric = metrics[i]
        let currentLevel = tree
        for (let j = 0; j < metric.length; j++) {
            const part = metric[j]

            const existingMetric = _findWhere(currentLevel, 'label', part);

            if (existingMetric) {
                currentLevel = existingMetric.nodes;
            } else {
                const newPart = {
                    key: metric.slice(0,j+1).join('.'),
                    label: part,
                    nodes: []
                }

                currentLevel.push(newPart);
                currentLevel = newPart.nodes;
            }
        }
    }
    return tree
}

const _findWhere = (array, key, value) => {
    let t = 0 // t is used as a counter
    while (t < array.length && array[t][key] !== value) { t++ } // find the index where the id is the as the aValue

    if (t < array.length) {
        return array[t]
    } else {
        return false
    }
}

export { arrangeIntoTree }
