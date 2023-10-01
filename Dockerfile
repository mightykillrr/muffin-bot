FROM node

# Create app directory
WORKDIR /app

COPY package.json .

RUN yarn install

COPY . .

RUN npx prisma generate

CMD [ "yarn", "start:migrate:dev" ]
