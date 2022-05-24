/**
 * createGetter - creates function getter which allows select value from object
 * @param {string} path - the strings path separated by dot
 * @returns {function} - function-getter which allow get value from object by set path
 */
export function createGetter(path) {

    const properties = path.split('.');

    return (obj) => {
        let result = obj;
        for (const el of properties) {
            if (Object.keys(result).includes(el)) {
                result = result[el];
            }
            else {
                return undefined;
            }
        }
        return result;
    };

}
