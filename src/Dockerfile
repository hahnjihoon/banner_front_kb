# 1단계: Node 이미지로 프론트 빌드
FROM node:18 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# 2단계: Nginx로 정적 파일 서비스
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html