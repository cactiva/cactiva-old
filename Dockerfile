FROM node:stretch

# Create Directory for the Container
RUN apt-get update
RUN apt-get install software-properties-common -y
RUN apt-add-repository ppa:fish-shell/release-3 -y
RUN apt-get install fish -y
ENV TZ=Asia/Jakarta
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone
RUN mkdir /usr/local/bin/app

# Install all Packages
RUN apt-get install -y yarn

RUN mkdir -p /usr/src/app/raw
WORKDIR /usr/src/app/raw
ADD . /usr/src/app/raw

RUN echo "export const mode = 'production';" > "./src/env.js"   
RUN yarn
RUN yarn build
WORKDIR /usr/src/app/raw/server
RUN rm -rf res
RUN mkdir res
RUN mv ../build res/public

CMD [ "yarn", "start" ]
EXPOSE 8080