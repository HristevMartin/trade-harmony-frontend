# Build stage
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Runtime stage (nginx with template)
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
# Use your existing nginx.conf as a template
COPY nginx.conf /etc/nginx/templates/default.conf.template
ENV PORT=8080
EXPOSE 8080
CMD ["nginx","-g","daemon off;"]
