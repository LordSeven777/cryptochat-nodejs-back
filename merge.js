const array1 = [
    { id: "001", name: "Tolotra" },
    { id: "002", name: "Marinà" },
    { id: "003", name: "Yolo" },
]

const array2 = [
    { id: "001", name: "Molotra" },
    { id: "004", name: "Simon" },
    { id: "005", name: "Narindra" },
]

function merge(key, array1, array2, preserve = true) {
    const mergedArray = [];
    const hashTable1 = {};
    const hashTable2 = {};
    const keySet = new Set();
    array1.forEach(item => {
        hashTable1[item[key]] = item;
        keySet.add(item[key]);
    });
    array2.forEach(item => {
        hashTable2[item[key]] = item;
        keySet.add(item[key]);
    });
    keySet.forEach(keyValue => {
        if (preserve) {
            mergedArray.push(
                (hashTable1[keyValue] && hashTable2[keyValue]) || !hashTable2[keyValue]
                ? hashTable1[keyValue]
                : hashTable2[keyValue]
            );
        } else {
            mergedArray.push(
                (hashTable1[keyValue] && hashTable2[keyValue]) || !hashTable1[keyValue]
                ? hashTable2[keyValue]
                : hashTable1[keyValue]
            )
        }
    });
    return mergedArray;
}

// merge("id", array1, array2)
console.log(merge("id", array1, array2));