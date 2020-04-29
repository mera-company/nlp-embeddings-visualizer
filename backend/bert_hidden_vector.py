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
from deeppavlov.models.bert.bert_classifier import BertClassifierModel


class BertClassifierModelHiddenVector(BertClassifierModel):

    def __call__(self, features, pooled_output=False, embedding_output=False):
        """Make prediction for given features (texts).
        Args:
            features: batch of InputFeatures
        Returns:
            predicted classes or probabilities of each class
        """
        input_ids = [f.input_ids for f in features]
        input_masks = [f.input_mask for f in features]
        input_type_ids = [f.input_type_ids for f in features]

        # Create output mapping
        outputs_map = collections.OrderedDict()
        if not self.return_probas:
            outputs_map['pred'] = self.y_predictions
        else:
            outputs_map['pred'] = self.y_probas

        # Fill additional data from BERT
        if pooled_output:
            outputs_map['pooled_output'] = self.bert.get_pooled_output()
        if embedding_output:
            outputs_map['input_embeddings'] = self.bert.get_embedding_output()

        feed_dict = self._build_feed_dict(input_ids, input_masks, input_type_ids)

        values = self.sess.run(list(outputs_map.values()), feed_dict=feed_dict)

        output = {}
        for k, v in zip(outputs_map, values):
            output[k] = v

        return output
