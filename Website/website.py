from flask import Flask, request, render_template, url_for, redirect
import json
import html2text
import requests
from threading import Thread


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
    i = 0
    while i < 8:
        print(i)
        try:
            if chromeData[i]['url'][:4] == 'http':
                html = requests.get(chromeData[i]['url'])
                html = html.text
                website_text.append([chromeData[i]['url'],
                                     h.handle(html).strip()])
                print(website_text)
            i += 1
        except Exception as e:
            print(e)
            i += 1
            pass

    return website_text


@app.route('/')
def index():

    return "Hello, World"

@app.route('/words')
def graph_words():
    try:
        print("test")
        website_text = get_chrome_text()
        print("Done")

    except Exception as e:
        print(str(e))
        pass

    #return render_template('output.html')
    return render_template('wordgraph.html', website_text=website_text )

@app.route('/numbers')
def graph_numbers():
    try:
        print("test")
        website_text = get_chrome_text()
        print("Done")

    except Exception as e:
        print(str(e))
        pass

    #return render_template('output.html')
    return render_template('circlechart.html', website_text=website_text )


if __name__ == "__main__":
    app.run()


