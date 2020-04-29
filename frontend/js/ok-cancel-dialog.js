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

Vue.component('ok-cancel-dialog', {
    props: {
        maxWidth: {
            type: String,
            required: false,
            default: "500px"
        }
    },
    template: `
    <v-dialog v-model="shown" @input="cancel" :max-width="maxWidth" persistent>
        <v-card>
            <v-card-title class="headline">{{ title }}</v-card-title>

            <v-card-text>{{ text }}</v-card-text>

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
            /* v-model dialog enabler */
            shown: false,

            /* title of the window */
            title: null,

            /* plain text to show (like description) */
            text: null,

            /* funtion, which executed if ok pressed */
            onOk: null,

            /* function, which executed if cancel pressed */
            onCancel: null
        };
    },
    methods: {
        /**
         * Shows dialog with custom title and text
         *
         * User may also provide two function, which will be called in case of
         * ok and in case of cancel. Functions are parameter-less
         *
         * @param {String}   title    Title of the dialog
         * @param {String}   text     Text of the dialog
         * @param {Function} onOk     To be executed if ok, default null
         * @param {Function} onCancel To be execute if cancel, default null
         */
        show(title, text, onOk = null, onCancel = null) {
            if (onOk && !(onOk instanceof Function)) {
                this.showMessage(`'${onOk}' [onOk] is not a Function`, 'error');
                return;
            }
            if (onCancel && !(onCancel instanceof Function)) {
                this.showMessage(`'${onCancel}' [onCancel] is not a Function`, 'error');
                return;
            }


            this.title    = title;
            this.text     = text;
            this.onOk     = onOk;
            this.onCancel = onCancel;

            this.shown    = true;
        },

        /**
         * Hides ok cancel dialog and "nulls" all the vue bindings
         */
        hide() {
            this.shown    = false;

            this.title    = null;
            this.text     = null;
            this.onOk     = null;
            this.onCancel = null;
        },

        /**
         * Submits Ok Cancel Dialog: calls the delegate (if any) and hides the
         * dialog
         */
        submit() {
            this.runAndShowMessageOnException(() => {
                if (this.onOk) {
                    this.onOk();
                }
            });
            this.hide();
        },
        /**
         * Cancels Ok Cancel Dialog: calls the delegate (if any) and hides the
         * dialog
         */
        cancel() {
            this.runAndShowMessageOnException(() => {
                if (this.onCancel) {
                    this.onCancel();
                }
            });
            this.hide();
        },
    }
});
