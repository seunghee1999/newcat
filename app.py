from flask import Flask, jsonify, render_template
import requests
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.decomposition import LatentDirichletAllocation

app = Flask(__name__)

# NewsAPI 키 설정
API_KEY = '3918c16e61b94990960da32b20800426'

# 뉴스 데이터 수집
def fetch_news():
    url = f"https://newsapi.org/v2/top-headlines?country=kr&apiKey={API_KEY}"
    response = requests.get(url)
    
    if response.status_code == 200:
        articles = response.json().get('articles', [])
        return [article['title'] + ' ' + article['description'] for article in articles if article['description']]
    else:
        print("Error fetching news:", response.status_code)
        return []

# TF-IDF 및 LDA를 사용한 주제 추출
def extract_topics(documents, n_topics=5):
    vectorizer = TfidfVectorizer(stop_words='english')
    dtm = vectorizer.fit_transform(documents)
    
    lda = LatentDirichletAllocation(n_components=n_topics, random_state=42)
    lda.fit(dtm)
    
    topics = []
    for index, topic in enumerate(lda.components_):
        topic_words = [vectorizer.get_feature_names_out()[i] for i in topic.argsort()[-10:]]
        topics.append({"title": f"Topic {index+1}", "words": ' '.join(topic_words)})
    return topics

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/api/topics', methods=['GET'])
def get_topics():
    documents = fetch_news()
    topics = extract_topics(documents)
    return jsonify(topics)

if __name__ == '__main__':
    app.run(debug=True)
