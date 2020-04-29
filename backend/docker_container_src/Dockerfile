FROM tensorflow/tensorflow:1.15.2-py3

RUN apt-get update -y \
    && apt-get install -y \
      git \
      wget \
      zip \
    && rm -rf /var/lib/apt/lists

COPY docker_container_src/requirements.txt /tmp/requirements.txt
RUN pip3 install -r /tmp/requirements.txt --no-cache

RUN python3 -m deeppavlov install paraphraser_rubert

RUN wget -q https://storage.googleapis.com/bert_models/2018_10_18/cased_L-12_H-768_A-12.zip
RUN mkdir /app/
RUN unzip cased_L-12_H-768_A-12.zip -d /app/
COPY BERT_LICENSE /app/LICENSE

COPY *.py /app/
WORKDIR /app
CMD python3 server.py
