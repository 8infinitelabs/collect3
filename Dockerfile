ARG NETWORK="master-zen"
FROM ghcr.io/siafoundation/renterd:${NETWORK}

RUN apk update && apk --no-cache add curl
