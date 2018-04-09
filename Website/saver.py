import json
import html2text
import requests

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

    with open("parsed.txt", "w") as f:
        f.write(json.dumps(dict(results=website_text)))
if __name__ == "__main__":
    get_chrome_text()