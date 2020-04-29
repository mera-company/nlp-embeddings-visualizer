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
 * Project TODO list:
 *  - "Delete" buttons to be pressed only with "shift"
 */

function InputDataItem() {
    this.name   = "Unnamed";
    this.first  = { object: {} };
    this.second = { object: {} };
}


/* THE APPLICATION */
new Vue({
    el: '#application',
    vuetify: new Vuetify({
        theme: { dark: false },
    }),
    data: () => ({
        /****************************************
         * configuration
         ***************************************/
        /* various configuration */
        appConfiguration: {
            /* temporarily unused */
            numberComparisonPrecision: DEFAULT_applicationConfiguration.numberComparisonPrecision,

            /* number of points used to show the preview charts */
            previewChartPoints: DEFAULT_applicationConfiguration.previewChartPoints,

            /* URL to be used to send requests */
            serverUrl: DEFAULT_applicationConfiguration.serverUrl,

            /* a valid js code, which returns the json object, which will
             * later be passed as options parameter (see fetch definition),
             * use ${text} to specify a place to insert the specified text
             * to send */
            requestOptions: DEFAULT_applicationConfiguration.requestOptions,
        },

        /****************************************
         * THE MAIN DATA
         ***************************************/
        inputData: [],

        /****************************************
         * SUPPORTING (GUI drawing and so on)
         ***************************************/
        /* all the fields related to the input menu (mosly shown on the left) */
        inputMenu: {
            /* Defines whenever the value is to be stored into the first item to
             * compare, into the second, or to make second = first, and set as
             * first */
            storeInto: 2,

            /*  The cotrol for current input source tab
             */
            inputSourceTab: 1,

            /* Contains all the things related inputting from a file */
            fromFile: {
                /* v-model for file input dialog */
                uploadedFile: null,
            },

            /* Contains all the things related inputting from a server */
            fromServer: {
                /* the text to be sent to the server (the one passed as ${text})
                 */
                textToSend: null,
            },

            /* Contains all the things related inputting manually */
            manual: {
                /* the input JSON */
                inputJSON: null,
            }
        },

        /****************************************
         * sub-windows
         ***************************************/
        /* properties for notifications through snackbar */
        notification: {
            /* timeout */
            tmo: 10000,

            /* text */
            text: '',

            /* v-model show condition */
            enabled: false,

            /* color */
            color: 'info'
        },

        /* properties for application settings dialog */
        applicationSettingsDialog: {
            /* v-model dialog enabler */
            shown: false,

            /* value & error of number comparison precision */
            numberComparisonPrecision: null,
            numberComparisonPrecisionErrors: null,

            /* value & error of number of points used for interpolation preview
             */
            previewChartPoints: null,
            previewChartPointsErrors: null
        },

        /* propertis for server settings dialog */
        serverSettingsDialog: {
            shown: false,

            /* value & error of server URL input */
            serverUrl: null,
            serverUrlErrors: null,

            /* value & error of server options input */
            requestOptions: null,
            requestOptionsErrors: null,
        },
    }),

    /**
     * Call-back, which called automatically once the application is loaded
     */
    mounted() {
        try {
            var updateValue = (val) => {
                if (val) { this.inputData = val; }
            };
            var validateInput = (val) => {
                return this.validateInputDataItem(val);
            }
            {
                let openRequest = indexedDB.open('comparisonData', 1);

                openRequest.onerror = function() {
                    this.showMessage(`Unable to update indexedDb, error ${openRequest.error}`, 'error');
                };

                openRequest.onsuccess = function() {
                    let db = openRequest.result;
                    let tr = db.transaction(['name'], 'readwrite');
                    let st = tr.objectStore('name');

                    let res = [];
                    /* iterate with the cursor */
                    st.openCursor().onsuccess = event => {
                        const cursor = event.target.result;

                        if (cursor) {
                            if (validateInput(cursor.value)) {
                                res.push(cursor.value);
                            } else {
                                console.log(`got invalid item ${JSON.stringify(cursor.value)}`);
                            }
                            cursor.continue();
                        } else {
                            updateValue(res);
                        }
                    };
                };

                openRequest.onupgradeneeded = function() {
                    let db = openRequest.result;
                    if (!db.objectStoreNames.contains("name") ) {
                        db.createObjectStore("name");
                    }
                }
            }
        } catch (e) {
            this.showMessage(`Unable to load history from indexedDb. Refresh page once again, and if at issue still takes place, clear indexedDb! Any change in loaded data will lead to losing all the previous history! Error: ${e}`, 'error');
        }

        try {
            const parsedConfig = JSON.parse(localStorage.getItem(appConfigutationLocalStorageId));
            if (parsedConfig) {
                this.appConfiguration = parsedConfig;
            } else {
                this.showMessage(`Unable to load stored config, will use the default instead`, 'error');
            }
        } catch (e) {
            this.showMessage(`Unable to load config from local storage. Refresh page once again, and if at issue still takes place, clear local storage! Any change in application config will lead to losing all the previous config(s). Error: ${e}`, 'error');
        }
    },
    watch: {
        /**
         * The configuration watcher, uploads the latest values into the local
         * storage
         */
        appConfiguration: {
            handler: function(value) {
                storeIntoLocalStorage(appConfigutationLocalStorageId, value)
            },
            deep: true,
        },

        /**
         * Watcher for the input data
         */
        inputData: {
            handler: function(value) {
                let openRequest = indexedDB.open('comparisonData', 1);

                openRequest.onerror = function() {
                    this.showMessage(`Unable to update indexedDb, error ${openRequest.error}`, 'error');
                };

                openRequest.onsuccess = function() {
                    let db = openRequest.result;
                    let tr = db.transaction(['name'], 'readwrite');
                    let st = tr.objectStore('name');

                    st.clear();

                    /* what if size of a single item is too huge?? current max per item is 133169152 bytes (~120Mb) */

                    /* doing the storing */
                    value.forEach((item, index) => st.put(item, index));

                    tr.onerror = (ev) => {
                        console.log(`Unabled to finish request ${ev.target.error}`);
                    }
                    tr.onsuccess = () => {
                        console.log(`Successfully finished`);

                        tr.commit();
                    };
                };

                openRequest.onupgradeneeded = function() {
                    if (!db.objectStoreNames.contains("name") ) {
                        db.createObjectStore("name");
                    }
                }
            },
            deep: true,
        }

    },
    methods: {
        /****************************************
         * APPLICATION SETTINGS DIALOG
         ***************************************/
        /**
         * Shows application settings dialog
         */
        showApplicationSettingsDialog() {
            this.applicationSettingsDialog.numberComparisonPrecision       = this.appConfiguration.numberComparisonPrecision;
            this.applicationSettingsDialog.numberComparisonPrecisionErrors = null;
            this.applicationSettingsDialog.previewChartPoints              = this.appConfiguration.previewChartPoints;
            this.applicationSettingsDialog.previewChartPointsErrors        = null;
            this.applicationSettingsDialog.shown                           = true;
        },
        /**
         * Hides application settings dialog first, and then null all the vue
         * bindings
         */
        hideApplicationSettingsDialog() {
            this.applicationSettingsDialog.shown                           = false;

            this.applicationSettingsDialog.numberComparisonPrecision       = null;
            this.applicationSettingsDialog.numberComparisonPrecisionErrors = null;
            this.applicationSettingsDialog.previewChartPoints              = null;
            this.applicationSettingsDialog.previewChartPointsErrors        = null;
        },
        /**
         * Submits application settings dialog, which means the following:
         *   1. Input data validation & report input errors (if any)
         *   2. If 1 is successful, updates the corresponding configuration values
         */
        submitApplicationSettingsDialog() {
            let hasError = false;

            const tmpPrecision = Number.parseFloat(this.applicationSettingsDialog.numberComparisonPrecision);
            if (!tmpPrecision || isNaN(this.applicationSettingsDialog.numberComparisonPrecision)) {
                hasError = true;
                this.applicationSettingsDialog.numberComparisonPrecisionErrors = [`Value '${this.applicationSettingsDialog.numberComparisonPrecision}' is not a valid float`];
            }

            const tmpChartPoints = Number.parseInt(this.applicationSettingsDialog.previewChartPoints);
            if (!tmpChartPoints || isNaN(this.applicationSettingsDialog.previewChartPoints)) {
                hasError = true;
                this.applicationSettingsDialog.previewChartPointsErrors = [`Value '${this.applicationSettingsDialog.previewChartPoints}' is not a valid integer`];
            }

            /* apply the changes if no error */
            if (!hasError) {
                this.appConfiguration.numberComparisonPrecision                = tmpPrecision;
                this.appConfiguration.previewChartPoints                       = tmpChartPoints;

                this.hideApplicationSettingsDialog();
            }
        },
        /**
         * Cancels the application settings dialog
         */
        cancelApplicationSettingsDialog() {
            this.hideApplicationSettingsDialog();
        },
        /**
         * Resets the application settings, also triggers "show application dialog"
         */
        resetApplicationConfig() {
            this.appConfiguration.numberComparisonPrecision = DEFAULT_applicationConfiguration.numberComparisonPrecision;
            this.appConfiguration.previewChartPoints        = DEFAULT_applicationConfiguration.previewChartPoints;
            this.showApplicationSettingsDialog();
        },


        /****************************************
         * SERVER SETTINGS DIALOG
         ***************************************/
        /**
         * Shows server settings dialog
         */
        showServerSettingsDialog() {
            this.serverSettingsDialog.serverUrl            = this.appConfiguration.serverUrl;
            this.serverSettingsDialog.serverUrlErrors      = null;
            this.serverSettingsDialog.requestOptions       = this.appConfiguration.requestOptions;
            this.serverSettingsDialog.requestOptionsErrors = null;
            this.serverSettingsDialog.shown                = true;
        },
        /**
         * Hides server settings dialog first and "nulls" all the vue bindings
         */
        hideServerSettingsDialog() {
            this.serverSettingsDialog.shown                = false;

            this.serverSettingsDialog.serverUrl            = null;
            this.serverSettingsDialog.serverUrlErrors      = null;
            this.serverSettingsDialog.requestOptions       = null;
            this.serverSettingsDialog.requestOptionsErrors = null;
        },
        /**
         * Resets the application settings, also triggers "show application dialog"
         */
        submitServerSettingsDialog() {
            let hasError = false;

            const tmpServerUrl = this.serverSettingsDialog.serverUrl;
            if (!tmpServerUrl) {
                hasError = true;
                this.serverSettingsDialog.serverUrlErrors = ["Empty value is not allowed"];
            }

            const funcBody = this.serverSettingsDialog.requestOptions;
            if (!funcBody) {
                hasError = true;
                this.serverSettingsDialog.requestOptionsErrors = [`Empty function body is not allowed`];
            } else {
                try {
                    const obj = new Function('text', funcBody)("test");
                } catch (e) {
                    hasError = true;
                    this.serverSettingsDialog.requestOptionsErrors = [`Function call is not successful with 'test' argument, error ${e}`];
                }
            }

            if (!hasError) {
                this.appConfiguration.serverUrl                = this.serverSettingsDialog.serverUrl;
                this.appConfiguration.requestOptions           = this.serverSettingsDialog.requestOptions;


                this.hideServerSettingsDialog();
            }
        },
        /**
         * Cancels the application settings dialog
         */
        cancelServerSettingsDialog() {
            this.hideServerSettingsDialog();
        },
        /**
         * Resets the application settings, also triggers "show server settings dialog"
         */
        resetServerConfig() {
            this.appConfiguration.serverUrl      = DEFAULT_applicationConfiguration.serverUrl;
            this.appConfiguration.requestOptions = DEFAULT_applicationConfiguration.requestOptions;
            this.showServerSettingsDialog();
        },



        /****************************************
         * DATA DISPLAY
         ***************************************/
        /**
         * Gets the history panel header for the element at the given index
         *
         * The header typically consists of "histortical" prefix (current,
         * previous, N-ago) and the name, concatenated with dash
         *
         * @param {Number} index   Index to get history for
         */
        getHistoryPanelHeader(index) {
            if (index >= this.inputData.length) { return 'N/A';}

            const getPrefix = () => {
                if (0 === index) { return 'current';  }
                if (1 === index) { return 'previous'; }
                return `${index}-ago`;
            };
            const getName = () => {
                if (!this.inputData[index].name) {
                    return '';
                }
                return ` - ${this.inputData[index].name}`;
            };

            return `${getPrefix()}${getName()}`;
        },

        /**
         * Triggers rename dialog for the history item with the given index
         *
         * @param {Number} index  Index to rename
         */
        renameHistoryItem(index) {
            this.$refs.smallTextInput.showWithTitle('Set the new name', this.inputData[index].name, (newName) => {
                Vue.set(this.inputData[index], 'name', newName);
            })
        },

        /**
         * Removes the item from history (you may also delete current, if such
         * the previous become current)
         *
         * @param {Number} index  Index to remove
         */
        removeHistoryItem(index) {
            this.inputData.splice(index, 1);
        },

        /**
         * Brings historical entry into the current comparison, current becomes
         * previous
         *
         * @param {Number} index  Index to make current
         */
        makeCurrent(index) {
            this.inputData.unshift(this.inputData.splice(index, 1)[0]);
        },

        /**
         * Move item up by history pane: 2-ago -> previous; previous ->
         * current
         *
         * @param {Number} index Index to move up
         */
        moveUp(index) {
            /* already "now" */
            if (index === 0) { return; }

            const atIndex  = this.inputData[index];
            const atBefore = this.inputData[index - 1];

            Vue.set(this.inputData, index, atBefore);
            Vue.set(this.inputData, index - 1, atIndex);
        },

        /**
         * Move item Down by history pane: current => previous; previous =>
         * 2-ago
         *
         * @param {Number} index Index to move Down
         */
        moveDown(index) {
            /* already last */
            if (index === this.inputData.length) { return; }

            const atIndex  = this.inputData[index];
            const atAfter = this.inputData[index + 1];

            Vue.set(this.inputData, index, atAfter);
            Vue.set(this.inputData, index + 1, atIndex);
        },

        /**
         * Duplicates the item
         *
         * @param {Number} index   Index to duplicate
         */
        duplicateItem(index) {
            this.inputData.splice(index, 0, JSON.parse(JSON.stringify(this.inputData[index])));
        },

        /**
         * Removes all the history items
         *
         * Does nothing with current
         */
        dropComparisonHistory() {
            this.inputData.splice(1, this.inputData.length - 1);
        },

        /**
         * Starts the new comparison (if necessary). If is already in "new"
         * state, does nothing.
         *
         * If new comparison started the previous moved into the history
         * (previous)
         */
        startNewComparison() {
            this.inputData.unshift(new InputDataItem());
        },

        /**
         * Converts the given object into a blob and saves it into a file
         *
         * @param {*} obj            Object to be saved
         * @param {string} fileName  Filename to be downloaded
         */
        downloadObjectAsFile(obj, fileName = 'unnamed') {
            /* convert to blob */
            var blob = new Blob([JSON.stringify(obj)], { type: 'text/json' });

            /* create link and setup necessary attributes */
            var link = document.createElement("a");
            link.setAttribute("target","_blank");
            link.setAttribute("href", URL.createObjectURL(blob));
            link.setAttribute("download", fileName);

            /* emulates clicking */
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        },

        /**
         * Saves comparison data to file
         *
         * @param {Number} index Index to save data from
         */
        saveItem(index) {
            let name = (this.inputData[index].name || "unnamed") + '.json';
            this.downloadObjectAsFile(this.inputData[index], name);
        },



        /****************************************
         * BUTTONS AT THE BOTTOM
         ***************************************/
        /**
         * Clars all the input contents (also resets local storage)
         */
        resetAllData() {
            this.inputData = new Array();
        },

        /**
         * Saves all the data (current + history)
         */
        saveAllData() {
            let name = 'history' + new Date().toJSON() + '.json';
            this.downloadObjectAsFile(this.inputData, name);
        },

        /**
         * Reads text from the file, treats it as a json and returns
         *
         * @param {File} file To read contents from
         */
        readFileAsJSON(file, onSuccess, onError) {
            /* only valid file is expected */
            if (!(file instanceof File)) {
                throw new Error ('Provied argument is not a file');
            }

            /* using file readed to read from file */
            let reader = new FileReader();

            /* action taken on successful read */
            reader.onload = () => {
                /* try parse*/
                try {
                    onSuccess(JSON.parse(reader.result));
                }
                catch (e) {
                    onError(e);
                }
            };

            /* in case of any error */
            reader.onerror = function() {
                onError(reader.error);
            }

            /* and read the file finally */
            reader.readAsText(file);
        },

        /**
         * Checks that the data may be used as a source (first/second)
         *
         * @param {*} val   Data to validate
         *
         * @todo Duplicate, copied from input-data-component... do not duplicate
         * later..
         */
        isValidInputData(val) {
            if (!(val instanceof Object)) {
                return false;
            }

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
        },

        /**
         * Checks if the provided data may be used as comparison data
         *
         * @param {*} object Data to validate
         */
        validateInputDataItem(object) {
            /* is an object */
            if (!(object instanceof Object)) {
                return false;
            }

            if (!object.name || !object.first || !object.second) {
                return false;
            }

            return this.isValidInputData(object.first.object) && this.isValidInputData(object.second.object);
        },

        /**
         * Loads single comparison from file(s):
         *  1. Validates that the json inside the file is a valid comparion item
         *  2. If such - adds front into history
         */
        loadComparison() {
            this.runAndShowMessageOnException(() => {
                let handleSingleComparison = (obj) => {
                    if (this.validateInputDataItem(obj)) {
                        this.inputData.unshift(obj);
                    } else {
                        this.showMessage(`Json does not represent the supported comparison item format...`, 'error');
                    }
                }

                for (let i = 0; i < this.$refs.loadSingleFileRef.files.length; i++) {
                    this.readFileAsJSON(this.$refs.loadSingleFileRef.files[i], (json) => {
                        if (Array.isArray(json)) {
                            json.forEach(handleSingleComparison);
                        } else {
                            handleSingleComparison(json);
                        }
                    },
                    /* on error */
                    (e) => {
                        this.showMessage(`Unable to process ${file}, error ${e}`, 'error')
                    });
                }
            });
        },


        /****************************************
         * INPUT DATA ASSIGNMENT/VALIDATION
         ***************************************/
        /**
         * The function recursively steps over the entire passed object, and
         * tries to extract arrays of number. It looks for all of the arrays of
         * numbers and arrays of arrays of numbers, and returns the found back
         * to user by also holding the hierarchy
         *
         * The retuned data is of the following Type:
         *   ReturnedObject = {
         *       data:    [ [1, 2, 3...], [-4, -5.4, 5,...] ... ],
         *       children: {
         *           "child-name":   ReturnedObject,
         *           "another-name": ReturnedObject,
         *           ...
         *       }
         *   }
         *
         * @param {*} object  Abstact objects
         */
        extractDataArrays(object) {
            /* the recoursive private implementation */
            const extractImpl = (source) => {
                /* cannot extract data array from non-object data type */
                if (!(source instanceof Object)) {
                    return null;
                }

                /* if the object is an array and... */
                if (Array.isArray(source)) {
                    /* ... if it is an array of numbers ... */
                    if (source.every(isFinite)) {
                        /* ...so returning as a single array at position of [0],
                         * and all the elements are converted into a float */
                        return { data: [source.map(parseFloat)] };
                    }
                    /* ... if it is an array of arrays of numbers  */
                    else if (source.every(x => Array.isArray(x) && x.every(isFinite))) {
                        /* ..  so returning as multiple arrays, where every
                         * sub-element in conterted into a float */
                        return { data: source.map(x => x.map(parseFloat)) };
                    }
                }

                /* and the rest cases means that we have to iterate as over the
                 * usual object */
                let hasReturn  = false;
                let objectData = { children: {} };
                for (const key in source) {
                    /* try extract ... */
                    const result = extractImpl(source[key]);

                    /* ... and in case of success ... */
                    if (result) {
                        /* ... add the child */
                        objectData.children[key.toString()] = result;
                        hasReturn = true;
                    }
                }

                /* and if some children found, to returns the data, otherwise to
                 * return null */
                return hasReturn && objectData || null;
            };

            return extractImpl(object);
        },

        /**
         * Assigns data in a proper way, depending on input kind:
         *   - "0"/"FIRST"  assigns the passed value to the firstInputVectors
         *   - "1"/"SECOND" assigns the passed value to the secondInputVectors
         *   - "2"/"STEP"   moves firstInputVectors into secondInputVectors and
         *                  assigns the passed value into firstInputVectors
         *
         * DOES NOT ANY VALIDATION CHECK if the new Data. The validation is to
         * be performed on the caller side
         *
         * @param {object}  object   Object to assign
         * @param {object}  meta     Additional info about the object
         */
        assignInputDependingOnKind(object, meta) {
            /* if input data is empty, cannot work well */
            if (!this.inputData.length) {
                this.startNewComparison();
            }

            /* have to copy all of the properties from meta */
            const newValue = {
                meta:   meta,
                object: object
            };

            /* do actions, depending on selected kind */
            /* Using Vue.set, since vuew is not sensitive for changing value
             * property (not reactive) */
            if (STORE_INTO.FIRST.value === this.inputMenu.storeInto) {
                Vue.set(this.inputData[0], 'first', newValue);
            } else if (STORE_INTO.SECOND.value === this.inputMenu.storeInto) {
                Vue.set(this.inputData[0], 'second', newValue);
            } else if (STORE_INTO.STEP.value === this.inputMenu.storeInto) {
                Vue.set(this.inputData[0], 'second', this.inputData[0].first);
                Vue.set(this.inputData[0], 'first', newValue);
            }
        },

        /**
         * Processes the input:
         *  - Converts the passed string into json object
         *  - Extracts all the vectors from it
         *  - Updates the value (first/second) depending on menu switches and
         *
         * @param {string} input     JSON string
         * @param {object} meta      Additional info about the input
         */
        extractDataArraysFromJSONStringAndUseAsInput(input, meta) {
            const extracted = this.extractDataArrays(JSON.parse(input));
            this.assignInputDependingOnKind(extracted, meta);
        },

        /****************************************
         * HANDLING INPUT FROM FILE
         ***************************************/
        /**
         * Loads input data from file
         */
        retrieveInputContentsFromFile() {
            this.runAndShowMessageOnException(() => {
                const json = this.readFileAsJSON(this.inputMenu.fromFile.uploadedFile);
                this.assignInputDependingOnKind(this.extractDataArrays(json));
            });
        },

        /****************************************
         * HANDLING INPUT FROM SERVER
         ***************************************/
        /**
         * Gets the input data from server, but sending a request (with
         * user-specified text) to certain server
         *
         * Effectively calls fetch() and waits for the response.
         *
         * fetch(url, options) accepts 2 arguments, and as the first(url) the
         * server url (configured via server configuration menu) is passed. To
         * get the second(options), calls the function, specified as fuction
         * body (via server configuration menu). The input text (from the input
         * on the left) is passed into the function as "text" argument
         *
         * @param {*}    If true, user will be warned, if accepting the
         *                        data from the server will make the current
         *                        comparison improssible
         */
        retrieveInputContentsFromServer() {
            this.runAndShowMessageOnException(() => {
                this.showMessage(`Fetching new data from server, do not change input kind until the loading finished`, 'info');

                /* reset previous warnings */
                this.inputMenu.fromServer.fromServerWarn = null;

                /* fetch arguments */
                const url = this.appConfiguration.serverUrl;
                const opt = new Function('text', this.appConfiguration.requestOptions)(this.inputMenu.fromServer.textToSend);

                // DEBUG CODE
                // MUST BE REMVOED OR disabled
                //this.inputMenu.fromServer.responseContents = "[123.3, 32131.3]";
                //return;

                /* try fetch the data */
                fetch(url, opt).then(
                    /* successful case */
                    result => {
                        if (!result.ok) {
                            this.showMessage(`Http error ${result.status}, text '${result.statusText}'`, 'error');
                            return;
                        }

                        result.text().then(
                            /* success */
                            data => {
                                let meta = {
                                    url:      url.toString(),
                                    options:  JSON.stringify(opt),
                                    response: data
                                };

                                this.extractDataArraysFromJSONStringAndUseAsInput(data, meta);
                                this.showMessage(`Successfully received`, 'success');
                            },

                            /* error case */
                            error => {
                                this.showMessage(`Promise error '${error}'`, 'error');
                            }
                        )
                    },
                    /* error case */
                    error => {
                        this.showMessage(`Promise error '${error}'`, 'error');
                    }
                )
                .catch( err => {
                    this.showMessage(`Got an exception during processing ${err}`);
                })
            });
        },

        /**
         * Expands text to send into a new window
         */
        expandServerTextToSend() {
            this.$refs.largeTextInput.showWithTitle(
                'Text to send in request to server',
                this.inputMenu.fromServer.textToSend,
                (text) => { this.inputMenu.fromServer.textToSend = text }
            );
        },


        /****************************************
         * HANDLING MANUAL INPUT
         ***************************************/
        /**
         * Expands manual input text field
         */
        expandManualInput() {
            this.$refs.largeTextInput.showWithTitle(
                'Manual input',
                this.inputMenu.manual.inputJSON,
                (text) => { this.inputMenu.manual.inputJSON = text }
            );
        },

        /**
         * Loads the manually inputed JSON
         */
        loadManualInput() {
            this.runAndShowMessageOnException(() => {
                let meta = {
                    source:   "Manual input",
                    rawInput: this.inputMenu.manual.inputJSON
                };
                this.extractDataArraysFromJSONStringAndUseAsInput(this.inputMenu.manual.inputJSON, meta);
            });
        },

        /****************************************
         * SUPPORTING
         ***************************************/
        /**
         * Shows the provided text as a message (snack-bar) to a user in the
         * bottom of the screen. User may also specify
         *
         * @param {string} text     The shown message
         * @param {string} color    Color of the shown message, default 'info'
         *                          (blue)
         * @param {number} timeout  Duration (is milliseconds) the message
         *                          displayed, default 10000ms = 10s
         */
        showMessage(text, color = 'info', timeout = 10000) {
            console.log(`Showing of message was requested: [${color}] - ${text}`);

            this.notification.tmo = timeout;
            this.notification.text = text;
            this.notification.color = color;
            this.notification.enabled = true;
        },

        /**
         * Runs the provided function in a safe way:
         *   - No exceptions will be passed outside
         *   - If any exception will be generated by fx - it will be logged in
         *     message, but it will be suppressed
         *
         * @param {function} fx  funtion to run
         *
         * @returns The value returned by fx!
         */
        runAndShowMessageOnException(fx) {
            if (typeof fx === 'function') {
                try {
                    return fx();
                } catch (e) {
                    this.showMessage(`runAndShowMessageOnException(): The provided function failed with the exception '${e}'!`, 'error');
                }
            } else {
                this.showMessage(`runAndShowMessageOnException(): The provided object '${fx}' is not a function!`, 'error');
            }
        },
    },
    computed: {
        inputMenu__numberComparisonPrecision: {
            get() {
                return this.appConfiguration.numberComparisonPrecision.toString();
            },
            set(val) {
                this.appConfiguration.numberComparisonPrecision = Number.parseFloat(val);
            }
        }
    }
});
