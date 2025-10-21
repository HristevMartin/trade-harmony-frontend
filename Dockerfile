# Build stage
FROM node:18-alpine AS build
WORKDIR /app

# Accept build arguments
ARG VITE_API_URL
ARG VITE_STRIPE_PUBLIC_KEY

# Set them as environment variables for the build
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_STRIPE_PUBLIC_KEY=$VITE_STRIPE_PUBLIC_KEY

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
