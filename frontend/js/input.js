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
"use strict";

/* dummy functions used to generate input */
/**
 * Generates random number within thw specified range
 *
 * @param {number} min   Minimum value
 * @param {number} max   Maximum value
 */
function makeRandom(min, max) {
    return (Math.random() * (max - min) + min);
}

/**
 * Generates vector (array) of `size` numbers, every number is of number [0,
 * 100)
 *
 * @param {integer} size Size of the returned vector
 */
function makeRandomInputVector(size) {
    const minAllowed = -100;
    const maxAllowed = 100;

    var array = []
    while (size--) {
        array.push(makeRandom(minAllowed, maxAllowed));
    }

    return array;
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
function diffArray(array1, array2) {
    if (array1.length !== array2.length) {
        throw new Error("Expected arrays of the same size");
    }

    var ret = new Array;
    for (var i = 0; i < array1.length; i++) {
        ret[i] = array1[i] - array2[i];
    }

    return ret;
}
