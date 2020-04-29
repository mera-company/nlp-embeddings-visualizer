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
'use strict';

Vue.component('text-input-window', {
    props: {
        width: {
            required: false,
            type: String,
            default: "500px"
        },
        lines: {
            required: false,
            type: Number,
            default: 1
        },
        title: {
            required: false,
            type: String,
            default: ''
        },
        persistent: {
            required: false,
            default: false
        }
    },

    template: `
    <v-dialog v-model="shown" @input="cancel" :persistent="persistent" :width="width">
        <v-card>
            <v-card-title class="headline">{{ titleText }}</v-card-title>

            <v-textarea :rows="lines" class="ma-2" label="Contents" v-model="text"></v-textarea>

            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="yellow darken-1" text @click="cancel">Cancel</v-btn>
                <v-btn color="green darken-1" text @click="submit">Ok</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
    `,

    data() {
        return {
            /* defines whenever to show or not */
            shown: false,

            /* title text (may be changed within show) */
            titleText: null,

            /* current text */
            text: null,

            /* function to be called on submitting */
            onSubmit: null
        };
    },

    methods: {
        /**
         * Shows the dialog with the default title
         *
         * @param {String}    inititalText   The initial text value
         * @param {Function}  callBack       Function to be called, when submit
         *                                   is pressed. The text is passed as
         *                                   an argument
         */
        show(inititalText, callBack) {
            if (!(callBack instanceof Function)) {
                throw new Error(`'${callBack}' is not a Function`);
            }

            this.titleText = this.title;
            this.text      = inititalText;
            this.onSubmit  = callBack;

            this.shown     = true;
        },

        /**
         * Shows the dialog with the custom title
         *
         * @param {String}    inputTitle     Custom title text
         * @param {String}    inititalText   The initial text value
         * @param {Function}  callBack       Function to be called, when submit
         *                                   is pressed. The text is passed as
         *                                   an argument
         */
        showWithTitle(inputTitle, inititalText, callBack) {
            if (!(callBack instanceof Function)) {
                throw new Error(`'${callBack}' is not a Function`);
            }

            this.titleText = inputTitle;
            this.text      = inititalText;
            this.onSubmit  = callBack;

            this.shown     = true;
        },

        /**
         * Hides the shown dialog + resets all the stuff
         */
        hide() {
            this.shown     = false;

            this.titleText = null;
            this.text      = null;
            this.onSubmit  = null;
        },

        /**
         * Submits the dialog: calls the call-back and hides
         */
        submit() {
            try {
                this.onSubmit(this.text);
            } catch (e) {
                console.log(`Error ${e} happen during invoking the call-back in submit`);
            }

            this.hide();
        },

        /**
         * Cancels the dialog (hides it)
         */
        cancel() {
            this.hide();
        }
    }
});
