
# Stage 1: Build React
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# API URL supplied at build time
ARG REACT_APP_API_URL=http://localhost/api
ENV REACT_APP_API_URL=$REACT_APP_API_URL

RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s \
  --start-period=10s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1:80/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
