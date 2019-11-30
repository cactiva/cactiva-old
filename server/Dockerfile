FROM node:stretch

# Create Directory for the Container
WORKDIR /usr/src/app
RUN apt-get update
RUN apt-get install software-properties-common -y
RUN apt-add-repository ppa:fish-shell/release-3 -y
RUN apt-get install fish -y
ENV TZ=Asia/Jakarta
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone
RUN mkdir /usr/local/bin/app

# Install all Packages
RUN apt-get install -y yarn
ADD . /usr/src/app

RUN yarn global add expo-cli
RUN yarn

CMD [ "yarn", "start" ]
EXPOSE 8080