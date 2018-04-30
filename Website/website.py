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

client = MongoClient()
client = MongoClient('localhost', 27017)
db = client['web_history_data']

target = []
docs = []
for file in os.listdir("training_set"):
    with open("./training_set/" + file) as f:
        docs.append(f.read())
    target.append(file.split("_")[-1])
target = [tar[0] + tar[2] for tar in target]
# print(len(target))
# print(sum([1 if x == "R" else 0 for x in target]))
classes = set()
for t in target:
    classes.add(t)
classes = sorted(list(classes))
convote_vectorizer = TfidfVectorizer(stop_words='english', min_df=2,max_df=0.8, ngram_range=(1,8))
convote_word_vectors = convote_vectorizer.fit_transform(docs)
classifier = MultinomialNB().fit(convote_word_vectors, target)


app = Flask(__name__)


def loadDB(link):

    h = html2text.HTML2Text()
    link = link[0]
    print(link)

    # Ignore converting links from HTML
    h.ignore_links = True
    h.ignore_images = True
    h.ignore_anchors = True
    h.skip_internal_links = True

    website_text = []

    try:
        child_links = []
        if link[:4] == 'http':
            html = requests.get(link)
            html = html.text
            website_text.append([link, h.handle(html).strip()])
        
        soup = BeautifulSoup(html, "html.parser")
        for childLink in soup.findAll('a'):
            if childLink.get('href')[:4] == 'http':
                child_links.append(childLink.get('href'))

        update_query = {'parent_url': link}
        class_data = classifyForDB(website_text)
        post_data = {
            'parent_url': link,
            'parent_text': h.handle(html).strip(),
            'classify_data': class_data,
            'child_links': child_links
            }

        result = db.webtext.update(update_query, post_data, upsert=True)
        print(result)

    except Exception as e:
        print(e)

    return website_text


def initialLoadDB(history):

    chromeData = history
    h = html2text.HTML2Text()

    # Ignore converting links from HTML
    h.ignore_links = True
    h.ignore_images = True
    h.ignore_anchors = True
    h.skip_internal_links = True

    website_text = []

    for link in chromeData:
        try:
            if(db.webtext.find({"parent_url": link['url']}).count() == 0):
                child_links = []
                if link['url'][:4] == 'http':
                    html = requests.get(link['url'])
                    html = html.text
                    website_text.append([link['url'],
                                         h.handle(html).strip()])
                
                soup = BeautifulSoup(html, "html.parser")
                for childLink in soup.findAll('a'):
                    if childLink.get('href')[:4] == 'http':
                        child_links.append(childLink.get('href'))

                update_query = {'parent_url': link['url']}
                class_data = classifyForDB(website_text)
                post_data = {
                    'parent_url': link['url'],
                    'parent_text': h.handle(html).strip(),
                    'classify_data': class_data,
                    'child_links': child_links
                    }

                result = db.webtext.update(update_query, post_data, upsert=True)

                print(result)
            else:
                print("Getting initial Chrome History")
                continue

        except Exception as e:
            print(e)


    return website_text


def get_parent_urls():
    
    output_array = []

    cursor1 = db.webtext.find()
    for record in cursor1:
        output_array.append([record["parent_url"],
                record["parent_text"]])

    return output_array


def get_child_urls():
    
    output_array = []

    # cursor1 = db.webtext.find()
    # for record in cursor1:
    #     output_array.append([record["parent_url"],
    #             record["parent_text"]])

    return output_array

def checkBiasNum():

    #[{'type': 'DN', 'value': 48.99883598238837}, {'type': 'RY', 'value': 48.09736113652237}, {'type': 'DY', 'value': 1.7911670583166328}, {'type': 'RN', 'value': 0.9558035562277896}, {'type': 'IN', 'value': 0.082712215167099}, {'type': 'IY', 'value': 0.07412005137773517}]
    # -10 is Dem, +10 is Repub, 0 is Indep

    totals = classifyForIcon()
    dem_no = totals[0]['value']
    rep_yes = totals[1]['value']
    dem_yes = totals[2]['value']
    rep_no = totals[3]['value']
    ind_no = totals[4]['value']
    ind_yes = totals[5]['value']

    right_lean = dem_no + rep_yes + ind_no
    left_lean = dem_yes + rep_no + ind_no
    indep = ind_yes

    if((right_lean > left_lean) and (right_lean > indep)):
        output = right_lean / 10
    elif((left_lean > right_lean) and (left_lean > indep)):
        output = -(left_lean / 10)
    elif((indep > right_lean) and (indep > indep)):
        output = indep / 10

    return output


@app.route('/')
def index():

    return "Hello, World"


@app.route('/receiver', methods = ['POST'])
def receiver():
    
    newLink = json.loads(request.form.get("history", "[]"))
    
    if(db.webtext.find({"parent_url": newLink}).count() == 0):
        history = json.loads(request.form.get("history", "[]"))
        loadDB(history)
    
    biasNum = checkBiasNum()
    print(biasNum)
    return jsonify(dict(result = biasNum))


@app.route('/initialUpdate', methods = ['POST'])
def initialUpdate():
        
    history = json.loads(request.form.get("history", "[]"))
    print(history)
    initialLoadDB(history)
    return jsonify(dict(result = "success"))


@app.route('/words', methods=["POST"])
def graph_words():
    try:
        # with open("parsed.txt") as f:
        #     docs = json.loads(f.read())["results"]
        docs = get_parent_urls()
        vectorizer = TfidfVectorizer(stop_words='english', min_df=1,max_df=0.8)
        word_vectors = vectorizer.fit_transform([x[0] for x in docs if len(x[0]) > 100])

        terms = vectorizer.get_feature_names()

        terms = [term for term in terms if term.isalpha()]

        counter = CountVectorizer(stop_words='english', vocabulary=terms)
        count_vectors = counter.fit_transform([x[0] for x in docs if len(x[0]) > 100])
        print(terms)
        counts = count_vectors.todense().sum(axis=0)
        #sorted_counts = counts.argsort()
        totals = []

        for i in range(counts.shape[1]):
            totals.append([terms[i], counts[0,i]])
        totals = sorted(totals, key=lambda x: x[1])[::-1]
        totals = [{"text": x[0], "size": int(x[1])} for x in totals]
        return jsonify(dict(result=totals))
    except Exception as e:
        return jsonify(dict(Error=str(e)))


@app.route('/classify', methods=["POST"])
def classify():
    hist = get_parent_urls()

    vecs = convote_vectorizer.transform([x[1] for x in hist if len(x[1]) > 50])
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

    return jsonify(dict(result=totals))


def classifyForIcon():
    hist = get_parent_urls()

    vecs = convote_vectorizer.transform([x[1] for x in hist if len(x[1]) > 50])
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

    return totals

def classifyForDB(parent_data):
    hist = parent_data

    vecs = convote_vectorizer.transform([x[1] for x in hist if len(x[1]) > 50])
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

    return totals

if __name__ == "__main__":
    app.run(threaded=True)
    
