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
from deeppavlov.models.preprocessors.bert_preprocessor import BertPreprocessor
from bert_hidden_vector import BertClassifierModelHiddenVector

class BertModel:
    def __init__(self):
        DEFAULT_NUMBER_OF_CLASSES = 2

        self.bert_preprocessor = BertPreprocessor(
            vocab_file     = "cased_L-12_H-768_A-12/vocab.txt",
            do_lower_case  = False,
            max_seq_length = 64)

        print("creating classifier")
        self.bert_classifier = BertClassifierModelHiddenVector(
            n_classes                   = DEFAULT_NUMBER_OF_CLASSES,
            return_probas               = True,
            one_hot_labels              = True,
            bert_config_file            = "cased_L-12_H-768_A-12/bert_config.json",
            pretrained_bert             = "cased_L-12_H-768_A-12/bert_model.ckpt",
            keep_prob                   = 0.5,
            learning_rate               = 1e-05,
            learning_rate_drop_patience = 5,
            learning_rate_drop_div      = 2.0,
            save_path                   = "./dummy_save_path"
        )

    def get_embeddings(self, data_raw, pooled_output=True, embedding_output=True):
        data = self.bert_preprocessor(data_raw)
        out = self.bert_classifier(data, pooled_output=pooled_output, embedding_output=embedding_output)
        del out['pred']
        return out

if __name__ == '__main__':
    raise NotImplementedError("This stuff is not supported for this version of debugger...");
