FROM node:jod

#MAINTAINER Ivan Font <ifont@redhat.com>
LABEL org.opencontainers.image.authors="ifont@redhat.com"

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Clone game source code
RUN git clone https://github.com/alantatwork/pacman.git .

# Install app dependencies
RUN npm install

# Expose port 8080
EXPOSE 8080

# Run container
CMD ["npm", "start"]
