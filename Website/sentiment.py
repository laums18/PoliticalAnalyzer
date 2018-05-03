"""Demonstrates how to make a simple call to the Natural Language API."""

import argparse
import requests

from google.cloud import language
from google.cloud.language import enums
from google.cloud.language import types
from google.oauth2 import service_account
import html2text

credentials = service_account.Credentials.from_service_account_file(
        'google.json')

def get_result(annotations):
    score = annotations.document_sentiment.score
    magnitude = annotations.document_sentiment.magnitude

    # for index, sentence in enumerate(annotations.sentences):
    #     sentence_sentiment = sentence.sentiment.score
    #     print('Sentence {} has a sentiment score of {}'.format(
    #         sentence.text, sentence_sentiment))

    # print('Overall Sentiment: score of {} with magnitude of {}'.format(
    #     score, magnitude))
    return score, magnitude


def analyze(string, typ=enums.Document.Type.PLAIN_TEXT):
    """Run a sentiment analysis request on text within a passed filename."""
    client = language.LanguageServiceClient(credentials=credentials)


    document = types.Document(
        content=string,
        type=typ)
    annotations = client.analyze_sentiment(document=document)

    # Print the results
    return get_result(annotations)


if __name__ == '__main__':
    print(dir(enums.Document.Type))
    url = "https://www.gwhatchet.com/2018/04/12/sisters-develop-app-to-empower-women-with-positive-messages/"
    text = requests.get(url).text
    h = html2text.HTML2Text()

    # Ignore converting links from HTML
    h.ignore_links = True
    h.ignore_images = True
    h.ignore_anchors = True
    h.skip_internal_links = True

    analyze(h.handle(text).strip().replace("\n", " "), enums.Document.Type.PLAIN_TEXT)
