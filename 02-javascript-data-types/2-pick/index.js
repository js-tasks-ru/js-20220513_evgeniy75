/**
 * pick - Creates an object composed of the picked object properties:
 * @param {object} obj - the source object
 * @param {...string} fields - the properties paths to pick
 * @returns {object} - returns the new object
 */
export const pick = (...props) => {

    const [obj, ...fields] = props;

    const searchKeys = (fields, obj) => {
        const newArrResults = [];
        fields.forEach(fieldKey => {
            Object.entries(obj).map(([key, value]) => {
                if (key.includes(fieldKey)) {
                    newArrResults.push([key, value])
                }
            });
        });
        return Object.fromEntries(newArrResults);
    }
    return searchKeys(fields, obj);
};