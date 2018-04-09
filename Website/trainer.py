from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.naive_bayes import MultinomialNB
import pandas as pd
import json
import os

# with open("parsed.txt") as f:
# 	docs = json.loads(f.read())["results"]
# vectorizer = TfidfVectorizer(stop_words='english', min_df=1,max_df=0.8)
# word_vectors = vectorizer.fit_transform([x[0] for x in docs if len(x[0]) > 100])

# terms = vectorizer.get_feature_names()

# terms = [term for term in terms if term.isalpha()]

# counter = CountVectorizer(stop_words='english', vocabulary=terms)
# count_vectors = counter.fit_transform([x[0] for x in docs if len(x[0]) > 100])
# print(terms)
# counts = count_vectors.todense().sum(axis=0)
# #sorted_counts = counts.argsort()
# totals = []

# for i in range(counts.shape[1]):
# 	totals.append([terms[i], counts[0,i]])
# totals = sorted(totals, key=lambda x: x[1])[::-1]
# totals = [{"text": x[0], "size": x[1]} for x in totals]
# print(totals)
print(os.listdir("training_set"))

target = []
docs = []
for file in os.listdir("training_set"):
	with open("./training_set/" + file) as f:
		docs.append(f.read())
	target.append(file.split("_")[-1])
target = [tar[0] + tar[2] for tar in target]
print(len(target))
print(sum([1 if x == "R" else 0 for x in target]))

classes = set()
for t in target:
	classes.add(t)
classes = sorted(list(classes))

vectorizer = TfidfVectorizer(stop_words='english', min_df=2,max_df=0.8, ngram_range=(1,8))
convote_word_vectors = vectorizer.fit_transform(docs)
#serialize this vectorizer

classifier = MultinomialNB().fit(convote_word_vectors, target)
#serialize this classifer
test = ["We need to do a lot of things to amerliorate the human condition", "hello there buddy"]
vecs = vectorizer.transform(test)
pred = classifier.predict(vecs)
prob = classifier.predict_proba(vecs)
print(pred)
print(prob)
print(classes)
print([max(x)/sum(x) for x in prob])

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

print(totals)