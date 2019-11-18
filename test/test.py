#!/usr/bin/python

import requests
import uuid
import random





f = open("names.db", "r")

for i in range(50):
    f.seek(0)
    for line in f:
        username = line.strip()
        obj = {
                "username": username,
                "active": random.randint(0,2) - 1
        };
        requests.post('http://localhost:3000/', json=obj);

