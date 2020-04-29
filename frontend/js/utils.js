/**
 * Copyright 2020 MERA
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

/**
 * Stores the provided value into the local storage with keeping the original
 * data-type
 *
 * @throws Exceptions thown by JSON.stringify
 *
 * @param {string} parameterName   Name of the parameter
 * @param {any}    parameterValue  Value to store
 */
function storeIntoLocalStorage(parameterName, parameterValue) {
    const jsonString = JSON.stringify(parameterValue);
    localStorage.setItem(parameterName, jsonString);
}

/**
 * Tries to retrieve value from local storage, parses it with JSON.parse. If the
 * value is not present inside the localStorage, returns the default value
 *
 * @throws Exceptions thrown by JSON.parse
 *
 * @param {string} parameterName   Parameter name to retrieve
 * @param {any}    defaultValue    Value returned if no value present, default null
 */
function getFromLocalStorageOrDefault(parameterName, defaultValue = null) {
    const returned = localStorage.getItem(parameterName);
    return returned && JSON.parse(returned) || defaultValue;
}

/* interpolation stuff */
function linearInterpolate(before, after, atPoint) {
    return before + (after - before) * atPoint;
};

/**
 * Interpolates the given array to fit the new size and to keep the "shape" of
 * the original one
 *
 * Note: the code is taken from here
 *  http://hevi.info/do-it-yourself/interpolating-and-array-to-fit-another-size/
 *
 * @param {array}     array array to interpolate
 * @param {integer}   size size to intrpolate into
 * @param {function}  interpolation interpolation function, defaults to
 *                    linearInterpolate. See linearInterpolate for details
 */
function interpolateArray(array, size, interpolation = linearInterpolate) {
    var newData = new Array();
    var springFactor = new Number((array.length - 1) / (size - 1));
    newData[0] = array[0]; // for new allocation
    for ( var i = 1; i < size - 1; i++) {
        var tmp = i * springFactor;
        var before = new Number(Math.floor(tmp)).toFixed();
        var after = new Number(Math.ceil(tmp)).toFixed();
        var atPoint = tmp - before;
        newData[i] = interpolation(array[before], array[after], atPoint);
    }
    newData[size - 1] = array[array.length - 1]; // for new allocation
    return newData;
}


/**
 * Returns per-element difference. Only possible if the arrays are of the same
 * size!
 *
 * @throws Error if arrays are not of the same size
 *
 * @param {array} array1 Minuend
 * @param {array} array2 Subtrahend
 */
function calculatePerElementDifference(array1, array2) {
    if (array1.length !== array2.length) {
        throw new Error("Expected arrays of the same size");
    }

    var ret = new Array();
    for (var i = 0; i < array1.length; i++) {
        ret[i] = array1[i] - array2[i];
    }

    return ret;
}

/**
 * Returns Euclidean metric for two vectors (arrays)
 *
 * @throws Error if arrays are not of the same size
 *
 * @param {array} array1 First
 * @param {array} array2 Second
 */
function calculateEuclideanMetric(array1, array2) {
    if (array1.length !== array2.length || !array1.length) {
        throw new Error("Expected arrays of the same non-zero size");
    }

    /* The formula is this: metric = sqrt( (arr1[1] - arr2[i]) ** 2 + ... + (arr1[i] - arr2[i]) ** 2) */
    /* So first  */
    let sqrtArgument = 0;
    for (var i = 0; i < array1.length; i++) {
        sqrtArgument += (array1[i] - array2[i]) ** 2;
    }

    /* get the sqrt */
    return Math.sqrt(sqrtArgument);
}

/**
 * Returns Cosine Similarity for two vectors (arrays)
 *
 * @throws Error if arrays are not of the same size
 *
 * @note https://en.wikipedia.org/wiki/Cosine_similarity
 *
 * @note Formula: similarity = (A x B) / (||A||x||B||)
 *
 * @param {array} array1 First
 * @param {array} array2 Second
 */
function calculateCosineSimilarity(array1, array2) {
    if (array1.length !== array2.length || !array1.length) {
        throw new Error("Expected arrays of the same non-zero size");
    }

    /*  The formula is this: (A x B) / (||A||x||B||)
     *   So we're calculating numerator and parts of denominator separately
     */
    let numerator        = 0;
    let sumOfSquaresArr1 = 0;
    let sumOfSquaresArr2 = 0;
    for (let i = 0; i < array1.length; i++) {
        numerator        += array1[i] * array2[i];
        sumOfSquaresArr1 += array1[i] ** 2;
        sumOfSquaresArr2 += array2[i] ** 2;
    }

    /* the final calculation */
    return (numerator / (Math.sqrt(sumOfSquaresArr1) * Math.sqrt(sumOfSquaresArr2)));
}

/**
 * Gets the number of different elements in two arrays
 *
 * @throws Error if arrays are not of the same size
 *
 * @param {array} array1 First
 * @param {array} array2 Second
 */
function numberOfDifferentElements(array1, array2) {
    if (array1.length !== array2.length || !array1.length) {
        throw new Error("Expected arrays of the same non-zero size");
    }

    /* calculate per-element */
    let count = 0;
    for (let index = 0; index < array1.length; index++) {
        if (array1[index] !== array2[index]) {
            ++count;
        }
    }

    return count;
}
