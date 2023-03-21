FROM node:16

LABEL maintainer george.oremo@gmail.com for empservices.co.ke

# RUN git clone git@github.com:corpdesk/cd-api.git
RUN git clone https://{token}:@github.com/corpdesk/cd-api.git

WORKDIR cd-api

RUN sh sdk/docker-get-started.sh && npm install

CMD ["npm","start"]

RUN sleep 20 && sh sdk/curl-test.sh
