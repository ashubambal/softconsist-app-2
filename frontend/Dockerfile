FROM nginx:alpine

# remove default config
RUN rm /etc/nginx/conf.d/default.conf

# add our nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# copy frontend files
COPY src /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

