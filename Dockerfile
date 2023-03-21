FROM node:16

LABEL maintainer george.oremo@gmail.com for empservices.co.ke

# RUN git clone git@github.com:corpdesk/cd-api.git
RUN git clone https://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:@github.com/corpdesk/cd-api.git

WORKDIR cd-api

RUN cd sdk & sh docker-get-started.sh && cd ../ && npm install

CMD ["npm","start"]

RUN sleep 20 && sh sdk/curl-test.sh
