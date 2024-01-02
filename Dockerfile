FROM node:latest

WORKDIR /backend

ENV AWS_REGION=us-east-2
ENV AWS_SECRET=prod-node-backend

COPY ./package.json .

RUN npm install
RUN npm install aws-sdk

COPY . .

EXPOSE 3001

CMD ["sh", "-c", "node secrets.cjs && npm start"]
