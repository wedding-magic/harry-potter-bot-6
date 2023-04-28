# script for scraping text from harry potter wiki page to provide character memories

import requests
from bs4 import BeautifulSoup
import re
import openai
import json

# Request the webpage
url = 'https://harrypotter.fandom.com/wiki/Ronald_Weasley'  # Replace with the URL you want to scrape
response = requests.get(url)

# Clean text
def clean(text):
    return re.sub(r"\[\d+\]", "", text)

# Check if the request was successful
if response.status_code == 200:
    # Parse the HTML content
    soup = BeautifulSoup(response.content, 'html.parser')

    # Find the main div
    main_div = soup.find('div', {'class': 'mw-parser-output'})

    if main_div:
        # Extract text content from pi-item and p tags
        sections = main_div.find_all('section', {'class': 'pi-item pi-group pi-border-color'})
        paragraphs = main_div.find_all('p', attrs={'class': None}, recursive=False)

        # Add to list the text content
        text_content = [clean(section.text) for section in sections] + [clean(p.text) for p in paragraphs]
    
        # Remove short chunks
        text_content = [t for t in text_content if len(t) > 100]
    
    else:
        print("Could not find the 'mw-parser-output' div.")
else:
    print(f"Failed to fetch webpage. Status code: {response.status_code}")

# Construct rows with text and embedding columns
rows = []

for t in text_content:
    emb = openai.Embedding.create(
        model="text-embedding-ada-002",
        input=t
    )
    rows.append((t, emb["data"][0]["embedding"]))

with open('Ronald_Weasley.json', 'w') as f:
    json.dump(rows, f)