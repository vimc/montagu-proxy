FROM nginx:1.13

COPY nginx.conf /etc/nginx/nginx.conf
COPY nginx.montagu.conf /etc/nginx/conf.d/montagu.conf
COPY index.html /usr/share/nginx/html/index.html

WORKDIR /app
COPY entrypoint.sh .

ENTRYPOINT /app/entrypoint.sh