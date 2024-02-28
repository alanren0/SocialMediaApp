import psycopg
import os

conn = psycopg.connect(dbname=os.environ['DB'],
                        host=os.environ['DB_HOST'],
                        user=os.environ['DB_USER'],
                        password=os.environ['DB_PASSWORD'],
                        port=os.environ['DB_PORT'])
