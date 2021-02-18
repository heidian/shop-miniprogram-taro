FROM node:12.14.1
MAINTAINER XD(xd@heidianer.com)

RUN mkdir /workspace/ -p
COPY . /workspace/
WORKDIR /workspace/

RUN rm .npmrc

# RUN npm config set registry http://nexus.daocloud.io/repository/daocloud-npm
RUN npm install
RUN npm install -g @tarojs/cli@3.0.9
RUN npm run build:h5
