#for production should add a build script to package.json that 
#bundles the app efficiently, instead of dev script here

FROM node:latest

WORKDIR /app
COPY . /app

RUN apt-get update
RUN apt-get install -y python3 python3-pip

RUN pip install -r requirements.txt

RUN npm install

EXPOSE 8080

CMD ["npm", "run", "dev"]