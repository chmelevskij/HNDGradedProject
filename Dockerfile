FROM golang:1.10.2
EXPOSE 9090
WORKDIR /go/src/app
ADD . /go/src/app
RUN go get .
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o app .

FROM alpine:latest  
WORKDIR /root/
COPY --from=0 /go/src/app/app .
COPY --from=0 /go/src/app/public ./public
CMD ["./app"]  
