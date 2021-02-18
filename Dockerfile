FROM node:12.14.1
MAINTAINER XD(xd@heidianer.com)

RUN mkdir /workspace/ -p
COPY . /workspace/
WORKDIR /workspace/

# RUN npm config set registry http://nexus.daocloud.io/repository/daocloud-npm
RUN npm install

RUN npm run build:h5
