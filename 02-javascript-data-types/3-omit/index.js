/**
 * omit - creates an object composed of enumerable property fields
 * @param {object} obj - the source object
 * @param {...string} fields - the properties paths to omit
 * @returns {object} - returns the new object
 */
export const omit = (...props) => {

    const [obj, ...fields] = props;

    const ignoreKeys = (fields, obj) => {
        if (fields.length !== 0) {            
            const newArrResults = [];
            const filteredFields = fields => {
                const allKeys = Object.keys(obj);
                fields.forEach((field) => {                    
                    if(allKeys.includes(field)) {
                        allKeys.splice(allKeys.indexOf(field), 1);
                        return;
                    }
                });   
                return allKeys;    
            };        
    
            filteredFields(fields).forEach(readyKey => {     
                Object.entries(obj).map(([key, value]) => {
                    if (key.includes(readyKey)) {                   
                        newArrResults.push([key, value])
                    }
                });    
            });
            return Object.fromEntries(newArrResults);
        }
        return obj; 
    };
    return ignoreKeys(fields, obj);

};