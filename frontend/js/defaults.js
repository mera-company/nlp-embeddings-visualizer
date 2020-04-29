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

/**
 * Constants, which define local storage ids for first and second input
 */
const firstInputVectorsLocalStorageId  = "firstInputVectors";
const secondInputVectorsLocalStorageId = "secondInputVectors";
const appConfigutationLocalStorageId   = "appConfig";

/**
 * "Enumerator" for input kinds
 */
const STORE_INTO = {
    FIRST:  { value: 0, name: "first"  },
    SECOND: { value: 1, name: "second" },
    STEP:   { value: 2, name: "step"   }
};


/****************************************
 * CHARTS OPTIONS
 ***************************************/
/* difference charts */
const DEFAULT_differenceChartLayout = {
    height: 400,
    width: 1480,
    xaxis: {
        autorange: true,
    },
    yaxis: {
        autorange: true,
    }
};
const DEFAULT_differenceChartOptions = { };


const DEFAULT_sameChartLayout = {
    height: 400,
    width: 1480,
    xaxis: {
        autorange: true,
    },
    yaxis: {
        autorange: true,
    },
    legend: {
        "orientation": "h",
    }
};
const DEFAULT_sameChartOptions = {};


const DEFAULT_previewChartLayout = {
    paper_bgcolor: 'transparent',
    plot_bgcolor: 'transparent',
    textinfo: 'none',
    autosize: false,
    height: 90,
    width: 500,
    xaxis: {
        autorange: true,
        showgrid: false,
        zeroline: false,
        showline: false,
        autotick: true,
        ticks: '',
        showticklabels: false,
    },
    yaxis: {
        autorange: true,
        showgrid: false,
        zeroline: false,
        showline: false,
        autotick: true,
        ticks: '',
        showticklabels: false,
    },
    margin: {
        l: 0,
        t: 0,
        b: 0,
    }
};
const DEFAULT_previewChartOptions = {
    scrollZoom: false,
    displayModeBar: false
};

const DEFAULT_applicationConfiguration = {
    numberComparisonPrecision: 0.0000001,

    previewChartPoints: 30,

    serverUrl: 'http://localhost:8888/embedding_generator',

    requestOptions: `return {
        method: 'POST',
        mode: 'cors',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            'text': text
        })
    }`,
}
