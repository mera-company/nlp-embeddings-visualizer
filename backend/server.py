# Copyright 2020 MERA
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
# http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
# or implied. See the License for the specific language governing
# permissions and limitations under the License.
import collections

from deep_pavlov_wrapper import BertModel
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_json_schema import JsonSchema, JsonValidationError

app = Flask(__name__)
schema = JsonSchema(app)
CORS(app)

embedding_schema = {
    'type': 'object',
    'properties': {
        'text': {'type': 'string'}
    },
    'required': ['text'],
}

_model = None

def get_model():
    """Lazy loading of the model."""
    global _model
    if _model is None:
        _model = BertModel()
    return _model

@app.errorhandler(JsonValidationError)
def validation_error(e):
    return jsonify({
        'error': e.message,
        'errors': [validation_error.message for validation_error in e.errors]
    }), 400


@app.route("/embedding_generator", methods=["POST"])
@schema.validate(embedding_schema)
def embedding_generator():
    """Trainsform text to embedding."""
    request_data = request.get_json()
    text = request_data['text']
    emb = get_model().get_embeddings([text])
    for k, v in emb.items():
        emb[k] = v[0].tolist()
    return jsonify(emb), 200


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
