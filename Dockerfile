FROM node:lts-alpine
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/local/app

COPY . .

RUN npm config set registry https://registry.npmmirror.com/ && \
    npm install -g pnpm && \
    pnpm install
    
# 注意和 pm2.config.cjs 中 env 的 APP_PORT 保持一致
EXPOSE 8000

CMD ["npm", "run", "start"]
