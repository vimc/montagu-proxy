ARG MONTAGU_GIT_ID="UNKNOWN"
FROM vimc/montagu-reverse-proxy-shared-build-env:$MONTAGU_GIT_ID

ARG MONTAGU_GIT_BRANCH="UNKNOWN"

ENV MONTAGU_GIT_ID=$MONTAGU_GIT_ID
ENV MONTAGU_GIT_BRANCH=$MONTAGU_GIT_BRANCH

RUN rm /workspace/Dockerfile
COPY dev/Dockerfile /workspace/Dockerfile
COPY dev/nginx.minimal.conf /workspace/nginx.montagu.conf

CMD ./dev/build-minimal-image.sh $MONTAGU_GIT_BRANCH $MONTAGU_GIT_ID
