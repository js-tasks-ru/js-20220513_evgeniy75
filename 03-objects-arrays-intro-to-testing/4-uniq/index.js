/**
 * uniq - returns array of uniq values:
 * @param {*[]} arr - the array of primitive values
 * @returns {*[]} - the new array with uniq values
 */
export function uniq(arr) {

    const result = [];

    if (!arr || arr.length === 0) {
        return result;
    }

    arr.forEach((el) => {
        if (!result.includes(el)) {
            result.push(el);
        }
        return;
    });

    return result;
    
}
