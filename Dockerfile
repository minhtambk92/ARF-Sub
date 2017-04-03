FROM node:latest
MAINTAINER manhhailua
RUN mkdir -p /var/www/html
COPY . /var/www/html/
WORKDIR /var/www/html
RUN npm install
RUN npm run build
