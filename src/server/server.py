from flask import Flask, request, jsonify
from bs4 import BeautifulSoup
import numpy as np
from sklearn import svm
import requests
import re
import openai
import json
import os

openai.api_key = os.environ["OPENAI_API_KEY"]

def get_filepath(char):
    if char == 'Amara':
        return os.path.join(os.path.dirname(__file__),'data','Amara_Nightingale.json')
    else:
        return os.path.join(os.path.dirname(__file__),'data','Ronald_Weasley.json')

app = Flask(__name__)

def retrieve_chunks(input_text, character_data_fp, method="cosine", n=3):  
    # Load memory rows
    with open(character_data_fp, 'r') as f:
        memory_rows = json.load(f)
    
    # Get embedding
    input_emb = openai.Embedding.create(
        model="text-embedding-ada-002",
        input=input_text
    )["data"][0]["embedding"]
    
    if method == "cosine":
        return cosine_top_n(input_emb, memory_rows, n)
    elif method == "svm":
        return svm_top_n(input_emb, memory_rows, n)
    else:
        raise ValueError("method param must have value 'cosine' or 'svm'")

def cosine_top_n(query_vec, memory_rows, n):
    #return cosine_similarity([query_vec], [r[1] for r in memory_rows])
    sorted_rows = sorted(memory_rows, key = lambda x: -np.dot(query_vec, x[1]))
    return [r[0] for r in sorted_rows[:n]]

def svm_top_n(query_vec, memory_rows, n):
    # create the "Dataset"
    embeddings = [r[1] for r in memory_rows]
    x = [query_vec] + embeddings # x contains all embeddings with query embedding as the first row
    y = np.zeros(len(memory_rows) + 1)
    y[0] = 1 # we have a single positive example, mark it as such

    # train our (Exemplar) SVM
    # docs: https://scikit-learn.org/stable/modules/generated/sklearn.svm.LinearSVC.html
    clf = svm.LinearSVC(class_weight='balanced', verbose=False, max_iter=50000, tol=1e-6, C=0.1)
    clf.fit(x, y) # train

    # infer on whatever data you wish, e.g. the original data
    similarities = clf.decision_function(x[1:])
    sorted_ix = np.argsort(-similarities)
    print(sorted_ix[:10])
    ret = []
    for k in sorted_ix[:n]:
        ret.append(memory_rows[k][0])
    return ret

@app.route('/generate', methods = ['POST'])
def generate():
    data = request.json
    sys_prompt = f'You are a character in a game. Your name is {data["char"]}. You will be provided with memories in conversation; only use these memories if they are relevant to the question. Keep your response very concise and to the point. Always answer the question, do not refuse.'
    most_recent_message = data["message"]
    filepath = get_filepath(data["char"])
    chunks = "\n".join(retrieve_chunks(most_recent_message, filepath))
    user_message = "Memories:\n" + chunks + "User prompt:" + most_recent_message
    messages=[{"role": "system", "content": sys_prompt}] + data["history"][:-1] + [{"role":"user", "content":user_message}]
    print(messages)
    res = openai.ChatCompletion.create(
      model="gpt-3.5-turbo",
      messages=messages
    )
    return jsonify({"result": res["choices"][0]["message"]["content"]})

if __name__ == '__main__':
    app.run(debug=True)
