from flask import Flask, request, render_template, url_for, redirect, jsonify
import json
import html2text
import requests
from threading import Thread
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.naive_bayes import MultinomialNB
import pandas as pd
import os
from bs4 import BeautifulSoup, SoupStrainer
from pymongo import MongoClient
import re
import sentiment
import time

client = MongoClient()
client = MongoClient('localhost', 27017)
db = client['web_history_data']

target = []
docs = []
for file in os.listdir("training_set"):
    with open("./training_set/" + file) as f:
        docs.append(f.read())
    target.append(file.split("_")[-1])
target = [tar[0] for tar in target]
# print(len(target))
# print(sum([1 if x == "R" else 0 for x in target]))
classes = set()
for t in target:
    classes.add(t)
classes = sorted(list(classes))
convote_vectorizer = TfidfVectorizer(stop_words='english', min_df=0,max_df=0.8, ngram_range=(1,8))
convote_word_vectors = convote_vectorizer.fit_transform(docs)
classifier = MultinomialNB().fit(convote_word_vectors, target)

def classifyForDB(parent_data):
    vecs = convote_vectorizer.transform([parent_data[1]])
    pred = classifier.predict(vecs)
    prob = classifier.predict_proba(vecs)
    counts = prob.sum(axis=0)
    #print(counts)
    #print(counts.shape)
    totals = []
    #print(counts[0])
    for i in range(counts.shape[0]):
        totals.append([classes[i], counts[i]])
    totals = sorted(totals, key=lambda x: x[1])[::-1]
    total_prob = sum([x[1] for x in totals])
    totals = [{"type": x[0], "value": float(x[1]) / total_prob * 100} for x in totals]
    for i in range(len(totals)):
        if totals[i]["type"] == "R":
            totals[i]["color"] = "#E91D0E"
        elif totals[i]["type"] == "D":
            totals[i]["color"] = "#232066"
        else:
            totals[i]["color"] = "#a0a5b2"

    return totals


def getUrls(urls, depth):
    h = html2text.HTML2Text()

    # Ignore converting links from HTML
    h.ignore_links = True
    h.ignore_images = True
    h.ignore_anchors = True
    h.skip_internal_links = True
    blacklist = ["google.com", "w3.org", "slack.com", "stackexchange", "github"]
    for url in urls:
        url = url.split("?")[0].split("#")[0]
        try:
            exit = False
            for bad in blacklist:
                if bad in url:
                    exit = True
                    break
            if exit:
                continue
            query = db.webtext.find({"parent_url": url})
            if(query.count() == 0):
                child_links = []
                if url[:4] == 'http':
                    html = requests.get(url)
                    html = html.text
                    parent_html = str(html);
                    plain_text = h.handle(html).strip()
                else: 
                    continue
                print("Adding " + url)
                
                soup = BeautifulSoup(html, "html.parser")
                children = set()
                for childLink in soup.findAll('a'):
                    if childLink.get('href') is not None and childLink.get('href')[:4] == 'http':
                        if childLink.get('href').count("/") > 4 or ".html" in childLink.get('href'):
                            children.add(childLink.get('href').split("?")[0].split("#")[0])

                update_query = {'parent_url': url}
                class_data = classifyForDB([url, plain_text])
                # sent, magnitude = sentiment.analyze(plain_text)
                # if sent is None or magnitude is None:
                #     raise("Google analysis down")
                sentiment = None
                magnitude = None
                post_data = {
                    'parent_url': url,
                    'parent_text': plain_text,
                    'parent_html': parent_html,
                    'classify_data': class_data,
                    'sentiment': sentiment,
                    'magnitude': magnitude,
                    'child_links': list(children),
                    'depth': depth + 1,
                    'searched': False
                    }

                result = db.webtext.update(update_query, post_data, upsert=True)
                print("Added " + url + " successfully")
        except Exception as e:
            print("ERROR at " + url)
            print(e)

DEPTH = 3
while True:
    query = db.webtext.find({"searched": False, "depth": { "$lt": DEPTH }})
    if query.count() > 0:
        site = query.next()
        getUrls(site["child_links"], site["depth"])
        res = db.webtext.update({"parent_url": site["parent_url"]}, {"$set": {"searched": True}})
    else:
        print("DONE AT DEPTH" + DEPTH)
