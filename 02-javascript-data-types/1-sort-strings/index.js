/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings(...props) { 

    const [data, param = 'asc', ...other] = props;   

    const sortableData = {
        data: data,
        sortDirection: param,
    };

    const newSortedArray = ({data, sortDirection}) => {   

        const caseFirst = sortDirection === 'asc' ? 'upper' : 'lower';

        const result = data.slice().sort((a, b) => {
            return a.localeCompare(b, ['ru-RU', 'en-US'], {caseFirst: caseFirst})
        });

        return sortDirection === 'asc' ? result : result.reverse();      
        
    };

    return newSortedArray(sortableData);

};