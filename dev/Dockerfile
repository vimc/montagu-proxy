FROM nginx:1.15

COPY nginx.conf /etc/nginx/nginx.conf
COPY nginx.montagu.conf /etc/nginx/conf.d/montagu.conf
COPY index.html /usr/share/nginx/html/index.html
COPY 404.html /usr/share/nginx/html/404.html
COPY resources /usr/share/nginx/html/resources

# Copy third party javascript from npm modules
ENV THIRDPARTY_JS_PATH /usr/share/nginx/html/resources/js/third_party/
COPY node_modules/pako/dist/pako.min.js $THIRDPARTY_JS_PATH
COPY node_modules/vue/dist/vue.min.js $THIRDPARTY_JS_PATH
COPY node_modules/jwt-decode/build/jwt-decode.min.js $THIRDPARTY_JS_PATH
COPY node_modules/jquery/dist/jquery.min.js $THIRDPARTY_JS_PATH

# Copy third party css from npm modules
COPY node_modules/bootstrap/dist/css/bootstrap.min.css /usr/share/nginx/html/resources/css/third_party/
COPY node_modules/bootstrap/dist/css/bootstrap.min.css.map /usr/share/nginx/html/resources/css/third_party/

RUN rm /etc/nginx/conf.d/default.conf

CMD exec nginx -g "daemon off;"