/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings(arr, param = 'asc') {   

    const sortableData = {
        data: arr,
        sortDirection: param,
    };

    const newSortedArray = ({data, sortDirection}) => { 
        const caseFirst = sortDirection === 'asc' ? 'upper' : 'lower';
        const result = data.slice().sort((a, b) => {
            if (sortDirection === 'asc') {
                return a.localeCompare(b, ['ru-RU', 'en-US'], {caseFirst: caseFirst});
            }
            return b.localeCompare(a, ['ru-RU', 'en-US'], {caseFirst: caseFirst});
        });
        return result; 
    };
    return newSortedArray(sortableData);
};