FROM postgres:15

COPY something.sql /docker-entrypoint-initdb.d/
