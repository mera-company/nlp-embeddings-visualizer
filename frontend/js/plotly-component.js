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

Vue.component('plotly-graph', {
    template: "<div v-bind:id='divId' :class='{ resizePlot: resize }' :style='{ height: height +  \"%\", gridcolumn: columnNumber }'></div>",
    props: {
        data: {
            type: Array
        },
        layout: {
            type: Object
        },
        configOptions: {
            type: Object
        },
        divId: {
            type: String,
            required: true,
            default: "test1"
        },
        resize: {
            type: Boolean,
            default: true
        },
        height: {
            type: Number,
            default: 100
        },
        columnNumber: {
            type: Number,
            default: 1
        }
    },
    mounted() {
        this.Plot();
        this.$watch('data', this.Plot, { deep: true });
    },
    beforeDestroy() {
        try { Plotly.purge(this.divId); } catch (e) { console.log(`Plotly got error ${e}`); }
    },
    methods: {
        Plot() {
            return Plotly.newPlot(this.divId, this.data, this.layout, this.configOptions);
        },
        onResize() {
          if(this.resize) {
            var d3 = Plotly.d3;
            gd3 = d3.select('#' + this.divId);
            gd3.style({
                width: '100%',
                height: this.height + '%'
            });
            Plotly.Plots.resize(gd3[0][0]);
          }
        }
    }
});
