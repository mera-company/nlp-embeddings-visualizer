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

const LOG_MESSAGE_EVENT_ID = "logging-happen";



// requires vuetify
// emits "logging-happen"
Vue.component('ml-visualized-data', {
    props: {
        first: {
            required: true,
            type: Object,
            validator: function(val) {
                /* if an object contains data */
                if (val.data) {
                    /* the data is to be and array of arrays of number */
                    if ( !(Array.isArray(val.data) && val.data.every(item => Array.isArray(item) && item.every(Number.isFinite))) ) {
                        return false;
                    }
                }

                /* if contains children */
                if (val.children) {
                    /* to be an object */
                    if (!(val.children instanceof Object)) {
                        return false;
                    }

                    /* all the values are to be objects as well */
                    for (const key in val.children) {
                        if (!(val.children[key] instanceof Object)) {
                            return false;
                        }
                    }
                }

                /* all the necessary checks passed */
                return true;
            }
        },

        second: {
            required: true,
            type: Object,
            validator: function(val) {
                /* if an object contains data */
                if (val.data) {
                    /* the data is to be and array of arrays of number */
                    if ( !(Array.isArray(val.data) && val.data.every(item => Array.isArray(item) && item.every(Number.isFinite))) ) {
                        return false;
                    }
                }

                /* if contains children */
                if (val.children) {
                    /* to be an object */
                    if (!(val.children instanceof Object)) {
                        return false;
                    }

                    /* all the values are to be objects as well */
                    for (const key in val.children) {
                        if (!(val.children[key] instanceof Object)) {
                            return false;
                        }
                    }
                }

                /* all the necessary checks passed */
                return true;
            }
        },

        previewInterpolationSize: {
            required: false,
            type: Number,
            default: 30
        }
    },
    template: `
    <div>
    <template v-if="dataComparison">
        <!-- Shown if and only if there are some erroneous fields -->
        <v-row v-if="dataComparison.erroneous.length > 0" align="center" justify="center">
            <v-col cols="6">
                <v-card>
                    <v-card-title>Some input fields are not valid...</v-card-title>
                    <v-card-subtitle>
                        The following vectors are not comparable. Please, see the details below.
                    </v-card-subtitle>
                    <v-simple-table fixed-header key="invalid-data-display">
                        <template v-slot:default>
                            <thead>
                                <tr>
                                    <th class="text-left">Index</th>
                                    <th class="text-left">First Size</th>
                                    <th class="text-left">Second Size</th>
                                    <th class="text-left">Contents</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="item in dataComparison.erroneous">
                                    <td>{{ item.id }}</td>
                                    <td>{{ formatSizeOfArray(item.first) }}</td>
                                    <td>{{ formatSizeOfArray(item.second) }}</td>
                                    <td><v-btn icon @click="showVectorsCopyableContents(item.first, item.second)">
                                        <v-icon>
                                            mdi-eye
                                        </v-icon>
                                    </v-btn></td>
                                </tr>
                            </tbody>
                        </template>
                    </v-simple-table>
                </v-card>
            </v-col>
        </v-row>

        <!-- SHOWN AND HANDLED IF AND ONLY IF there are something to compare -->
        <v-row align="baseline" justify="start" v-if="dataComparison.matched.length > 0">
            <v-col cols="12">
                <v-card class="ml-2 mr-2">
                    <v-card-title>Comparable data</v-card-title>
                    <v-simple-table fixed-header key="data-display">
                        <template v-slot:default>
                            <colgroup>
                                <col style="width: 5%;" />
                                <col style="width: 5%;" />
                                <col style="width: 5%;" />
                                <col style="width: 5%;" />
                                <col style="width: 5%;" />
                                <col style="width: 30%;" />
                                <col style="width: 30%;" />
                                <col style="width: 15%;" />
                            </colgroup>

                            <thead>
                                <tr>
                                    <th class="text-left">Index</th>
                                    <th class="text-left">Size</th>
                                    <th class="text-left">Different elements</th>
                                    <th class="text-left">Euclidean Distance</th>
                                    <th class="text-left">Cosine Distance</th>
                                    <th class="text-left">First</th>
                                    <th class="text-left">Second</th>
                                    <th class="text-left">Contents</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(item, index) in dataComparison.matched">
                                    <td style="font-weight: bold">{{ item.id }} </td>
                                    <td>{{ item.first.length }}</td>
                                    <td>{{ numberOfDifferentElements(item.first, item.second) }}</td>
                                    <td>{{ calculateEuclideanMetric(item.first, item.second) }}</td>
                                    <td>{{ calculateCosineDistance(item.first, item.second) }}</td>
                                    <td><v-sparkline auto-draw line-width="2px" smooth="8" :gradient="['red', 'blue']" :value="interpolateArray(item.first)" height="40px"> </v-sparkline></td>
                                    <td><v-sparkline auto-draw line-width="2px" smooth="8" :gradient="['red', 'blue']" :value="interpolateArray(item.second)" height="40px"> </v-sparkline></td>

                                    <td>
                                        <v-btn icon @click="showVectorsCopyableContents(item.first, item.second)">
                                            <v-icon>
                                                mdi-eye
                                            </v-icon>
                                        </v-btn>
                                        <v-btn icon @click="showVectorsChartDiffContent(item.first, item.second)">
                                            <v-icon>
                                                mdi-chart-bar
                                            </v-icon>
                                        </v-btn>
                                    </td>
                                </tr>
                            </tbody>
                        </template>
                    </v-simple-table>
                </v-card>
            </v-col>
        </v-row>
    </template>


    <!-- sub-nodes -->
    <v-expansion-panels active-class="no-nested-padding" focusable hover multiple v-if="childComparisons">
        <v-expansion-panel v-for="(item, key) in childComparisons" :key="item.key">
            <v-expansion-panel-header>
                <span v-if="item.warn">
                    <v-icon >mdi-alert-circle</v-icon>
                    {{ key }}
                    [<span style="font-weight: bold;">{{item.warn}}</span>]
                </span>
                <span v-else> {{key}} </span>
            </v-expansion-panel-header>
            <v-expansion-panel-content>
                <ml-visualized-data :first="item.first" :second="item.second" :preview-interpolation-size="previewInterpolationSize"></ml-visualized-data>
            </v-expansion-panel-content>
        </v-expansion-panel>
    </v-expansion-panels>



    <!-- charts windows (shown if something happen) -->
    <!-- DIALOG, WHICH SHOWS COPYABLE VECTORS CONTENTS -->
    <v-dialog v-model="vectorsCopyableContents.shown" @input="vectorsCopyableContents.hide" key="copyable-contents">
        <v-card>
            <v-card-title class="headline">Vectors copyable contents</v-card-title>

            <v-textarea class="ma-2" label="First" :value="vectorsCopyableContents.firstContents" readonly></v-textarea>
            <v-divider></v-divider>
            <v-textarea class="ma-2" label="Second" :value="vectorsCopyableContents.secondContents" readonly></v-textarea>

            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="green darken-1" text @click="hideVectorsCopyableContents">
                    Ok
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

    <!-- DIALOG, WHICH SHOWS DIFFERENCE BETWEEN VECTORS CONTETNS AS A CHART-->
    <v-dialog v-model="vectorsChartDiffContents.shown" @input="hideVectorsChartDiffContent" key="chart-diff-contents" max-width="1500px">
        <v-card>
            <v-card-title class="headline">Vectors difference charts</v-card-title>

            <plotly-graph :data="vectorsChartDiffContents.diffChartData" :layout="diffChartLayout" :config-options="diffChartOptions" div-id="uniq-1"></plotly-graph>
            <plotly-graph :data="vectorsChartDiffContents.togetherChartData" :layout="sameChartLayout" :config-options="sameChartOptions" div-id="uniq-2"></plotly-graph>

            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="green darken-1" text @click="hideVectorsChartDiffContent" >
                    Ok
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</div>
    `,
    data() {
        return {
            /* the copyable contents window */
            vectorsCopyableContents: {
                /* dialog v-model ctl */
                shown: false,

                /* contents of the first vector */
                firstContents: null,

                /* contents of the second vector */
                secondContents: null,
            },

            /* data for difference */
            vectorsChartDiffContents: {
                /* v-model dialog ctl */
                shown: false,

                /* data of the difference chart */
                diffChartData: null,

                /* data of the together chart data */
                togetherChartData: null,
            },

            /**
             * Contains data to be compared
             */
            dataToBeCompared: [],

            /**
             * Incomparable data report
             */
            incomparableData: null,


            /****************************************
             * charts configuration
             ***************************************/
            diffChartLayout:  DEFAULT_differenceChartLayout,
            diffChartOptions: DEFAULT_differenceChartOptions,

            sameChartLayout:  DEFAULT_sameChartLayout,
            sameChartOptions: DEFAULT_sameChartOptions,

            previewLayout:    DEFAULT_previewChartLayout,
            previewOptions:   DEFAULT_previewChartOptions,
        };
    },

    watch: {
        first: {
            handler: function() {
            },
            deep: true
        },

        second: {
            handler: function() {
            },
            deep: true
        }
    },

    methods: {
        /****************************************
         * COPYABLE CONTENTS
         ***************************************/
        /**
         * Prepares copyable conetnts window and shows it
         *
         * @param {Array} vector1 First vector contents
         * @param {Array} vector2 Second vector contents
         */
        showVectorsCopyableContents(vector1, vector2) {
            this.vectorsCopyableContents.firstContents  = vector1;
            this.vectorsCopyableContents.secondContents = vector2;
            this.vectorsCopyableContents.shown          = true;
        },

        /**
         * Hides vector copyable contents. Typically triggered by vuetify/vue
         * built-in events. But may be called programmatically. Firsts hides the
         * "copyable vector contents" dialog and then clears the data
         */
        hideVectorsCopyableContents() {
            this.vectorsCopyableContents.shown          = false;
            this.vectorsCopyableContents.firstContents  = null;
            this.vectorsCopyableContents.secondContents = null;
        },


        /****************************************
         * CHARTS DIFFERENCE CONTENTS
         ***************************************/
        /**
         * Prepares comparison charts windows and shows it
         *
         * @param {Array} vector1 First vector contents
         * @param {Array} vector2 Second vector contents
         */
        showVectorsChartDiffContent(vector1, vector2) {
            /* prepare data for the difference */
            this.vectorsChartDiffContents.diffChartData = [{
                y:     diffArray(vector1, vector2),
                type: 'bar',
                fill: 'tozeroy',
                name: 'difference'
            }];

            this.vectorsChartDiffContents.togetherChartData = [
                {
                    y: vector1,
                    type: 'bar',
                    fill: 'tozeroy',
                    name: 'First'
                },
                {
                    y: vector2,
                    type: 'bar',
                    fill: 'tozeroy',
                    name: 'Second'
                }
            ];
            this.vectorsChartDiffContents.shown = true;
        },

        /**
         * Hides "chart difference vector contents". Typically triggered by
         * vuetify/vue built-in events. But may be called programmatically.
         * Firsts hides the "chart difference vector contents" dialog and then
         * clears the data for the dialog
         */
        hideVectorsChartDiffContent() {
            this.vectorsChartDiffContents.shown             = false;
            this.vectorsChartDiffContents.diffChartData     = null;
            this.vectorsChartDiffContents.togetherChartData = null;
        },




        /****************************************
         * SUPPORTING
         ***************************************/
        /**
         * Logs about
         *
         * @param {String} logPrio      The prority of the logger (error, info, warn)
         * @param {String} logMessage   Message to log
         */
        log(logPrio, logMessage) {
            const date = new Date();

            console.log(`[${date.toLocaleString()}] - <${logPrio}>:    ${logMessage}`);
            this.$emit(LOG_MESSAGE_EVENT_ID, date, logPrio, logMessage);
        },

        /**
         * Gets and formats the size of the array.
         * If the passed argument is an array, returns size, otherwise returns N/A
         *
         * @param {*} array Array to calculate the size
         */
        formatSizeOfArray(array) {
            if (Array.isArray(array)) {
                return array.length;
            } else {
                return 'N/A';
            }
        },

        /**
         * Returns Euclidean metric for two vectors (arrays)
         *
         * @throws Error if arrays are not of the same size
         *
         * @param {array} array1 First
         * @param {array} array2 Second
         */
        calculateEuclideanMetric(array1, array2) {
            return calculateEuclideanMetric(array1, array2).toFixed(2);
        },

        /**
         * Returns Cosine Distance for two vectors (arrays)
         *
         * @throws Error if arrays are not of the same size
         *
         * @note https://en.wikipedia.org/wiki/Cosine_similarity
         *
         * @note Formula: distance = 1 - <Cosine Similarity>
         *
         * @param {array} array1 First
         * @param {array} array2 Second
         */
        calculateCosineDistance(array1, array2) {
            return (1 - calculateCosineSimilarity(array1, array2)).toFixed(2);
        },

        /**
         * Gets the number of different elements in two arrays
         *
         * @throws Error if arrays are not of the same size
         *
         * @param {array} array1 First
         * @param {array} array2 Second
         */
        numberOfDifferentElements(array1, array2) {
            return numberOfDifferentElements(array1, array2);
        },

        /**
         * Interpolates the given array to fit the new size and to keep the "shape" of
         * the original one
         *
         * @param {array}     array array to interpolate
         */
        interpolateArray(array) {
            return interpolateArray(array, this.previewInterpolationSize);
        },
    },

    computed: {
        /**
         * The computed data comparison property, returns an object, which
         * contains data to display as well as erroneous data
         */
        dataComparison() {
            /* nothing to do, both absent */
            if (!this.first.data && !this.second.data) {
                return null;
            }

            /* be like an array */
            const lFirst  = this.first.data  || [];
            const lSecond = this.second.data || [];

            let dataComparisonObject = {
                matched:   [],
                erroneous: []
            };

            /* min/max sizes */
            const minSize = Math.min(lFirst.length, lSecond.length);
            const maxSize = Math.max(lFirst.length, lSecond.length);

            /* first we're safely iterating until the min among all arrays */
            for (let i = 0; i < minSize; i++) {
                let obj = {
                    id:     i,
                    first:  lFirst[i],
                    second: lSecond[i]
                };

                /* if sizes are not the same the vectors are incomparable */
                if (obj.first.length !== obj.second.length) {
                    dataComparisonObject.erroneous.push(obj);
                }
                /* and is comparable if sizes are the same */
                else {
                    dataComparisonObject.matched.push(obj);
                }
            }

            /* and elements between the min and the max sizes are 100% erroneous
             * NOTE: theoretically, the best way of implementating is to have a
             * separate branches if (first.len < second.len) and if (second.len
             * < first.len), but the current is better in terms of readability
            */
            for (let i = minSize; i < maxSize; i++) {
                dataComparisonObject.erroneous.push({
                    id:     i,
                    first:  (i < lFirst.length  ? lFirst[i]  : null),
                    second: (i < lSecond.length ? lSecond[i] : null)
                });
            }

            return dataComparisonObject;
        },

        /**
         * Geths the child comparisons alltogether as an object with properties
         *
         * The key is the name of the child (so a string) and the value is an
         * object, which contains the following fields:
         *  - first:  Sub-object from the first input or a dummy empty subobject
         *  - second: Sub-object from the second input or a dummy empty subobject
         *  - warn:   Warn message, if one of sub-objects present.
         */
        childComparisons() {
            /* nothing to do, if no children */
            if (!this.first.children && !this.second.children) {
                return null;
            }

            /* firt, we just adding all the from the first */
            let childComparisons = {};
            for (let k in this.first.children) {
                childComparisons[k] = {
                    first: this.first.children[k],
                    second: { data: [] },
                    warn: "only in first"
                };
            }

            /* and now from the second */
            for(let k in this.second.children) {
                /* but if there is no data yet, have to raise warning */
                if (!childComparisons[k]) {
                    childComparisons[k] = { first: { data: [] }, warn: "only in second" };
                } else {
                    /* and to cease warining in case of data is present */
                    childComparisons[k].warn = undefined;
                }
                /* and to finally set the warning */
                childComparisons[k].second = this.second.children[k];
            }

            return childComparisons;
        },
    }
});
