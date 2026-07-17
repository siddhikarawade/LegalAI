# ⚖️ AI-Enabled Legal Case Classification & Prioritization System for Indian Judiciary

> **Accelerating Justice with Artificial Intelligence**

An AI-powered legal intelligence platform designed to assist the **Indian Judiciary** by automatically classifying legal cases, 
generating summaries, retrieving similar precedents, and prioritizing cases based on urgency using Natural Language Processing (NLP), 
Machine Learning, and Large Language Models (LLMs).

---

## 📖 Overview

The Indian judicial system faces millions of pending cases, resulting in delayed justice and increased workload for legal professionals.

This project provides an intelligent AI-driven solution that automates:

- 📂 Legal Case Classification
- 📑 AI Case Summarization
- ⚡ Case Prioritization
- 🔍 Semantic Precedent Search
- 📊 Interactive Judicial Dashboard

The system reduces manual effort while helping judges, advocates, registry staff, and litigants make faster and more informed decisions.

---

## 🚀 Key Features

### 📄 OCR-Based Document Processing
- Extracts text from scanned PDFs and images
- Supports digital PDF documents
- Automatic preprocessing and cleaning

### ⚖️ Legal Case Classification
- Classifies legal documents into:
  - Criminal
  - Civil
  - Constitutional
  - Administrative
- Uses **Legal-BERT**

### 📝 AI Summarization
Generates concise legal summaries using:
- BART
- Qwen 2.5-7B

Includes:
- Parties involved
- Facts
- Claims
- Timeline
- Relief sought
- Final judgement summary

### 🔍 Semantic Precedent Search
- Finds similar previous judgments
- Uses Sentence-BERT embeddings
- FAISS vector similarity search

### ⚡ Intelligent Case Prioritization

Assigns priority based on:

- Case Age
- Severity
- Sentiment
- AI Confidence

Priority Levels:

- 🔴 Highly Urgent
- 🟠 High
- 🟡 Medium
- 🟢 Routine

### 📊 Interactive Dashboard

Provides:

- Case Timeline
- Priority Analytics
- Case Status
- AI Summary
- Document Viewer

---

## 🏗 System Architecture

<img width="972" height="484" alt="image" src="https://github.com/user-attachments/assets/8e9b594a-9e12-405f-a6bf-93648138e47e" />

---

## 🧠 AI Models Used

| Model | Purpose |
|---------|----------|
| Legal-BERT | Legal document classification |
| Sentence-BERT | Semantic embeddings |
| FAISS | Similarity search |
| BART | Abstractive summarization |
| Qwen 2.5-7B | Structured legal summaries |
| VADER | Sentiment analysis |
| Regression Model | Priority prediction |

---

## 🛠 Tech Stack

### Frontend

- React.js
- TypeScript
- Tailwind CSS
- Chart.js

### Backend

- Flask
- Python
- REST APIs

### Database

- PostgreSQL

### NLP & AI

- HuggingFace Transformers
- Legal-BERT
- Sentence-BERT
- spaCy
- NLTK
- FAISS
- BART
- Qwen 2.5-7B
- VADER

### OCR

- Tesseract OCR
- PyMuPDF

---

## 🎯 Conclusion

The **AI-Enabled Legal Case Classification and Prioritization System** demonstrates how Artificial Intelligence can enhance judicial workflows by automating legal document analysis, case classification, summarization, precedent retrieval, and priority prediction. By combining modern web technologies with advanced NLP models, the system aims to reduce manual effort, improve decision-making, and contribute towards a more efficient, transparent, and accessible judicial process.

---
