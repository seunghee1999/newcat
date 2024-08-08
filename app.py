from flask import Flask, jsonify, render_template
import requests
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.decomposition import LatentDirichletAllocation

app = Flask(__name__)

# 뉴스 데이터 수집
def fetch_news():
    url = "https://newsapi.org/v2/top-headlines?country=kr&apiKey=3918c16e61b94990960da32b20800426"
    response = requests.get(url)
    if response.status_code != 200:
        print(f"Failed to fetch news: {response.status_code}")
        return []
    
    articles = response.json().get('articles', [])
    documents = []
    for article in articles:
        title = article.get('title', '')
        description = article.get('description', '')
        if title:
            documents.append(f"{title} {description}")
        print(f"Title: {title}, Description: {description}")
    
    return documents

# 데이터 전처리 함수
def preprocess_documents(documents):
    preprocessed_docs = []
    for doc in documents:
        # 공백 제거
        doc = doc.strip()
        # 유효한 텍스트만 추가
        if len(doc) > 10:  # 최소 길이 설정
            preprocessed_docs.append(doc)
    return preprocessed_docs

# TF-IDF 및 LDA를 사용한 주제 추출
def extract_topics(documents, n_topics=5):
    documents = preprocess_documents(documents)
    if not documents:
        return [{"title": "No topics available", "words": ""}]
    
    vectorizer = TfidfVectorizer(stop_words='english')
    try:
        dtm = vectorizer.fit_transform(documents)
    except ValueError:
        return [{"title": "No topics available", "words": ""}]
    
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
    if not documents:
        return jsonify([{"title": "No topics available", "words": ""}])
    
    topics = extract_topics(documents)
    return jsonify(topics)

if __name__ == '__main__':
    app.run(debug=True)
