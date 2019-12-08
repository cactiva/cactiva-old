FROM node:stretch

# Create Directory for the Container
RUN apt-get update
RUN apt-get install software-properties-common -y
RUN apt-add-repository ppa:fish-shell/release-3 -y
RUN apt-get install fish -y
RUN curl -L github.com/oh-my-fish/oh-my-fish/raw/master/bin/install > install
RUN chmod +x install
RUN ./install --noninteractive
RUN chmod +x /root/.local/share/omf
RUN /root/.local/share/omf install scorphish
ENV TZ=Asia/Jakarta
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone
RUN mkdir /usr/src/app

# Install all Packages
RUN apt-get install -y yarn nano vi

RUN mkdir -p /usr/src/raw
WORKDIR /usr/src/raw
ADD . /usr/src/raw

RUN echo "export const mode = 'production';" > "./src/env.js"   
RUN yarn
RUN yarn build
WORKDIR /usr/src/raw/server

RUN yarn
RUN rm -rf res
RUN mkdir res
RUN mv ../build res/public

CMD [ "yarn", "start" ]
EXPOSE 8080