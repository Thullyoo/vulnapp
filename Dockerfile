# =============================================================================
# Dockerfile PROPOSITALMENTE mal configurado para fins academicos (TCC).
# =============================================================================

FROM node:20-alpine

LABEL maintainer="tcc-devsecops@example.com"

RUN apk add --no-cache curl busybox-extras netcat-openbsd openssh

ENV JWT_SECRET=supersecret123
ENV DB_PASSWORD=P@ssw0rd_admin_2019
ENV ADMIN_API_KEY=sk_live_51Hc9F2KZ9Xh3fake_key_do_not_use
ENV NODE_ENV=production

WORKDIR /app

ADD http://example.com/ /app/setup.sh

COPY . .

RUN chmod -R 777 /app

RUN npm install --production=false

EXPOSE 22
EXPOSE 3000

CMD ["node", "app.js"]
