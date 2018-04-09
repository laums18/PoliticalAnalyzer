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


def get_chrome_text():
    chromeData = json.load(open('chromeHistory.json', encoding="utf8"))
    h = html2text.HTML2Text()

    # Ignore converting links from HTML
    h.ignore_links = True
    h.ignore_images = True
    h.ignore_anchors = True
    h.skip_internal_links = True

    website_text = []
    for link in chromeData:
        try:
            if link['url'][:4] == 'http':
                html = requests.get(link['url'])
                html = html.text
                website_text.append([link['url'],
                                     h.handle(html).strip()])
                #print(website_text)
        except Exception as e:
            print(e)

    return website_text


@app.route('/')
def index():

    return "Hello, World"


@app.route('/words', methods=["POST"])
def graph_words():
    try:
        # with open("parsed.txt") as f:
        #     docs = json.loads(f.read())["results"]
        docs = get_chrome_text()
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
    hist = get_chrome_text()

    vecs = convote_vectorizer.transform([x[1] for x in hist if len(x[1]) > 50])
    pred = classifier.predict(vecs)
    prob = classifier.predict_proba(vecs)
    counts = prob.sum(axis=0)
    print(counts)
    print(counts.shape)
    totals = []
    print(counts[0])
    for i in range(counts.shape[0]):
        totals.append([classes[i], counts[i]])
    totals = sorted(totals, key=lambda x: x[1])[::-1]
    total_prob = sum([x[1] for x in totals])
    totals = [{"type": x[0], "value": float(x[1]) / total_prob * 100} for x in totals]

    return jsonify(dict(result=totals))
# @app.route('/words')
# def graph_words():
#     try:
#         print("test")
#         website_text = get_chrome_text()
#         print("Done")

#     except Exception as e:
#         print(str(e))
#         pass

#     #return render_template('output.html')
#     return render_template('wordgraph.html', website_text=website_text )

# @app.route('/numbers')
# def graph_numbers():
#     try:
#         print("test")
#         website_text = get_chrome_text()
#         print("Done")

#     except Exception as e:
#         print(str(e))
#         pass

#     #return render_template('output.html')
#     return render_template('circlechart.html', website_text=website_text )


if __name__ == "__main__":
    app.run()


