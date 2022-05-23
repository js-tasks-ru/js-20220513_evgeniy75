/**
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according passed size
 */
export function trimSymbols(string, size) {

    if (!string || !size) {
        console.log(string, size);
        if (size === undefined) {
            return string;
        }
        return '';
    }

    const result = [];
    let count = 1;

    string.split('').forEach((el) => {
        if (!result.length) {
            result.push(el);
        }
        else if (result.length > 0 && el === result[result.length - 1] && count < size) {
            count++;
            result.push(el);
        }
        else if (result[result.length - 1] !== el) {
            count = 1;
            result.push(el);
        }
    });

    return result.join('');
    
}
