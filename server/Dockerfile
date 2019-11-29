FROM node:stretch

# https://stackoverflow.com/questions/55763428/react-native-error-enospc-system-limit-for-number-of-file-watchers-reached
RUN echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf && sudo sysctl -p
RUN cat /proc/sys/fs/inotify/max_user_watches
RUN fs.inotify.max_user_watches=524288

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