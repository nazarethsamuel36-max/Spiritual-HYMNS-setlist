# Chapter 2: Introduction

## 2.1 Background
Music plays a vital role in congregational worship. However, managing a library of hundreds of songs across different keys and languages is a significant logistical challenge. Paper songbooks are difficult to update, and static PDFs do not allow for flexible key changes during rehearsals or live performances.

## 2.2 Problem Statement
The current digital solutions for song management often fail in the following areas:
- Chord Drift: On different screen sizes, the spaces used to position chords over lyrics shift, causing the chords to land over the wrong words.
- Language Barriers: Bilingual congregations need to see songs in both their native script and Roman transliteration for non-native speakers.
- Key Constraints: Transposing a song manually is error-prone and time-consuming for musicians.

## 2.3 Objectives
The primary objectives of this project are:
1. To develop a relational database to store songs with structured metadata (number, title, artist, language).
2. To implement a chord parsing system that can read traditional "two-line" formats and convert them into a structured character-anchored format.
3. To create a responsive rendering engine that preserves chord alignment on mobile devices.
4. To provide a multi-language search capability that handles phonetic variations and language-specific scripts.
5. To enable real-time transposition of song keys.

## 2.4 Scope
The system focuses on the frontend display and backend management of song data. It includes features for song retrieval, search, setlist management (performance mode), and live transposition. While it handles audio URLs for reference, it is primarily a visual tool for musicians.

## 2.5 Methodology
The project follows a Modified Waterfall Model with iterative testing of the rendering engine. The core logic for chord alignment and search ranking was developed through multiple research spikes to ensure mathematical accuracy in transposition and linguistic accuracy in search results.

